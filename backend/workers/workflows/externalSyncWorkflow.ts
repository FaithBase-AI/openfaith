import { Workflow } from '@effect/workflow'
import { ExternalSyncEntityWorkflow } from '@openfaith/workers/workflows/externalSyncEntityWorkflow'
import { Array, Effect, Schema } from 'effect'

// Define the external sync error
class ExternalSyncError extends Schema.TaggedError<ExternalSyncError>('ExternalSyncError')(
  'ExternalSyncError',
  {
    message: Schema.String,
  },
) {}

// Define the workflow payload schema
const ExternalSyncPayload = Schema.Struct({
  mutations: Schema.Array(Schema.Unknown),
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
    const crudMutations = Array.filter(mutations, (mutation: any) => mutation.type === 'crud')

    // Group operations by entity name for efficient processing
    const entityGroups: Record<string, Array<{ mutation: any; op: any }>> = {}

    for (const mutation of crudMutations as any[]) {
      const [crudArg] = mutation.args
      for (const op of crudArg.ops) {
        const entityName = op.tableName
        if (!entityGroups[entityName]) {
          entityGroups[entityName] = []
        }
        entityGroups[entityName].push({ mutation, op })
      }
    }

    // Process each entity type with its mutations
    yield* Effect.forEach(
      Object.entries(entityGroups),
      ([entityName, entityMutations]) =>
        ExternalSyncEntityWorkflow.execute({
          entityName,
          mutations: entityMutations,
          tokenKey,
        }).pipe(
          Effect.mapError(
            (err) =>
              new ExternalSyncError({
                message: err instanceof Error ? err.message : String(err),
              }),
          ),
        ),
      { concurrency: 'unbounded' },
    )

    yield* Effect.log(`✅ Completed external sync workflow for token: ${payload.tokenKey}`)
  }),
)
