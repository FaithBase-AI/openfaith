import { Workflow } from '@effect/workflow'
import { TokenKey } from '@openfaith/adapter-core'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { ExternalSyncEntityWorkflow } from '@openfaith/workers/workflows/extenralSyncEntityWorkflow'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

// Define the external sync error
class PcoSyncError extends Schema.TaggedError<PcoSyncError>('PcoSyncError')('PcoSyncError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const PcoSyncPayload = Schema.Struct({
  tokenKey: Schema.String,
})

// Define the external sync workflow
export const PcoSyncWorkflow = Workflow.make({
  error: PcoSyncError,
  idempotencyKey: ({ tokenKey }) => `external-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'PcoSyncWorkflow',
  payload: PcoSyncPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const PcoSyncWorkflowLayer = PcoSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting external sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey } = payload

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
        Effect.mapError((err) => new PcoSyncError({ message: err.message })),
      ),
    )

    yield* Effect.log(`✅ Completed external sync workflow for token: ${payload.tokenKey}`)
  }),
)
