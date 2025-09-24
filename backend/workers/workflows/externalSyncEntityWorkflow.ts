import { Activity, Workflow } from '@effect/workflow'
import { externalSyncEntity, TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterManagerLayer } from '@openfaith/pco/server'
import { InternalManagerLive } from '@openfaith/server'
import { Effect, Layer, Schema } from 'effect'

// Define the External sync entity error
class ExternalSyncEntityError extends Schema.TaggedError<ExternalSyncEntityError>()(
  'ExternalSyncEntityError',
  {
    cause: Schema.optional(Schema.Unknown),
    entityType: Schema.optional(Schema.String),
    message: Schema.String,
    tokenKey: Schema.optional(Schema.String),
  },
) {}

// Define the workflow payload schema
const ExternalSyncEntityPayload = Schema.Struct({
  adapter: Schema.String,
  entity: Schema.String,
  tokenKey: Schema.String,
})

// Define the External sync entity workflow
export const ExternalSyncEntityWorkflow = Workflow.make({
  error: ExternalSyncEntityError,
  idempotencyKey: ({ tokenKey, adapter, entity }) =>
    `internal-sync-entity-${adapter}-${entity}-${tokenKey}-${new Date().toISOString()}`,
  name: 'ExternalSyncEntityWorkflow',
  payload: ExternalSyncEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalSyncEntityWorkflowLayer = ExternalSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting internal sync entity workflow for: ${payload.entity}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, adapter, entity } = payload

    // For now, hardcode PCO like the external workflows do
    // TODO: Make this dynamic once we have more adapters
    if (adapter !== 'pco') {
      return yield* Effect.fail(
        new ExternalSyncEntityError({
          entityType: entity,
          message: `Adapter not supported: ${adapter}. Only 'pco' is currently supported.`,
          tokenKey,
        }),
      )
    }

    // Create the main sync activity
    yield* Activity.make({
      error: ExternalSyncEntityError,
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
        )

        yield* Effect.annotateLogs(Effect.log(`✅ Completed internal sync for ${entity}`), {
          adapter,
          attempt,
          entityType: entity,
          executionId,
          tokenKey,
        })
      }).pipe(
        Effect.catchTags({
          AdapterEntityMethodNotFoundError: (error) =>
            Effect.fail(
              new ExternalSyncEntityError({
                cause: error,
                entityType: entity,
                message: `Failed to sync ${entity} entity`,
                tokenKey,
              }),
            ),
          AdapterEntityNotFoundError: (error) =>
            Effect.fail(
              new ExternalSyncEntityError({
                cause: error,
                entityType: entity,
                message: `Failed to sync ${entity} entity`,
                tokenKey,
              }),
            ),
          AdapterFetchError: (error) =>
            Effect.fail(
              new ExternalSyncEntityError({
                cause: error,
                entityType: entity,
                message: `Failed to sync ${entity} entity`,
                tokenKey,
              }),
            ),
          AdapterTransformError: (error) =>
            Effect.fail(
              new ExternalSyncEntityError({
                cause: error,
                entityType: entity,
                message: `Failed to sync ${entity} entity`,
                tokenKey,
              }),
            ),
          DetectionError: (error) =>
            Effect.fail(
              new ExternalSyncEntityError({
                cause: error,
                entityType: entity,
                message: `Failed to sync ${entity} entity`,
                tokenKey,
              }),
            ),
        }),
      ),
      name: 'SyncExternalEntityData',
    }).pipe(Activity.retry({ times: 3 }))

    yield* Effect.log(`✅ Completed internal sync entity workflow for: ${entity}`)
  }),
)
