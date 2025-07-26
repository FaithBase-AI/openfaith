import { Workflow } from '@effect/workflow'
import { TokenKey } from '@openfaith/adapter-core'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { ExternalSyncEntityWorkflow } from '@openfaith/workers/workflows/externalSyncEntityWorkflow'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

// Define the external sync error
class ExternalSyncError extends Schema.TaggedError<ExternalSyncError>('ExternalSyncError')(
  'ExternalSyncError',
  {
    message: Schema.String,
  },
) {}

// Define the workflow payload schema
const ExternalSyncPayload = Schema.Struct({
  adapter: Schema.String,
  tokenKey: Schema.String,
})

// Define the external sync workflow
export const ExternalSyncWorkflow = Workflow.make({
  error: ExternalSyncError,
  idempotencyKey: ({ tokenKey }) => `external-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'ExternalSyncWorkflow',
  payload: ExternalSyncPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalSyncWorkflowLayer = ExternalSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting external sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, adapter } = payload

    console.log('adapter', adapter)

    const adapterOps = yield* AdapterOperations.pipe(
      Effect.provide(PcoAdapterOperationsLayer),
      Effect.provideService(TokenKey, payload.tokenKey),
    )
    const entityManifest = adapterOps.getEntityManifest()

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

    yield* Effect.forEach(syncEntities, (entity) =>
      ExternalSyncEntityWorkflow.execute({ entity, tokenKey }).pipe(
        Effect.mapError((err) => new ExternalSyncError({ message: err.message })),
      ),
    )

    yield* Effect.log(`✅ Completed external sync workflow for token: ${payload.tokenKey}`)
  }),
)
