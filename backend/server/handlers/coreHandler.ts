import { CoreRpc, TestFunctionError } from '@openfaith/domain'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Effect } from 'effect'

export const CoreHandlerLive = CoreRpc.toLayer(
  Effect.gen(function* () {
    return {
      testFunction: () =>
        Effect.gen(function* () {
          console.log('🚀 Test function called')

          // Simulate some work
          const workflowClient = yield* WorkflowClient

          const result = yield* workflowClient.workflows.ExternalSyncWorkflow({
            payload: {
              tokenKey: 'org_01jww7zkeyfzvsxd20nfjzc21z',
            },
          })

          console.log(result)

          console.log('✅ Test function completed')

          return {
            message: 'Test function completed',
          }
          // Return void (no explicit return needed)
        }).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new TestFunctionError({
                cause: String(error),
                message: 'Test function execution failed',
              }),
            ),
          ),
        ),
    }
  }),
)
