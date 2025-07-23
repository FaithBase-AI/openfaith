import { Activity, Workflow } from '@effect/workflow'
import { ExternalLinkManager } from '@openfaith/adapter-core/layers/externalLinkManager'
import { TokenKey } from '@openfaith/adapter-core/server'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { ExternalLinkManagerLive } from '@openfaith/server/live/externalLinkManagerLive'
import { PcoApiLayer } from '@openfaith/server/live/pcoApiLive'
import { singularize } from '@openfaith/shared/string'
import { Effect, pipe, Record, Schema } from 'effect'
import { ofLookup } from '../helpers/ofLookup'

// Define the external sync entity error
class ExternalSyncEntityError extends Schema.TaggedError<ExternalSyncEntityError>(
  'ExternalSyncEntityError',
)('ExternalSyncEntityError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const ExternalSyncEntityPayload = Schema.Struct({
  entityName: Schema.String,
  mutations: Schema.Array(
    Schema.Struct({
      mutation: Schema.Unknown,
      op: Schema.Unknown,
    }),
  ),
  tokenKey: Schema.String,
})

// Define the external sync entity workflow
export const ExternalSyncEntityWorkflow = Workflow.make({
  error: ExternalSyncEntityError,
  idempotencyKey: ({ tokenKey, entityName }) =>
    `external-sync-entity-${tokenKey}-${entityName}-${new Date().toISOString()}`,
  name: 'ExternalSyncEntityWorkflow',
  payload: ExternalSyncEntityPayload,
  success: Schema.Void,
})

// Types from the original externalSync.ts
type CrudOperation = {
  op: 'insert' | 'update' | 'upsert' | 'delete'
  tableName: string
  primaryKey: { id: string }
  value: unknown
}

type ExternalLink = {
  readonly adapter: string
  readonly externalId: string
}

type EntityClient = {
  readonly create?: (params: { body: unknown }) => Effect.Effect<unknown, unknown, never>
  readonly update?: (params: {
    body: unknown
    urlParams: { id: string }
  }) => Effect.Effect<unknown, unknown, never>
  readonly delete?: (params: {
    urlParams: { id: string }
  }) => Effect.Effect<unknown, unknown, never>
}

/**
 * Converts table name to entity name (people -> Person, addresses -> Address)
 */
const mkEntityName = (tableName: string): string => {
  // Convert snake_case to PascalCase, then singularize
  const pascalName = tableName
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[a-z]/, (letter) => letter.toUpperCase())

  return singularize(pascalName)
}
/**
 * Transforms entity data using appropriate transformer
 */
const transformEntityDataE = Effect.fn('transformEntityDataE')(function* (
  entityName: string,
  data: unknown,
) {
  const entityConfig = ofLookup[entityName as keyof typeof ofLookup]

  if (entityConfig?.transformer) {
    return yield* Schema.encode(entityConfig.transformer as any)(data as any)
  }

  yield* Effect.logWarning('No transformer found for entity - using raw data', {
    entityName,
  })
  return data
})

/**
 * Finds entity manifest for given entity name
 */
const findEntityManifestE = Effect.fn('findEntityManifestE')(function* (entityName: string) {
  return pipe(
    pcoEntityManifest,
    Record.findFirst((manifest) => manifest.entity === entityName),
  )
})

/**
 * Gets external links for an entity
 */
const getExternalLinksE = Effect.fn('getExternalLinksE')(function* (
  tableName: string,
  entityId: string,
) {
  const externalLinkManager = yield* ExternalLinkManager
  const entityType = tableName.slice(0, -1) // people -> person

  return yield* externalLinkManager.getExternalLinksForEntity(entityType, entityId)
})

/**
 * Creates appropriate API effect for CRUD operation
 */
const mkCrudEffectE = Effect.fn('mkCrudEffectE')(function* (
  operation: CrudOperation['op'],
  entityClient: EntityClient,
  entityName: string,
  encodedData: unknown,
  externalId: string,
) {
  switch (operation) {
    case 'insert':
      if (!entityClient.create) {
        return yield* Effect.fail(new Error(`Create not supported for ${entityName}`))
      }
      return yield* entityClient.create({ body: encodedData })

    case 'update':
    case 'upsert':
      if (!entityClient.update) {
        return yield* Effect.fail(new Error(`Update not supported for ${entityName}`))
      }
      return yield* entityClient.update({
        body: encodedData,
        urlParams: { id: externalId },
      })

    case 'delete':
      if (!entityClient.delete) {
        return yield* Effect.fail(new Error(`Delete not supported for ${entityName}`))
      }
      return yield* entityClient.delete({
        urlParams: { id: externalId },
      })

    default:
      return yield* Effect.fail(new Error(`Unknown operation: ${operation}`))
  }
})

/**
 * Syncs a single operation to PCO
 */
