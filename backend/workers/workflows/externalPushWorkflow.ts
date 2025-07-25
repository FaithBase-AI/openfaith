import { Workflow } from '@effect/workflow'
import { type CRUDMutation, type CustomMutation, Mutation } from '@openfaith/domain'
import { convertCustomMutations } from '@openfaith/workers/helpers/convertCustomMutation'
import { ExternalPushEntityWorkflow } from '@openfaith/workers/workflows/externalPushEntityWorkflow'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

// Define the external sync error
class ExternalPushError extends Schema.TaggedError<ExternalPushError>()('ExternalPushError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const ExternalPushPayload = Schema.Struct({
  mutations: Schema.Array(Mutation),
  tokenKey: Schema.String, // PushRequest['mutations'] but simplified for workflow
})

// Define the external sync workflow
export const ExternalPushWorkflow = Workflow.make({
  error: ExternalPushError,
  idempotencyKey: ({ tokenKey }) => `external-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'ExternalPushWorkflow',
  payload: ExternalPushPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalPushWorkflowLayer = ExternalPushWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting external sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { tokenKey, mutations } = payload

    yield* Effect.log('Processing mutations for external sync', {
      mutationCount: mutations.length,
      mutationNames: mutations.map((m) => m.name),
      mutationTypes: mutations.map((m) => m.type),
      tokenKey,
    })

    // Process both CRUD and custom mutations
    const crudMutations = pipe(
      mutations,
      Array.filter((mutation): mutation is CRUDMutation => mutation.type === 'crud'),
    )

    const customMutations = pipe(
      mutations,
      Array.filter((mutation): mutation is CustomMutation => mutation.type === 'custom'),
    )

    // Convert CRUD mutations to entity workflows
    const crudEntityWorkflows = pipe(
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
    )

    // Convert custom mutations to entity workflows using the helper
    yield* Effect.log('Processing custom mutations', {
      customMutationCount: customMutations.length,
      customMutationNames: customMutations.map((m) => m.name),
    })

    const customEntityWorkflows = yield* convertCustomMutations(customMutations)

    yield* Effect.log('Converted custom mutations to entity workflows', {
      customEntityWorkflowCount: customEntityWorkflows.length,
    })

    // Combine all entity workflows
    const allEntityWorkflows = [...crudEntityWorkflows, ...customEntityWorkflows]

    // Group operations by entity name for efficient processing
    const entityWorkflows = pipe(
      allEntityWorkflows,
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
        ExternalPushEntityWorkflow.execute({
          entityName: entityWorkflow.entityName,
          mutations: entityWorkflow.mutations,
          tokenKey,
        }).pipe(
          Effect.mapError(
            (error) =>
              new ExternalPushError({
                message: error.message,
              }),
          ),
        ),
      { concurrency: 'unbounded' },
    )

    yield* Effect.log(`✅ Completed external sync workflow for token: ${payload.tokenKey}`)
  }),
)
