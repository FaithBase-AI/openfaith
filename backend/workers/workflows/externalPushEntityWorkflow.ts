import { Activity, Workflow } from '@effect/workflow'
import { processMutation } from '@openfaith/adapter-core/chains/syncEngine.chain'
import {
  AdapterEntityNotFoundError,
  AdapterFetchError,
  AdapterTransformError,
  DetectionError,
  EntityProcessingError,
  ExternalLinkRetrievalError,
  ExternalLinkUpsertError,
  RelationshipProcessingError,
  TokenKey,
} from '@openfaith/adapter-core/server'
import { CRUDMutation, CRUDOp } from '@openfaith/domain'
import { PcoAdapterManagerLayer } from '@openfaith/pco/server'
import { InternalManagerLive } from '@openfaith/server/live/internalManagerLive'
import { Effect, Layer, Schema } from 'effect'

// Define the workflow payload schema
const ExternalPushEntityPayload = Schema.Struct({
  entityName: Schema.String,
  mutations: Schema.Array(
    Schema.Struct({
      mutation: CRUDMutation,
      op: CRUDOp,
    }),
  ),
  tokenKey: Schema.String,
})

// Define the external sync entity workflow with adapter error types
export const ExternalPushEntityWorkflow = Workflow.make({
  error: Schema.Union(
    AdapterEntityNotFoundError,
    AdapterFetchError,
    AdapterTransformError,
    DetectionError,
    EntityProcessingError,
    ExternalLinkRetrievalError,
    ExternalLinkUpsertError,
    RelationshipProcessingError,
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

    const { entityName, mutations, tokenKey } = payload

    // Create the external sync activity
    yield* Activity.make({
      error: Schema.Union(
        AdapterEntityNotFoundError,
        AdapterFetchError,
        AdapterTransformError,
        DetectionError,
        EntityProcessingError,
        ExternalLinkRetrievalError,
        ExternalLinkUpsertError,
        RelationshipProcessingError,
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

        // Process each mutation using the new chain function - no error mapping needed!
        yield* Effect.forEach(mutations, (mutationData) => processMutation(mutationData.op), {
          concurrency: 'unbounded',
        })
      }).pipe(
        Effect.withSpan('external-sync-entity-activity'),
        Effect.provide(Layer.mergeAll(PcoAdapterManagerLayer, InternalManagerLive)),
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

    yield* Effect.log(`✅ Completed external sync entity workflow for: ${payload.entityName}`)
  }),
)
