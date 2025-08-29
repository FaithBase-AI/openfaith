import { Activity, Workflow } from '@effect/workflow'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { saveDataE } from '@openfaith/workers/helpers/saveDataE'
import { Effect, Schema } from 'effect'

// Define the Internal sync entity error
class InternalSyncEntityError extends Schema.TaggedError<InternalSyncEntityError>()(
  'InternalSyncEntityError',
  {
    cause: Schema.optional(Schema.Unknown),
    entityType: Schema.optional(Schema.String),
    message: Schema.String,
    tokenKey: Schema.optional(Schema.String),
  },
) {}

// Define the workflow payload schema
const InternalSyncEntityPayload = Schema.Struct({
  adapter: Schema.String,
  entity: Schema.String,
  tokenKey: Schema.String,
})

// Define the Internal sync entity workflow
export const InternalSyncEntityWorkflow = Workflow.make({
  error: InternalSyncEntityError,
  idempotencyKey: ({ tokenKey, adapter, entity }) =>
    `internal-sync-entity-${adapter}-${entity}-${tokenKey}-${new Date().toISOString()}`,
  name: 'InternalSyncEntityWorkflow',
  payload: InternalSyncEntityPayload,
  success: Schema.Void,
})

// Internal sync entity function - follows external workflow pattern
const internalSyncEntity = Effect.fn('internalSyncEntity')(function* (
  entityType: string,
  tokenKey: string,
) {
  yield* Effect.logInfo(`Starting internal sync for entity: ${entityType}`)

  // Use AdapterOperations to process entity data, similar to external workflows
  const adapterOps = yield* AdapterOperations.pipe(
    Effect.provide(PcoAdapterOperationsLayer),
    Effect.provideService(TokenKey, tokenKey),
  )

  // Process entity data using saveDataE (same as external workflows)
  // This handles the database operations directly
  yield* adapterOps.processEntityData(entityType, (data) => saveDataE(data as any))

  yield* Effect.logInfo(`Completed internal sync for entity: ${entityType}`)
})

// Create the workflow implementation layer
export const InternalSyncEntityWorkflowLayer = InternalSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting internal sync entity workflow for: ${payload.entity}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, adapter, entity } = payload

    // For now, hardcode PCO like the external workflows do
    // TODO: Make this dynamic once we have more adapters
    if (adapter !== 'pco') {
      return yield* Effect.fail(
        new InternalSyncEntityError({
          entityType: entity,
          message: `Adapter not supported: ${adapter}. Only 'pco' is currently supported.`,
          tokenKey,
        }),
      )
    }

    // Create the main sync activity
    yield* Activity.make({
      error: InternalSyncEntityError,
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
        yield* internalSyncEntity(entity, tokenKey).pipe(
          Effect.provide(PcoAdapterOperationsLayer),
          Effect.provideService(TokenKey, tokenKey),
          Effect.mapError(
            (cause) =>
              new InternalSyncEntityError({
                cause,
                entityType: entity,
                message: `Failed to sync ${entity} entity`,
                tokenKey,
              }),
          ),
        )

        yield* Effect.annotateLogs(Effect.log(`✅ Completed internal sync for ${entity}`), {
          adapter,
          attempt,
          entityType: entity,
          executionId,
          tokenKey,
        })
      }).pipe(
        Effect.withSpan('internal-sync-entity-activity'),
        Effect.tapError((error) =>
          Effect.logError('Entity sync failed', {
            adapter,
            entityType: entity,
            error,
            tokenKey,
          }),
        ),
      ),
      name: 'SyncInternalEntityData',
    }).pipe(Activity.retry({ times: 3 }))

    yield* Effect.log(`✅ Completed internal sync entity workflow for: ${entity}`)
  }),
)
