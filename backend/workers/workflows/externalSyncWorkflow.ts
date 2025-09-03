import { Workflow } from '@effect/workflow'
import { AdapterManager, TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterManagerLayer } from '@openfaith/pco/server'
import { ExternalSyncEntityWorkflow } from '@openfaith/workers/workflows/externalSyncEntityWorkflow'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

// Define the internal sync error
class ExternalSyncError extends Schema.TaggedError<ExternalSyncError>()('ExternalSyncError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const ExternalSyncPayload = Schema.Struct({
  adapter: Schema.String,
  tokenKey: Schema.String,
})

// Define the internal sync workflow
export const ExternalSyncWorkflow = Workflow.make({
  error: ExternalSyncError,
  idempotencyKey: ({ tokenKey, adapter }) =>
    `internal-sync-${adapter}-${tokenKey}-${new Date().toISOString()}`,
  name: 'ExternalSyncWorkflow',
  payload: ExternalSyncPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalSyncWorkflowLayer = ExternalSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting internal sync workflow for adapter: ${payload.adapter}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, adapter } = payload

    // For now, hardcode PCO like the external workflows do
    // TODO: Make this dynamic once we have more adapters
    if (adapter !== 'pco') {
      return yield* Effect.fail(
        new ExternalSyncError({
          message: `Adapter not supported: ${adapter}. Only 'pco' is currently supported.`,
        }),
      )
    }

    const adapterManager = yield* AdapterManager.pipe(
      Effect.provide(PcoAdapterManagerLayer),
      Effect.provideService(TokenKey, tokenKey),
    )

    const entityManifest = adapterManager.getEntityManifest()

    // Filter entities that support sync (have list endpoints and skipSync is false)
    const syncEntities = pipe(
      entityManifest,
      Record.values,
      Array.filterMap((entity) => {
        if ('list' in entity.endpoints && entity.skipSync === false) {
          return Option.some(entity.entity)
        }
        return Option.none()
      }),
    )

    yield* Effect.logInfo('Discovered entities for sync', {
      adapter,
      entities: syncEntities,
      entityCount: syncEntities.length,
    })

    // Process each entity using the internal sync entity workflow
    yield* Effect.forEach(
      syncEntities,
      (entity) =>
        ExternalSyncEntityWorkflow.execute({ adapter, entity, tokenKey }).pipe(
          Effect.mapError((err) => new ExternalSyncError({ message: err.message })),
        ),
      { concurrency: 1 }, // Process entities sequentially to avoid overwhelming the external API
    )

    yield* Effect.log(`✅ Completed internal sync workflow for adapter: ${adapter}`)
  }),
)
