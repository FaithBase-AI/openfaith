import { Activity, Workflow } from '@effect/workflow'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import type { Mutation } from '@openfaith/domain'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
// @ts-ignore - Type resolution issue with monorepo
import { mutationSideEffects } from '@openfaith/server/services/externalPushTrigger'
import { mkTableName } from '@openfaith/shared'
// import { saveDataE } from '@openfaith/workers/helpers/saveDataE' // TODO: Re-enable when implemented
import { Effect, Schema } from 'effect'
import { nanoid } from 'nanoid'

// Define the error schema
class ExternalSyncSingleEntityError extends Schema.TaggedError<ExternalSyncSingleEntityError>()(
  'ExternalSyncSingleEntityError',
  {
    cause: Schema.optional(Schema.Unknown),
    entityId: Schema.optional(Schema.String),
    entityType: Schema.optional(Schema.String),
    message: Schema.String,
    tokenKey: Schema.optional(Schema.String),
  },
) {}

// Define the workflow payload schema
const ExternalSyncSingleEntityPayload = Schema.Struct({
  entityId: Schema.String,
  entityType: Schema.String,
  operation: Schema.Literal('create', 'update', 'delete', 'merge'),
  relatedIds: Schema.optional(Schema.Array(Schema.String)),
  tokenKey: Schema.String,
  webhookData: Schema.optional(Schema.Unknown),
})

// Define the workflow
export const ExternalSyncSingleEntityWorkflow = Workflow.make({
  error: ExternalSyncSingleEntityError,
  idempotencyKey: ({ tokenKey, entityType, entityId }) =>
    `single-entity-sync-${tokenKey}-${entityType}-${entityId}-${Date.now()}`,
  name: 'ExternalSyncSingleEntityWorkflow',
  payload: ExternalSyncSingleEntityPayload,
  success: Schema.Void,
})

// Helper to get adapter layer based on tokenKey/orgId
const getAdapterLayer = (_tokenKey: string) => {
  // For now, always return PCO layer
  // TODO: Determine adapter from tokenKey
  return PcoAdapterOperationsLayer
}

