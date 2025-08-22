import { Activity, Workflow } from '@effect/workflow'
import { TokenKey } from '@openfaith/adapter-core/server'
import { CRUDMutation, CRUDOp } from '@openfaith/domain'
import { ExternalLinkManagerLive } from '@openfaith/server/live/externalLinkManagerLive'
import { PcoApiLayer } from '@openfaith/server/live/pcoApiLive'
import {
  EntityTransformError,
  ExternalPushError,
  syncDataE,
  UnsupportedAdapterError,
  UnsupportedOperationError,
} from '@openfaith/workers/helpers/syncDataE'
import { Effect, Layer, Schema } from 'effect'

// Create a Schema version of ExternalLinkNotFoundError for workflow compatibility
class ExternalLinkNotFoundErrorSchema extends Schema.TaggedError<ExternalLinkNotFoundErrorSchema>(
  'ExternalLinkNotFound',
)('ExternalLinkNotFound', {
  cause: Schema.optional(Schema.Unknown),
  entityId: Schema.String,
  entityType: Schema.String,
  message: Schema.optional(Schema.String),
}) {}

// Define the workflow payload schema
const ExternalPushEntityPayload = Schema.Struct({
  entityName: Schema.String,
  excludeAdapter: Schema.optional(Schema.Literal('pco', 'ccb')),
  mutations: Schema.Array(
    Schema.Struct({
      mutation: CRUDMutation,
      op: CRUDOp,
    }),
  ),
  tokenKey: Schema.String,
})

// Define the external sync entity workflow with union of specific error types
export const ExternalPushEntityWorkflow = Workflow.make({
  error: Schema.Union(
    EntityTransformError,
    UnsupportedOperationError,
    UnsupportedAdapterError,
    ExternalPushError,
    ExternalLinkNotFoundErrorSchema,
  ),
  idempotencyKey: ({ tokenKey, entityName }) =>
    `external-sync-entity-${tokenKey}-${entityName}-${new Date().toISOString()}`,
  name: 'ExternalPushEntityWorkflow',
  payload: ExternalPushEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalPushEntityWorkflowLayer = ExternalPushEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting external sync entity workflow for: ${payload.entityName}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { entityName, mutations, tokenKey, excludeAdapter } = payload

    // Create the external sync activity
    yield* Activity.make({
      error: Schema.Union(
        EntityTransformError,
        UnsupportedOperationError,
        UnsupportedAdapterError,
        ExternalPushError,
        ExternalLinkNotFoundErrorSchema,
      ),
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

        // Process mutations using the helper - let specific errors flow through
        yield* syncDataE(mutations, excludeAdapter)
      }).pipe(
        Effect.withSpan('external-sync-entity-activity'),
        Effect.provide(Layer.mergeAll(ExternalLinkManagerLive, PcoApiLayer)),
        Effect.provideService(TokenKey, tokenKey),
        Effect.tapError((error) =>
          Effect.logError('External sync failed', {
            entityName,
            error,
            mutationCount: mutations.length,
            tokenKey,
          }),
        ),
      ),
      name: 'SyncExternalEntityData',
    }).pipe(Activity.retry({ times: 3 }))

    yield* Effect.log(`✅ Completed external sync entity workflow for: ${entityName}`)
  }),
)
