import { Activity, Workflow } from '@effect/workflow'
import { externalSyncEntity, TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterManagerLayer } from '@openfaith/pco/server'
import { InternalManagerLive } from '@openfaith/server'
import { Effect, Layer, Schema } from 'effect'

// Define the Internal sync entity error
class InternalSyncEntityError extends Schema.TaggedError<InternalSyncEntityError>()(
  'InternalSyncEntityError',
  {
    cause: Schema.optional(Schema.Unknown),
    entityType: Schema.optional(Schema.String),
    message: Schema.String,
    tokenKey: Schema.optional(Schema.String),
  },
) {}

// Define the workflow payload schema
const InternalSyncEntityPayload = Schema.Struct({
  adapter: Schema.String,
  entity: Schema.String,
  tokenKey: Schema.String,
})

// Define the Internal sync entity workflow
export const InternalSyncEntityWorkflow = Workflow.make({
  error: InternalSyncEntityError,
  idempotencyKey: ({ tokenKey, adapter, entity }) =>
    `internal-sync-entity-${adapter}-${entity}-${tokenKey}-${new Date().toISOString()}`,
  name: 'InternalSyncEntityWorkflow',
  payload: InternalSyncEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const InternalSyncEntityWorkflowLayer = InternalSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting internal sync entity workflow for: ${payload.entity}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, adapter, entity } = payload

    // For now, hardcode PCO like the external workflows do
    // TODO: Make this dynamic once we have more adapters
    if (adapter !== 'pco') {
      return yield* Effect.fail(
        new InternalSyncEntityError({
          entityType: entity,
          message: `Adapter not supported: ${adapter}. Only 'pco' is currently supported.`,
          tokenKey,
        }),
      )
    }

    // Create the main sync activity
    yield* Activity.make({
      error: InternalSyncEntityError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(Effect.log(`📊 Syncing internal data for ${entity}`), {
          adapter,
          attempt,
          entityType: entity,
          executionId,
          tokenKey,
        })

        // Core internal sync logic using adapter operations like external workflows
        yield* externalSyncEntity(entity).pipe(
          Effect.provide(Layer.mergeAll(PcoAdapterManagerLayer, InternalManagerLive)),
          Effect.provideService(TokenKey, tokenKey),
          Effect.mapError(
            (cause) =>
              new InternalSyncEntityError({
                cause,
                entityType: entity,
                message: `Failed to sync ${entity} entity`,
                tokenKey,
              }),
          ),
        )

        yield* Effect.annotateLogs(Effect.log(`✅ Completed internal sync for ${entity}`), {
          adapter,
          attempt,
          entityType: entity,
          executionId,
          tokenKey,
        })
      }).pipe(
        Effect.withSpan('internal-sync-entity-activity'),
        Effect.tapError((error) =>
          Effect.logError('Entity sync failed', {
            adapter,
            entityType: entity,
            error,
            tokenKey,
          }),
        ),
      ),
      name: 'SyncInternalEntityData',
    }).pipe(Activity.retry({ times: 3 }))

    yield* Effect.log(`✅ Completed internal sync entity workflow for: ${entity}`)
  }),
)