const syncToPcoE = Effect.fn('syncToPcoE')(function* (
  op: CrudOperation,
  entityName: string,
  link: ExternalLink,
) {
  const externalLinkManager = yield* ExternalLinkManager
  const pcoClient = yield* PcoHttpClient

  yield* Effect.log('Starting PCO sync', {
    entityName,
    externalId: link.externalId,
    operation: op.op,
  })

  // Mark sync in progress
  yield* externalLinkManager.markSyncInProgress(link.adapter, link.externalId)

  // Get PCO client method dynamically
  const entityClient = pcoClient[entityName as keyof typeof pcoClient] as EntityClient | undefined

  if (!entityClient) {
    yield* Effect.logWarning('PCO client not found for entity', { entityName })
    yield* externalLinkManager.markSyncCompleted(link.adapter, link.externalId)
    return
  }

  // Transform data using existing bidirectional transformer
  const encodedData = yield* transformEntityDataE(entityName, op.value)

  yield* Effect.log('Data transformed for PCO', {
    entityName,
    hasTransformer: entityName === 'Person',
  })

  // Create and execute sync effect
  yield* mkCrudEffectE(op.op, entityClient, entityName, encodedData, link.externalId).pipe(
    Effect.tap(() =>
      Effect.log('PCO sync completed successfully', {
        entityName,
        externalId: link.externalId,
        operation: op.op,
      }),
    ),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* externalLinkManager.markSyncCompleted(link.adapter, link.externalId)
        yield* Effect.logError('PCO sync failed', {
          entityName,
          error: error instanceof Error ? error.message : `${error}`,
          externalId: link.externalId,
          operation: op.op,
        })
      }),
    ),
  )

  // Mark sync completed on success
  yield* externalLinkManager.markSyncCompleted(link.adapter, link.externalId)
})

/**
 * Syncs operation to external systems
 */
const syncToExternalSystemsE = Effect.fn('syncToExternalSystemsE')(function* (
  op: CrudOperation,
  entityName: string,
  externalLinks: ReadonlyArray<ExternalLink>,
) {
  yield* Effect.forEach(externalLinks, (link) =>
    Effect.gen(function* () {
      if (link.adapter === 'pco') {
        yield* syncToPcoE(op, entityName, link)
      } else {
        yield* Effect.logWarning('Unsupported adapter for external sync', {
          adapter: link.adapter,
          entityName,
        })
      }
    }),
  )
})

/**
 * Processes a single CRUD operation
 */
const processCrudOperationE = Effect.fn('processCrudOperationE')(function* (op: CrudOperation) {
  const entityName = mkEntityName(op.tableName)
  const entityId = op.primaryKey.id as string

  yield* Effect.log('Processing CRUD operation', {
    entityId,
    entityName,
    operation: op.op,
    tableName: op.tableName,
  })

  // Find entity in PCO manifest
  const entityManifestOpt = yield* findEntityManifestE(entityName)

  if (entityManifestOpt._tag === 'None') {
    yield* Effect.log('Entity not found in PCO manifest - skipping', {
      entityName,
      tableName: op.tableName,
    })
    return
  }

  // Get external links for this entity
  const externalLinks = yield* getExternalLinksE(op.tableName, entityId)

  if (externalLinks.length === 0) {
    yield* Effect.log('No external links found for entity - skipping', {
      entityId,
      entityType: op.tableName.slice(0, -1),
    })
    return
  }

  yield* Effect.log('Found external links', {
    adapters: externalLinks.map((link) => link.adapter),
    entityId,
    linkCount: externalLinks.length,
  })

  // Sync to each external system
  yield* syncToExternalSystemsE(op, entityName, externalLinks)
})

// Create the workflow implementation layer
export const ExternalSyncEntityWorkflowLayer = ExternalSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting external sync entity workflow for: ${payload.entityName}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { entityName, mutations, tokenKey } = payload

    // Create the external sync activity
    yield* Activity.make({
      error: ExternalSyncEntityError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(
          Effect.log(`📊 Syncing external data for entity: ${entityName}`),
          {
            attempt,
            entityName,
            executionId,
            mutationCount: mutations.length,
            tokenKey,
          },
        )

        // Process each mutation for this entity
        yield* Effect.forEach(mutations, ({ op }) =>
          processCrudOperationE(op as CrudOperation).pipe(
            Effect.mapError(
              (error) =>
                new ExternalSyncEntityError({
                  message: error instanceof Error ? error.message : `${error}`,
                }),
            ),
          ),
        )
      }).pipe(
        Effect.withSpan('external-sync-entity-activity'),
        Effect.provide(ExternalLinkManagerLive),
        Effect.provide(PcoApiLayer),
        Effect.provideService(TokenKey, tokenKey),
      ),
      name: 'SyncExternalEntityData',
    }).pipe(
      Activity.retry({ times: 3 }),
      ExternalSyncEntityWorkflow.withCompensation(
        Effect.fn(function* (_value, cause) {
          yield* Effect.log(`🔄 Compensating external sync entity activity for: ${entityName}`)
          yield* Effect.log(`📋 Cause: ${cause}`)
          // Add any cleanup logic here if needed
        }),
      ),
    )

    yield* Effect.log(`✅ Completed external sync entity workflow for: ${entityName}`)
  }),
)
