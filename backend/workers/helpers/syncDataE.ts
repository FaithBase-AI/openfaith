import { ExternalLinkManager } from '@openfaith/adapter-core/layers/externalLinkManager'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { singularize } from '@openfaith/shared/string'
import { Effect, pipe, Record, Schema } from 'effect'
import { ofLookup } from './ofLookup'

// Types for external sync operations
export type CrudOperation = {
  op: 'insert' | 'update' | 'upsert' | 'delete'
  tableName: string
  primaryKey: { id: string }
  value: unknown
}

export type ExternalLink = {
  readonly adapter: string
  readonly externalId: string
}

export type EntityClient = {
  readonly create?: (params: { payload: unknown }) => Effect.Effect<unknown, unknown, any>
  readonly update?: (params: {
    payload: unknown
    urlParams: { id: string }
  }) => Effect.Effect<unknown, unknown, any>
  readonly delete?: (params: { urlParams: { id: string } }) => Effect.Effect<unknown, unknown, any>
}

/**
 * Converts table name to entity name (people -> Person, addresses -> Address)
 */
export const mkEntityName = (tableName: string): string => {
  // Convert snake_case to PascalCase, then singularize
  const pascalName = tableName
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[a-z]/, (letter) => letter.toUpperCase())

  return singularize(pascalName)
}

/**
 * Transforms entity data using appropriate transformer
 */
export const transformEntityDataE = Effect.fn('transformEntityDataE')(function* (
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
export const findEntityManifestE = Effect.fn('findEntityManifestE')(function* (entityName: string) {
  return pipe(
    pcoEntityManifest,
    Record.findFirst((manifest) => manifest.entity === entityName),
  )
})

/**
 * Gets external links for an entity
 */
export const getExternalLinksE = Effect.fn('getExternalLinksE')(function* (
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
export const mkCrudEffectE = Effect.fn('mkCrudEffectE')(function* (
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
      return yield* entityClient.create({ payload: encodedData })

    case 'update':
    case 'upsert':
      if (!entityClient.update) {
        return yield* Effect.fail(new Error(`Update not supported for ${entityName}`))
      }
      return yield* entityClient.update({
        payload: encodedData,
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
export const syncToPcoE = Effect.fn('syncToPcoE')(function* (
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
    hasTransformer: !!ofLookup[entityName as keyof typeof ofLookup]?.transformer,
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
export const syncToExternalSystemsE = Effect.fn('syncToExternalSystemsE')(function* (
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
 * Processes a single CRUD operation for external sync
 */
export const processCrudOperationE = Effect.fn('processCrudOperationE')(function* (
  op: CrudOperation,
) {
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

/**
 * Main function to sync data to external systems
 * Processes multiple CRUD operations for external sync
 */
export const syncDataE = Effect.fn('syncDataE')(function* (
  mutations: ReadonlyArray<{ mutation: unknown; op: unknown }>,
) {
  yield* Effect.log('Starting external sync for mutations', {
    mutationCount: mutations.length,
  })

  // Process each mutation
  yield* Effect.forEach(mutations, ({ op }) =>
    processCrudOperationE(op as CrudOperation).pipe(
      Effect.catchAll((error) =>
        Effect.logError('Failed to process CRUD operation', {
          error: error instanceof Error ? error.message : `${error}`,
          operation: op,
        }),
      ),
    ),
  )

  yield* Effect.log('Completed external sync for mutations', {
    mutationCount: mutations.length,
  })
})
