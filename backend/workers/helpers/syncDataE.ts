import { ExternalLinkManager } from '@openfaith/adapter-core/layers/externalLinkManager'
import type { CRUDMutation, CRUDOp } from '@openfaith/domain'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import type { pcoPersonTransformer } from '@openfaith/pco/server'
import { OfFieldName } from '@openfaith/schema'

import { mkEntityName, mkEntityType, mkUrlParamName } from '@openfaith/shared'
import { getPcoEntityMetadata } from '@openfaith/workers/helpers/schemaRegistry'
import { Array, Effect, Option, pipe, Record, Schema, SchemaAST } from 'effect'

// Define tagged errors for external sync operations
export class EntityTransformError extends Schema.TaggedError<EntityTransformError>()(
  'EntityTransformError',
  {
    cause: Schema.Unknown,
    entityName: Schema.String,
  },
) {}

export class UnsupportedOperationError extends Schema.TaggedError<UnsupportedOperationError>()(
  'UnsupportedOperationError',
  {
    entityName: Schema.String,
    operation: Schema.String,
  },
) {}

export class EntityClientNotFoundError extends Schema.TaggedError<EntityClientNotFoundError>()(
  'EntityClientNotFoundError',
  {
    entityName: Schema.String,
  },
) {}

export class UnsupportedAdapterError extends Schema.TaggedError<UnsupportedAdapterError>()(
  'UnsupportedAdapterError',
  {
    adapter: Schema.String,
    entityName: Schema.String,
  },
) {}

export class ExternalPushError extends Schema.TaggedError<ExternalPushError>()(
  'ExternalPushError',
  {
    cause: Schema.Unknown,
    entityName: Schema.String,
    externalId: Schema.String,
    operation: Schema.String,
  },
) {}

// Types for external sync operations
export type CrudOperation = CRUDOp

export type ExternalLink = {
  readonly adapter: string
  readonly externalId: string
}

export type EntityClient = {
  readonly create?: (params: { payload: unknown }) => Effect.Effect<unknown, unknown, never>
  readonly update?: (params: {
    payload: unknown
    path: Record<string, string>
  }) => Effect.Effect<unknown, unknown, never>
  readonly delete?: (params: {
    path: Record<string, string>
  }) => Effect.Effect<unknown, unknown, never>
}

/**
 * Transforms partial entity data for update operations
 * Only transforms the fields that are present in the partial data
 */
export const transformPartialEntityDataE = Effect.fn('transformPartialEntityDataE')(function* (
  entityName: string,
  partialData: Record<string, unknown>,
) {
  // Get entity metadata from schema registry
  const entityMetadataOpt = getPcoEntityMetadata(entityName)

  if (Option.isNone(entityMetadataOpt)) {
    yield* Effect.logWarning('No entity config found - using raw data', {
      entityName,
    })
    return partialData
  }

  const entityMetadata = entityMetadataOpt.value

  if (Option.isNone(entityMetadata.transformer)) {
    yield* Effect.logWarning('No transformer found for entity - using raw data', {
      entityName,
    })
    return partialData
  }

  const originalTransformer = entityMetadata.transformer.value as any
  const sourceSchema = originalTransformer.from as Schema.Struct<any>

  const transformedFields: Record<string, unknown> = {}

  // Process each field in the partial data
  for (const [ofFieldName, value] of Object.entries(partialData)) {
    // Find the corresponding PCO field name by looking through the source schema
    const pcoFieldEntry = pipe(
      sourceSchema.fields,
      Record.toEntries,
      Array.findFirst(([pcoKey, field]) => {
        const fieldKeyOpt = SchemaAST.getAnnotation<string>(OfFieldName)(
          field.ast as SchemaAST.Annotated,
        )
        return pipe(
          fieldKeyOpt,
          Option.match({
            onNone: () => pcoKey === ofFieldName, // Direct match if no annotation
            onSome: (annotatedFieldName) => annotatedFieldName === ofFieldName,
          }),
        )
      }),
    )

    pipe(
      pcoFieldEntry,
      Option.match({
        onNone: () => {
          // No mapping found, pass through as-is
          transformedFields[ofFieldName] = value
        },
        onSome: ([pcoKey, _field]) => {
          // Apply any field-specific transformations
          let transformedValue = value

          // Handle special transformations (like gender)
          if (ofFieldName === 'gender') {
            if (value === 'male') {
              transformedValue = 'Male'
            } else if (value === 'female') {
              transformedValue = 'Female'
            }
          }

          transformedFields[pcoKey] = transformedValue
        },
      }),
    )
  }

  yield* Effect.log('Transformed partial entity data', {
    entityName,
    originalFields: Object.keys(partialData),
    transformedFields: Object.keys(transformedFields),
  })

  return transformedFields
})

