import { Workflow } from '@effect/workflow'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { InternalSyncEntityWorkflow } from '@openfaith/workers/workflows/internalSyncEntityWorkflow'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

// Define the internal sync error
class InternalSyncError extends Schema.TaggedError<InternalSyncError>()('InternalSyncError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const InternalSyncPayload = Schema.Struct({
  adapter: Schema.String,
  tokenKey: Schema.String,
})

// Define the internal sync workflow
export const InternalSyncWorkflow = Workflow.make({
  error: InternalSyncError,
  idempotencyKey: ({ tokenKey, adapter }) =>
    `internal-sync-${adapter}-${tokenKey}-${new Date().toISOString()}`,
  name: 'InternalSyncWorkflow',
  payload: InternalSyncPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const InternalSyncWorkflowLayer = InternalSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting internal sync workflow for adapter: ${payload.adapter}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, adapter } = payload

    // For now, hardcode PCO like the external workflows do
    // TODO: Make this dynamic once we have more adapters
    if (adapter !== 'pco') {
      return yield* Effect.fail(
        new InternalSyncError({
          message: `Adapter not supported: ${adapter}. Only 'pco' is currently supported.`,
        }),
      )
    }

    // Get adapter operations to discover entities
    const adapterOps = yield* AdapterOperations.pipe(
      Effect.provide(PcoAdapterOperationsLayer),
      Effect.provideService(TokenKey, tokenKey),
    )

    const entityManifest = adapterOps.getEntityManifest()

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
        InternalSyncEntityWorkflow.execute({ adapter, entity, tokenKey }).pipe(
          Effect.mapError((err) => new InternalSyncError({ message: err.message })),
        ),
      { concurrency: 1 }, // Process entities sequentially to avoid overwhelming the external API
    )

    yield* Effect.log(`✅ Completed internal sync workflow for adapter: ${adapter}`)
  }),
)
