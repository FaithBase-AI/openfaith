import { Workflow } from '@effect/workflow'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'
import { PcoSyncEntityWorkflow } from './pcoSyncEntityWorkflow'

// Define the PCO sync error
class PcoSyncError extends Schema.TaggedError<PcoSyncError>('PcoSyncError')('PcoSyncError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const PcoSyncPayload = Schema.Struct({
  tokenKey: Schema.String,
})

// Define the PCO sync workflow
export const PcoSyncWorkflow = Workflow.make({
  error: PcoSyncError,
  idempotencyKey: ({ tokenKey }) => `pco-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'PcoSyncWorkflow',
  payload: PcoSyncPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const PcoSyncWorkflowLayer = PcoSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting PCO sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey } = payload

    const syncEntities = pipe(
      pcoEntityManifest,
      Record.values,
      Array.filterMap((entity) => {
        if ('list' in entity.endpoints && entity.skipSync === false) {
          return Option.some(entity.entity)
        }
        return Option.none()
      }),
    )

    yield* Effect.forEach(syncEntities, (entity) =>
      PcoSyncEntityWorkflow.execute({ entity, tokenKey }).pipe(
        Effect.mapError((err) => new PcoSyncError({ message: err.message })),
      ),
    )

    yield* Effect.log(`✅ Completed PCO sync workflow for token: ${payload.tokenKey}`)
  }),
)
