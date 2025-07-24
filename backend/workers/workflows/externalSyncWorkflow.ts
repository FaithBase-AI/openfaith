import { Workflow } from '@effect/workflow'
import { type CRUDMutation, Mutation } from '@openfaith/domain'
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
  mutations: Schema.Array(Mutation),
  tokenKey: Schema.String, // PushRequest['mutations'] but simplified for workflow
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

    const { tokenKey, mutations } = payload

    yield* Effect.log('Processing mutations for external sync', {
      mutationCount: mutations.length,
      tokenKey,
    })

    // Process each mutation individually - simpler approach
    const crudMutations = pipe(
      mutations,
      Array.filter((mutation): mutation is CRUDMutation => mutation.type === 'crud'),
    )

    // Group operations by entity name for efficient processing
    const entityWorkflows = pipe(
      crudMutations,
      Array.flatMap((mutation) =>
        pipe(
          Array.head(mutation.args),
          Option.map((arg) => arg.ops),
          Option.getOrElse(() => []),
          Array.map((op) => ({
            entityName: op.tableName,
            mutation,
            op,
          })),
        ),
      ),
      Array.groupBy((item) => item.entityName),
      Record.collect((entityName, mutations) => ({
        entityName,
        mutations,
      })),
    )

    // Process each entity type with its mutations
    yield* Effect.forEach(
      entityWorkflows,
      (entityWorkflow) =>
        ExternalSyncEntityWorkflow.execute({
          entityName: entityWorkflow.entityName,
          mutations: entityWorkflow.mutations,
          tokenKey,
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalSyncError({
                message: error.message,
              }),
          ),
        ),
      { concurrency: 'unbounded' },
    )

    yield* Effect.log(`✅ Completed external sync workflow for token: ${payload.tokenKey}`)
  }),
)
