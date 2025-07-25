import {
  AdapterConnectionError,
  AdapterSyncError,
  AdapterTokenError,
  AdapterValidationError,
} from '@openfaith/adapter-core/errors/adapterErrors'
import {
  type AdapterEntityManifest,
  AdapterOperations,
  type SyncResult,
} from '@openfaith/adapter-core/layers/adapterOperations'
import type { CRUDOp } from '@openfaith/domain'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { extractPcoUpdatedAt } from '@openfaith/pco/helpers/extractUpdatedAt'
import { OfSkipEntity } from '@openfaith/schema'
import { mkUrlParamName } from '@openfaith/shared/string'
import {
  transformEntityDataE,
  transformPartialEntityDataE,
} from '@openfaith/workers/helpers/syncDataE'
import { Chunk, Effect, Layer, Option, pipe, Record, SchemaAST, Stream } from 'effect'

// Type-safe entity client utilities
// Define the expected structure of an entity client
interface EntityClient {
  list?: (request: { urlParams?: Record<string, unknown> }) => Effect.Effect<any, any, any>
  create?: (request: { payload: any }) => Effect.Effect<any, any, any>
  update?: (request: { path: Record<string, string>; payload: any }) => Effect.Effect<any, any, any>
  delete?: (request: { path: Record<string, string> }) => Effect.Effect<any, any, any>
}

// Type guard to ensure we have a valid entity client with required methods
const isValidEntityClient = (client: unknown): client is EntityClient => {
  return (
    client !== null &&
    client !== undefined &&
    typeof client === 'object' &&
    ('list' in client || 'create' in client || 'update' in client || 'delete' in client)
  )
}

// Safe entity client accessor with proper typing
const getEntityClient = (pcoClient: any, entityName: string): EntityClient | null => {
  const client = pcoClient[entityName]
  return isValidEntityClient(client) ? client : null
}

const createPcoEntityPaginatedStream = (
  entityName: string,
  client: EntityClient,
  params?: Record<string, unknown>,
): Stream.Stream<unknown, AdapterSyncError | AdapterConnectionError, any> => {
  if (!client || !client.list) {
    return Stream.fail(
      new AdapterSyncError({
        adapter: 'pco',
        entityName,
        message: `Entity ${entityName} does not support list operation`,
        operation: 'list',
      }),
    )
  }

  // PCO-specific pagination using offset-based pagination
  return Stream.paginateChunkEffect(0, (currentOffset) => {
    const finalParams = params ? { ...params, offset: currentOffset } : { offset: currentOffset }

    return client.list!({ urlParams: finalParams }).pipe(
      Effect.map((response: any) => {
        const nextOffset = response.meta?.next?.offset
        return [
          Chunk.make(response),
          nextOffset ? Option.some(nextOffset) : Option.none<number>(),
        ] as const
      }),
      Effect.mapError(
        (error) =>
          new AdapterConnectionError({
            adapter: 'pco',
            cause: error,
            message: `Failed to list ${entityName as string}`,
          }),
      ),
    )
  })
}

const mkCrudEffect = (
  operation: CRUDOp['op'],
  entityClient: EntityClient,
  entityName: string,
  encodedData: unknown,
  externalId: string,
): Effect.Effect<unknown, AdapterSyncError, any> => {
  const urlParamName = mkUrlParamName(entityName)

  switch (operation) {
    case 'insert': {
      if (!entityClient.create) {
        return Effect.succeed(null)
      }
      const { id: _id, ...attributesWithoutId } = encodedData as Record<string, unknown>
      const createPayload = {
        data: {
          attributes: attributesWithoutId,
          type: entityName as string,
        },
      }
      return entityClient.create({ payload: createPayload }).pipe(
        Effect.mapError(
          (error) =>
            new AdapterSyncError({
              adapter: 'pco',
              cause: error,
              entityName,
              message: `Failed to create ${entityName}`,
              operation: 'create',
            }),
        ),
      )
    }

    case 'update':
    case 'upsert': {
      if (!entityClient.update) {
        return Effect.succeed(null)
      }
      const { id: _id, ...attributesWithoutId } = encodedData as Record<string, unknown>
      const updatePayload = {
        data: {
          attributes: attributesWithoutId,
          id: externalId,
          type: entityName,
        },
      }

      return entityClient
        .update({
          path: { [urlParamName]: externalId },
          payload: updatePayload,
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to update ${entityName}`,
                operation: 'update',
              }),
          ),
        )
    }

    case 'delete':
      if (!entityClient.delete) {
        return Effect.succeed(null)
      }
      return entityClient
        .delete({
          path: { [urlParamName]: externalId },
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to delete ${entityName}`,
                operation: 'delete',
              }),
          ),
        )

    default:
      return Effect.fail(
        new AdapterSyncError({
          adapter: 'pco',
          entityName,
          message: `Unsupported operation: ${operation}`,
          operation,
        }),
      )
  }
}

