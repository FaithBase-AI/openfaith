import { Activity, Workflow } from '@effect/workflow'
import { TokenKey } from '@openfaith/adapter-core/server'
import { ExternalLinkManagerLive } from '@openfaith/server/live/externalLinkManagerLive'
import { PcoApiLayer } from '@openfaith/server/live/pcoApiLive'
import { Effect, Schema } from 'effect'
import { syncDataE } from '../helpers/syncDataE'

// Define the external sync entity error
class ExternalSyncEntityError extends Schema.TaggedError<ExternalSyncEntityError>(
  'ExternalSyncEntityError',
)('ExternalSyncEntityError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const ExternalSyncEntityPayload = Schema.Struct({
  entityName: Schema.String,
  mutations: Schema.Array(
    Schema.Struct({
      mutation: Schema.Unknown,
      op: Schema.Unknown,
    }),
  ),
  tokenKey: Schema.String,
})

// Define the external sync entity workflow
export const ExternalSyncEntityWorkflow = Workflow.make({
  error: ExternalSyncEntityError,
  idempotencyKey: ({ tokenKey, entityName }) =>
    `external-sync-entity-${tokenKey}-${entityName}-${new Date().toISOString()}`,
  name: 'ExternalSyncEntityWorkflow',
  payload: ExternalSyncEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalSyncEntityWorkflowLayer = ExternalSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting external sync entity workflow for: ${payload.entityName}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { entityName, mutations, tokenKey } = payload

    // Create the external sync activity
    yield* Activity.make({
      error: ExternalSyncEntityError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(
          Effect.log(`📊 Syncing external data for entity: ${entityName}`),
          {
            attempt,
            entityName,
            executionId,
            mutationCount: mutations.length,
            tokenKey,
          },
        )

        // Process mutations using the helper
        yield* syncDataE(mutations).pipe(
          Effect.mapError(
            (error: unknown) =>
              new ExternalSyncEntityError({
                message: error instanceof Error ? error.message : `${error}`,
              }),
          ),
        )
      }).pipe(
        Effect.withSpan('external-sync-entity-activity'),
        Effect.provide(ExternalLinkManagerLive),
        Effect.provide(PcoApiLayer),
        Effect.provideService(TokenKey, tokenKey),
      ),
      name: 'SyncExternalEntityData',
    }).pipe(
      Activity.retry({ times: 3 }),
      ExternalSyncEntityWorkflow.withCompensation(
        Effect.fn(function* (_value, cause) {
          yield* Effect.log(`🔄 Compensating external sync entity activity for: ${entityName}`)
          yield* Effect.log(`📋 Cause: ${cause}`)
          // Add any cleanup logic here if needed
        }),
      ),
    )

    yield* Effect.log(`✅ Completed external sync entity workflow for: ${entityName}`)
  }),
)
