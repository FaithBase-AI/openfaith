import { Activity, Workflow } from '@effect/workflow'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { detectAndMarkDeletedEntitiesE, saveDataE } from '@openfaith/workers/helpers/saveDataE'
import { Effect, Schema } from 'effect'

// Define the External sync error
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

    // Record sync start time BEFORE we begin processing - this is crucial for deletion detection
    const syncStartTime = new Date()

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

        yield* adapterOps.processEntityData(payload.entity, (data) => saveDataE(data as any))
      }).pipe(
        Effect.withSpan('external-sync-activity'),
        Effect.provide(PcoAdapterOperationsLayer),
        Effect.provideService(TokenKey, payload.tokenKey),
        Effect.tapError((error) =>
          Effect.logError('Entity sync failed', {
            entityType: payload.entity,
            error,
            tokenKey: payload.tokenKey,
          }),
        ),
        Effect.mapError(
          (error) =>
            new ExternalSyncEntityError({
              cause: error,
              entityType: payload.entity,
              message: 'Entity sync failed',
              tokenKey: payload.tokenKey,
            }),
        ),
      ),
      name: 'SyncPcoData',
    }).pipe(Activity.retry({ times: 3 }))

    // After successful sync, detect and mark deleted entities
    yield* Activity.make({
      error: ExternalSyncEntityError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(Effect.log(`🗑️ Starting deletion detection`), {
          attempt,
          entityType: payload.entity,
          executionId,
          tokenKey: payload.tokenKey,
        })

        // Get adapter type dynamically
        const adapterOps = yield* AdapterOperations.pipe(
          Effect.provide(PcoAdapterOperationsLayer),
          Effect.provideService(TokenKey, payload.tokenKey),
        )
        const adapterType = adapterOps.getAdapterTag()

        yield* detectAndMarkDeletedEntitiesE({
          adapter: adapterType,
          entityType: payload.entity,
          syncStartTime,
        })

        yield* Effect.annotateLogs(Effect.log(`✅ Completed deletion detection`), {
          attempt,
          entityType: payload.entity,
          executionId,
          tokenKey: payload.tokenKey,
        })
      }).pipe(
        Effect.withSpan('deletion-detection-activity'),
        Effect.provideService(TokenKey, payload.tokenKey),
        Effect.tapError((error) =>
          Effect.logError('Deletion detection failed', {
            entityType: payload.entity,
            error,
            tokenKey: payload.tokenKey,
          }),
        ),
        Effect.mapError(
          (error) =>
            new ExternalSyncEntityError({
              cause: error,
              entityType: payload.entity,
              message: 'Deletion detection failed',
              tokenKey: payload.tokenKey,
            }),
        ),
      ),
      name: 'DetectDeletedEntities',
    }).pipe(
      Activity.retry({ times: 2 }), // Fewer retries since this is cleanup
      Effect.catchAll((error) => {
        // Log deletion detection errors but don't fail the workflow
        return Effect.annotateLogs(
          Effect.logError('Deletion detection activity failed, continuing workflow'),
          {
            entityType: payload.entity,
            error,
            tokenKey: payload.tokenKey,
          },
        )
      }),
    )

    yield* Effect.log(`✅ Completed External sync workflow for token: ${payload.tokenKey}`)
  }),
)