export const PcoOperationsLive = Layer.effect(
  AdapterOperations,
  Effect.gen(function* () {
    const pcoClient = yield* PcoHttpClient

    return AdapterOperations.of({
      extractUpdatedAt: extractPcoUpdatedAt,
      fetchToken: (_params: { code: string; redirectUri: string }) =>
        Effect.fail(
          new AdapterTokenError({
            adapter: 'pco',
            message:
              'Token fetching not implemented in this layer - use mkPcoServerAdapter instead',
          }),
        ),

      getAdapterTag: () => 'pco',

      getEntityManifest: (): AdapterEntityManifest => {
        return pipe(
          pcoEntityManifest,
          Record.map((manifest) => ({
            endpoint: '',
            endpoints: manifest.endpoints,
            entity: manifest.entity,
            skipSync: manifest.skipSync,
            transformer: undefined,
          })),
        )
      },

      listEntityData: (entityName: string, params?: Record<string, unknown>) => {
        // PCO client uses entity names directly (Campus, not campuses)
        // Type-safe access to entity client
        const entityClient = getEntityClient(pcoClient, entityName)

        if (!entityClient) {
          return Stream.fail(
            new AdapterSyncError({
              adapter: 'pco',
              entityName,
              message: `Entity ${entityName} not found in PCO client or missing list method`,
              operation: 'list',
            }),
          )
        }

        return createPcoEntityPaginatedStream(entityName, entityClient, params) as any
      },

      processEntityData: <R, E>(
        entityName: string,
        processor: (data: unknown) => Effect.Effect<void, E, R>,
      ) =>
        Effect.gen(function* () {
          // Check if entity exists and is syncable
          const entityOpt = pipe(
            pcoEntityManifest,
            Record.findFirst((x) => x.entity === entityName),
            Option.filter(([, x]) => {
              return !SchemaAST.getAnnotation<boolean>(OfSkipEntity)(x.apiSchema.ast).pipe(
                Option.getOrElse(() => false),
              )
            }),
          )

          if (entityOpt._tag === 'None') {
            yield* Effect.log(`🔄 Skipping PCO sync for entity: ${entityName}`)
            return
          }

          // PCO client uses entity names directly (Campus, not campuses)
          // Type-safe access to entity client
          const entityClient = getEntityClient(pcoClient, entityName)

          if (!entityClient) {
            return yield* Effect.fail(
              new AdapterSyncError({
                adapter: 'pco',
                entityName,
                message: `Entity ${entityName} not found in PCO client or missing list method`,
                operation: 'list',
              }),
            )
          }

          // Get URL params from entity manifest
          const urlParams = pipe(
            entityOpt,
            Option.flatMapNullable(([, x]) => x.endpoints.list.defaultQuery),
            Option.getOrElse(() => ({})),
          )

          // Process all data using PCO-specific pagination
          yield* Stream.runForEach(
            createPcoEntityPaginatedStream(entityName, entityClient, urlParams),
            processor,
          )
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to process entity data for ${entityName}`,
                operation: 'process',
              }),
          ),
        ),

      syncEntityData: (entityName: string, operations: ReadonlyArray<CRUDOp>) =>
        Effect.gen(function* () {
          // PCO client uses entity names directly (Campus, not campuses)
          // Type-safe access to entity client
          const entityClient = getEntityClient(pcoClient, entityName)

          if (!entityClient) {
            return []
          }

          const results: Array<SyncResult> = []

          yield* Effect.forEach(operations, (op) =>
            Effect.gen(function* () {
              const externalId = Object.values(op.primaryKey)[0] as string

              const result = yield* Effect.gen(function* () {
                const encodedData =
                  op.op === 'update'
                    ? yield* transformPartialEntityDataE(
                        entityName,
                        op.value as Record<string, unknown>,
                      )
                    : yield* transformEntityDataE(entityName, op.value)

                yield* mkCrudEffect(op.op, entityClient, entityName, encodedData, externalId)

                return {
                  entityName,
                  externalId,
                  operation: op.op,
                  success: true,
                } satisfies SyncResult
              }).pipe(
                Effect.catchAll((error) =>
                  Effect.succeed({
                    entityName,
                    error: error instanceof Error ? error.message : String(error),
                    externalId,
                    operation: op.op,
                    success: false,
                  } satisfies SyncResult),
                ),
              )

              results.push(result)
            }),
          )

          return results
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterSyncError({
                adapter: 'pco',
                cause: error,
                entityName,
                message: `Failed to sync entity data for ${entityName}`,
                operation: 'sync',
              }),
          ),
        ) as any,

      transformEntityData: (
        entityName: string,
        data: unknown,
        operation: 'create' | 'update' | 'delete',
      ) =>
        Effect.gen(function* () {
          if (operation === 'update') {
            return yield* transformPartialEntityDataE(entityName, data as Record<string, unknown>)
          }
          return yield* transformEntityDataE(entityName, data)
        }).pipe(
          Effect.mapError(
            (error) =>
              new AdapterValidationError({
                adapter: 'pco',
                cause: error,
                entityName,
                field: 'unknown',
                message: `Failed to transform entity data for ${entityName}`,
              }),
          ),
        ),
    })
  }),
)