// Create the workflow implementation layer
export const ExternalSyncSingleEntityWorkflowLayer = ExternalSyncSingleEntityWorkflow.toLayer(
  Effect.fn('ExternalSyncSingleEntityWorkflow')(function* (payload, executionId) {
    const { tokenKey, entityType, entityId, operation, relatedIds, webhookData } = payload

    yield* Effect.log(`🔄 Syncing single entity: ${entityType} ${entityId} (${operation})`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    // Create the sync activity
    yield* Activity.make({
      error: ExternalSyncSingleEntityError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(Effect.log(`📊 Processing ${operation} for ${entityType}`), {
          attempt,
          entityId,
          entityType,
          executionId,
          operation,
          tokenKey,
        })

        // Get adapter operations
        const adapterOps = yield* AdapterOperations.pipe(
          Effect.provide(getAdapterLayer(tokenKey)),
          Effect.provideService(TokenKey, tokenKey),
        )

        const adapterTag = adapterOps.getAdapterTag()
        yield* Effect.log(`Using adapter: ${adapterTag}`)

        switch (operation) {
          case 'create':
          case 'update': {
            // Try to fetch fresh data from API, fall back to webhook data if it fails
            const entityData = yield* adapterOps.fetchEntityById(entityType, entityId).pipe(
              Effect.catchAll((error) =>
                Effect.gen(function* () {
                  if (webhookData) {
                    yield* Effect.logWarning(
                      'Failed to fetch entity from API, using webhook data as fallback',
                      {
                        entityId,
                        entityType,
                        error,
                      },
                    )
                    return webhookData
                  }
                  return yield* Effect.fail(error)
                }),
              ),
            )

            // TODO: Implement actual data saving
            yield* Effect.log(`Would save entity data for ${entityType} ${entityId}`)

            // Create mutation shape for external push
            const mutation: Mutation = {
              args: [
                {
                  ops: [
                    {
                      op: 'upsert' as const,
                      primaryKey: { externalId: entityId },
                      tableName: mkTableName(entityType),
                      value: entityData as Record<string, unknown>,
                    },
                  ],
                },
              ],
              clientID: nanoid(),
              id: Date.now(),
              name: '_zero_crud',
              timestamp: Date.now(),
              type: 'crud' as const,
            }

            // Trigger external push to sync to external system (exclude PCO since it came from there)
            yield* mutationSideEffects({
              mutations: [mutation],
              source: 'pco',
              tokenKey,
            })

            break
          }

          case 'delete': {
            // TODO: Implement entity deletion
            yield* Effect.log(`Would delete entity ${entityType} ${entityId}`)

            // Create delete mutation for external push
            const mutation: Mutation = {
              args: [
                {
                  ops: [
                    {
                      op: 'delete' as const,
                      primaryKey: { externalId: entityId },
                      tableName: mkTableName(entityType),
                      value: { externalId: entityId }, // Add value for delete operation
                    },
                  ],
                },
              ],
              clientID: nanoid(),
              id: Date.now(),
              name: '_zero_crud',
              timestamp: Date.now(),
              type: 'crud' as const,
            }

            yield* mutationSideEffects({
              mutations: [mutation],
              source: 'pco',
              tokenKey,
            })

            break
          }

          case 'merge': {
            // For merges: update the kept entity, delete the removed one
            const [keepId, removeId] = [entityId, relatedIds?.[0]]

            if (removeId) {
              // Try to fetch the kept entity, fall back to webhook data if available
              const keptEntityData = yield* adapterOps.fetchEntityById(entityType, keepId).pipe(
                Effect.catchAll((error) =>
                  Effect.gen(function* () {
                    if (webhookData) {
                      yield* Effect.logWarning(
                        'Failed to fetch merged entity from API, using webhook data as fallback',
                        {
                          entityId: keepId,
                          entityType,
                          error,
                        },
                      )
                      return webhookData
                    }
                    return yield* Effect.fail(error)
                  }),
                ),
              )

              // TODO: Implement actual data saving
              yield* Effect.log(`Would save merged entity data for ${entityType} ${keepId}`)

              // TODO: Mark the removed entity as deleted
              yield* Effect.log(
                `Would delete entity ${entityType} ${removeId} (merged into ${keepId})`,
              )

              // Create mutations for external push
              const mutations: Array<Mutation> = [
                // Update mutation for kept entity
                {
                  args: [
                    {
                      ops: [
                        {
                          op: 'upsert' as const,
                          primaryKey: { externalId: keepId },
                          tableName: mkTableName(entityType),
                          value: keptEntityData as Record<string, unknown>,
                        },
                      ],
                    },
                  ],
                  clientID: nanoid(),
                  id: Date.now(),
                  name: '_zero_crud',
                  timestamp: Date.now(),
                  type: 'crud' as const,
                },
                // Delete mutation for removed entity
                {
                  args: [
                    {
                      ops: [
                        {
                          op: 'delete' as const,
                          primaryKey: { externalId: removeId },
                          tableName: mkTableName(entityType),
                          value: { externalId: removeId }, // Add value for delete
                        },
                      ],
                    },
                  ],
                  clientID: nanoid(),
                  id: Date.now() + 1,
                  name: '_zero_crud',
                  timestamp: Date.now(),
                  type: 'crud' as const,
                },
              ]

              yield* mutationSideEffects({
                mutations,
                source: 'pco',
                tokenKey,
              })
            }

            break
          }
        }

        yield* Effect.log(`✅ Completed ${operation} for ${entityType} ${entityId}`)
      }).pipe(
        Effect.withSpan('single-entity-sync-activity'),
        Effect.provide(getAdapterLayer(tokenKey)),
        Effect.provideService(TokenKey, tokenKey),
        Effect.tapError((error) =>
          Effect.logError('Single entity sync failed', {
            entityId,
            entityType,
            error,
            operation,
            tokenKey,
          }),
        ),
        Effect.mapError(
          (error) =>
            new ExternalSyncSingleEntityError({
              cause: error,
              entityId,
              entityType,
              message: 'Single entity sync failed',
              tokenKey,
            }),
        ),
      ),
      name: 'SyncSingleEntity',
    }).pipe(Activity.retry({ times: 3 }))

    yield* Effect.log(`✅ Completed single entity sync workflow for ${entityType} ${entityId}`)
  }),
)
