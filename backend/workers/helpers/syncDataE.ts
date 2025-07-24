import { ExternalLinkManager } from '@openfaith/adapter-core/layers/externalLinkManager'
import type { CRUDMutation, CRUDOp } from '@openfaith/domain'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import type { pcoPersonTransformer } from '@openfaith/pco/server'

import { mkEntityName, mkEntityType } from '@openfaith/shared/string'
import { ofLookup } from '@openfaith/workers/helpers/ofLookup'
import { Effect, pipe, Record, Schema } from 'effect'

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

export class ExternalSyncError extends Schema.TaggedError<ExternalSyncError>()(
  'ExternalSyncError',
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
  const entityConfig = ofLookup[entityName as keyof typeof ofLookup]

  if (!entityConfig?.transformer) {
    yield* Effect.logWarning('No transformer found for entity - using raw data', {
      entityName,
    })
    return partialData
  }

  // For partial updates, we only transform the fields that are present
  // We don't need a complete object, just the fields being updated
  const transformedFields: Record<string, unknown> = {}

  // For now, we'll do a simple field mapping for common fields
  // Note: We could use the transformer schema for more sophisticated field mapping
  // const transformer = entityConfig.transformer as unknown as typeof pcoPersonTransformer;
  // This handles the most common case where field names match or have simple mappings
  for (const [key, value] of Object.entries(partialData)) {
    switch (key) {
      case 'firstName':
        transformedFields.first_name = value
        break
      case 'lastName':
        transformedFields.last_name = value
        break
      case 'middleName':
        transformedFields.middle_name = value
        break
      case 'name':
        transformedFields.name = value
        break
      case 'birthdate':
        transformedFields.birthdate = value
        break
      case 'anniversary':
        transformedFields.anniversary = value
        break
      case 'gender':
        // Transform gender from OF format to PCO format
        if (value === 'male') {
          transformedFields.gender = 'Male'
        } else if (value === 'female') {
          transformedFields.gender = 'Female'
        } else {
          transformedFields.gender = value
        }
        break
      case 'avatar':
        transformedFields.avatar = value
        break
      case 'membership':
        transformedFields.membership = value
        break
      default:
        // For unknown fields, pass them through as-is
        transformedFields[key] = value
    }
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
  const entityConfig = ofLookup[entityName as keyof typeof ofLookup]

  if (entityConfig?.transformer) {
    return yield* Schema.encode(entityConfig.transformer as unknown as typeof pcoPersonTransformer)(
      data as any,
    ).pipe(Effect.mapError((cause) => new EntityTransformError({ cause, entityName })))
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
  const entityType = mkEntityType(tableName)

  return yield* externalLinkManager.getExternalLinksForEntity(entityType, entityId)
})

/**
 * Gets the correct URL parameter name for a given entity
 */
const getUrlParamName = (entityName: string): string => {
  switch (entityName) {
    case 'Person':
      return 'personId'
    case 'Household':
      return 'householdId'
    case 'Address':
      return 'addressId'
    case 'PhoneNumber':
      return 'phoneNumberId'
    case 'Email':
      return 'emailId'
    case 'Note':
      return 'noteId'
    case 'List':
      return 'listId'
    case 'Campus':
      return 'campusId'
    case 'Tab':
      return 'tabId'
    case 'FieldDefinition':
      return 'fieldDefinitionId'
    case 'FieldDatum':
      return 'fieldDatumId'
    default:
      // Fallback to generic 'id' for unknown entities
      return 'id'
  }
}

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
  const urlParamName = getUrlParamName(entityName)

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
        data: updatePayload.data,
        entityName,
        externalId,
        pathParams: { [urlParamName]: externalId },
        payloadData: encodedData,
        updatePayload,
        urlParamName,
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

  yield* Effect.log('Data transformed for PCO', {
    entityName,
    hasTransformer: !!ofLookup[entityName as keyof typeof ofLookup]?.transformer,
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
        new ExternalSyncError({
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
) {
  yield* Effect.forEach(externalLinks, (link) =>
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
) {
  const entityName = mkEntityName(op.tableName)
  // Extract entity ID from primaryKey record
  const entityId = Object.values(op.primaryKey)[0] as string

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
      entityType: mkEntityType(op.tableName),
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
  mutations: ReadonlyArray<{ mutation: CRUDMutation; op: CRUDOp }>,
) {
  yield* Effect.log('Starting external sync for mutations', {
    mutationCount: mutations.length,
  })

  // Process each mutation
  yield* Effect.forEach(mutations, ({ op }) =>
    processCrudOperationE(op).pipe(
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
