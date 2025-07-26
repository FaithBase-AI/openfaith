import { Activity, Workflow } from '@effect/workflow'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { saveDataE } from '@openfaith/workers/helpers/saveDataE'
import { Effect, Schema } from 'effect'

// Define the External sync error
class ExternalSyncEntityError extends Schema.TaggedError<ExternalSyncEntityError>(
  'ExternalSyncEntityError',
)('ExternalSyncEntityError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const ExternalSyncEntityPayload = Schema.Struct({
  entity: Schema.String,
  tokenKey: Schema.String,
})

// Define the External sync workflow
export const ExternalSyncEntityWorkflow = Workflow.make({
  error: ExternalSyncEntityError,
  idempotencyKey: ({ tokenKey }) => `external-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'ExternalSyncEntityWorkflow',
  payload: ExternalSyncEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalSyncEntityWorkflowLayer = ExternalSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting External sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    console.log('yeet')

    // Create the External sync activity
    yield* Activity.make({
      error: ExternalSyncEntityError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(Effect.log(`📊 Syncing External data`), {
          attempt,
          executionId,
          tokenKey: payload.tokenKey,
        })

        // Core External sync logic - process all entity data using processEntityData with saveDataE
        const adapterOps = yield* AdapterOperations.pipe(
          Effect.provide(PcoAdapterOperationsLayer),
          Effect.provideService(TokenKey, payload.tokenKey),
        )

        yield* adapterOps
          .processEntityData(payload.entity, (data) =>
            saveDataE(data as any).pipe(
              Effect.mapError((error) => {
                console.log(error)
                return new ExternalSyncEntityError({
                  message: String(error),
                })
              }),
            ),
          )
          .pipe(
            Effect.mapError((error) => {
              console.log(error)
              return new ExternalSyncEntityError({ message: String(error) })
            }),
          )
      }).pipe(
        Effect.withSpan('external-sync-activity'),
        Effect.provide(PcoAdapterOperationsLayer),
        Effect.provideService(TokenKey, payload.tokenKey),
      ),
      name: 'SyncPcoData',
    }).pipe(
      Activity.retry({ times: 3 }),
      ExternalSyncEntityWorkflow.withCompensation(
        Effect.fn(function* (_value, cause) {
          yield* Effect.log(`🔄 Compensating External sync activity for token: ${payload.tokenKey}`)
          yield* Effect.log(`📋 Cause: ${cause}`)
          // Add any cleanup logic here if needed
        }),
      ),
    )

    yield* Effect.log(`✅ Completed External sync workflow for token: ${payload.tokenKey}`)
  }),
)