/**
 * Transforms entity data using appropriate transformer
 */
export const transformEntityDataE = Effect.fn('transformEntityDataE')(function* (
  entityName: string,
  data: unknown,
) {
  // Get entity metadata from schema registry
  const entityMetadataOpt = getPcoEntityMetadata(entityName)

  if (Option.isNone(entityMetadataOpt)) {
    yield* Effect.logWarning('No entity config found - using raw data', {
      entityName,
    })
    return data
  }

  const entityMetadata = entityMetadataOpt.value

  if (Option.isSome(entityMetadata.transformer)) {
    return yield* Schema.encode(
      entityMetadata.transformer.value as unknown as typeof pcoPersonTransformer,
    )(data as any).pipe(Effect.mapError((cause) => new EntityTransformError({ cause, entityName })))
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
    // Filter out the webhooks property
    (manifest) => {
      const { webhooks: _webhooks, ...entities } = manifest
      return entities
    },
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
  const entityType = mkEntityType(tableName)

  return yield* externalLinkManager.getExternalLinksForEntity(entityType, entityId)
})

/**
 * Creates appropriate API effect for CRUD operation
 */
export const mkCrudEffectE = Effect.fn('mkCrudEffectE')(function* (
  operation: CRUDOp['op'],
  entityClient: EntityClient,
  entityName: string,
  encodedData: unknown,
  externalId: string,
) {
  const urlParamName = mkUrlParamName(entityName)

  switch (operation) {
    case 'insert': {
      if (!entityClient.create) {
        yield* Effect.logWarning('Provider does not support create operation - skipping', {
          entityName,
          externalId,
          operation: 'create',
        })
        return null
      }
      // Wrap payload in JSON:API format that PCO expects
      // Remove 'id' from attributes as it should not be in create requests
      const { id: _id, ...attributesWithoutId } = encodedData as Record<string, unknown>
      const createPayload = {
        data: {
          attributes: attributesWithoutId,
          type: entityName,
        },
      }
      return yield* entityClient.create({ payload: createPayload })
    }

    case 'update':
    case 'upsert': {
      if (!entityClient.update) {
        yield* Effect.logWarning('Provider does not support update operation - skipping', {
          entityName,
          externalId,
          operation: 'update',
        })
        return null
      }
      // Wrap payload in JSON:API format that PCO expects
      // Remove 'id' from attributes as it should only be at the top level
      const { id: _id, ...attributesWithoutId } = encodedData as Record<string, unknown>
      const updatePayload = {
        data: {
          attributes: attributesWithoutId,
          id: externalId,
          type: entityName,
        },
      }

      yield* Effect.log('Sending update request', {
        entityName,
        externalId,
        path: { [urlParamName]: externalId },
        payload: updatePayload,
        payloadJson: JSON.stringify(updatePayload),
      })

      return yield* entityClient.update({
        path: { [urlParamName]: externalId },
        payload: updatePayload,
      })
    }

    case 'delete':
      if (!entityClient.delete) {
        yield* Effect.logWarning('Provider does not support delete operation - skipping', {
          entityName,
          externalId,
          operation: 'delete',
        })
        return null
      }
      return yield* entityClient.delete({
        path: { [urlParamName]: externalId },
      })

    default:
      return yield* Effect.fail(new UnsupportedOperationError({ entityName, operation }))
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

  yield* Effect.log('Starting Entity sync', {
    entityName,
    externalId: link.externalId,
    operation: op.op,
  })

  // Mark sync in progress
  yield* externalLinkManager.markSyncInProgress(link.adapter, link.externalId)

  // Get PCO client method dynamically
  const entityClient = pcoClient[entityName as keyof typeof pcoClient] as EntityClient | undefined

  if (!entityClient) {
    yield* externalLinkManager.markSyncCompleted(link.adapter, link.externalId)
    yield* Effect.logWarning('Provider does not support this entity - skipping sync', {
      adapter: link.adapter,
      entityName,
      externalId: link.externalId,
      operation: op.op,
    })
    return
  }

  // Transform data - use partial transformation for updates, full transformation for inserts
  const encodedData =
    op.op === 'update'
      ? yield* transformPartialEntityDataE(entityName, op.value as Record<string, unknown>)
      : yield* transformEntityDataE(entityName, op.value)

  // Get entity metadata from schema registry for logging
  const entityMetadataOpt = getPcoEntityMetadata(entityName)
  const hasTransformer =
    Option.isSome(entityMetadataOpt) && Option.isSome(entityMetadataOpt.value.transformer)

  yield* Effect.log('Data transformed for PCO', {
    entityName,
    hasTransformer,
  })

  // Create and execute sync effect with proper error handling
  yield* mkCrudEffectE(op.op, entityClient, entityName, encodedData, link.externalId).pipe(
    Effect.tap(() =>
      Effect.log('PCO sync completed successfully', {
        entityName,
        externalId: link.externalId,
        operation: op.op,
      }),
    ),
    Effect.tapError((error) =>
      Effect.logError('PCO sync failed', {
        entityName,
        error,
        externalId: link.externalId,
        operation: op.op,
      }),
    ),
    Effect.mapError(
      (cause) =>
        new ExternalPushError({
          cause,
          entityName,
          externalId: link.externalId,
          operation: op.op,
        }),
    ),
    Effect.ensuring(
      Effect.orDie(externalLinkManager.markSyncCompleted(link.adapter, link.externalId)),
    ),
  )
})

/**
 * Syncs operation to external systems
 */
export const syncToExternalSystemsE = Effect.fn('syncToExternalSystemsE')(function* (
  op: CrudOperation,
  entityName: string,
  externalLinks: ReadonlyArray<ExternalLink>,
  excludeAdapter?: 'pco' | 'ccb',
) {
  // Filter out the excluded adapter if specified
  const linksToSync = excludeAdapter
    ? pipe(
        externalLinks,
        Array.filter((link) => link.adapter !== excludeAdapter),
      )
    : externalLinks

  yield* Effect.forEach(linksToSync, (link) =>
    Effect.gen(function* () {
      if (link.adapter === 'pco') {
        yield* syncToPcoE(op, entityName, link)
      } else {
        return yield* Effect.fail(
          new UnsupportedAdapterError({ adapter: link.adapter, entityName }),
        )
      }
    }),
  )
})

/**
 * Processes a single CRUD operation for external sync
 */
export const processCrudOperationE = Effect.fn('processCrudOperationE')(function* (
  op: CrudOperation,
  excludeAdapter?: 'pco' | 'ccb',
) {
  const entityName = mkEntityName(op.tableName)
  // Extract entity ID from primaryKey record
  const entityId = Object.values(op.primaryKey)[0] as string

  yield* Effect.log('Processing CRUD operation', {
    entityId,
    entityName,
    excludeAdapter,
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
      entityType: mkEntityType(op.tableName),
    })
    return
  }

  yield* Effect.log('Found external links', {
    adapters: externalLinks.map((link) => link.adapter),
    entityId,
    excludeAdapter,
    linkCount: externalLinks.length,
  })

  // Sync to each external system (excluding the specified adapter if any)
  yield* syncToExternalSystemsE(op, entityName, externalLinks, excludeAdapter)
})

/**
 * Main function to sync data to external systems
 * Processes multiple CRUD operations for external sync
 */
export const syncDataE = Effect.fn('syncDataE')(function* (
  mutations: ReadonlyArray<{ mutation: CRUDMutation; op: CRUDOp }>,
  excludeAdapter?: 'pco' | 'ccb',
) {
  yield* Effect.log('Starting external sync for mutations', {
    excludeAdapter,
    mutationCount: mutations.length,
  })

  // Process each mutation
  yield* Effect.forEach(mutations, ({ op }) =>
    processCrudOperationE(op, excludeAdapter).pipe(
      Effect.tapError((error) =>
        Effect.logError('Failed to process CRUD operation', {
          error,
          operation: op,
        }),
      ),
    ),
  )

  yield* Effect.log('Completed external sync for mutations', {
    mutationCount: mutations.length,
  })
})
