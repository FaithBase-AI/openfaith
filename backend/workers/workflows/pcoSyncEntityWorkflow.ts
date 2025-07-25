import { Activity, Workflow } from '@effect/workflow'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { saveDataE } from '@openfaith/workers/helpers/saveDataE'
import { Effect, Schema } from 'effect'

// Define the PCO sync error
class PcoSyncEntityError extends Schema.TaggedError<PcoSyncEntityError>('PcoSyncEntityError')(
  'PcoSyncEntityError',
  {
    message: Schema.String,
  },
) {}

// Define the workflow payload schema
const PcoSyncEntityPayload = Schema.Struct({
  entity: Schema.String,
  tokenKey: Schema.String,
})

// Define the PCO sync workflow
export const PcoSyncEntityWorkflow = Workflow.make({
  error: PcoSyncEntityError,
  idempotencyKey: ({ tokenKey }) => `pco-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'PcoSyncEntityWorkflow',
  payload: PcoSyncEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const PcoSyncEntityWorkflowLayer = PcoSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting PCO sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    console.log('yeet')

    // Create the PCO sync activity
    yield* Activity.make({
      error: PcoSyncEntityError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(Effect.log(`📊 Syncing PCO data`), {
          attempt,
          executionId,
          tokenKey: payload.tokenKey,
        })

        // Core PCO sync logic - process all entity data using processEntityData with saveDataE
        const adapterOps = yield* AdapterOperations.pipe(
          Effect.provide(PcoAdapterOperationsLayer),
          Effect.provideService(TokenKey, payload.tokenKey),
        )

        yield* adapterOps
          .processEntityData(payload.entity, (data) =>
            saveDataE(data as any).pipe(
              Effect.mapError((error) => {
                console.log(error)
                return new PcoSyncEntityError({ message: String(error) })
              }),
            ),
          )
          .pipe(
            Effect.mapError((error) => {
              console.log(error)
              return new PcoSyncEntityError({ message: String(error) })
            }),
          )
      }).pipe(
        Effect.withSpan('pco-sync-activity'),
        Effect.provide(PcoAdapterOperationsLayer),
        Effect.provideService(TokenKey, payload.tokenKey),
      ),
      name: 'SyncPcoData',
    }).pipe(
      Activity.retry({ times: 3 }),
      PcoSyncEntityWorkflow.withCompensation(
        Effect.fn(function* (_value, cause) {
          yield* Effect.log(`🔄 Compensating PCO sync activity for token: ${payload.tokenKey}`)
          yield* Effect.log(`📋 Cause: ${cause}`)
          // Add any cleanup logic here if needed
        }),
      ),
    )

    yield* Effect.log(`✅ Completed PCO sync workflow for token: ${payload.tokenKey}`)
  }),
)
