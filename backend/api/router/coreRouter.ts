/** biome-ignore-all lint/suspicious/useAwait: test function */

import { FetchHttpClient } from '@effect/platform'
import { createTRPCRouter, protectedProcedure } from '@openfaith/api/trpc'
import { WorkflowClient } from '@openfaith/workers'
import { Effect } from 'effect'

export const coreRouter = createTRPCRouter({
  testFunction: protectedProcedure.mutation(async () => {
    try {
      console.log('🚀 Starting PCO sync workflow via test function')

      // Use WorkflowClient service similar to how PcoHttpClient is used
      const program = Effect.gen(function* () {
        const workflowClient = yield* WorkflowClient

        // Call the PcoSyncWorkflow endpoint - WorkflowProxy generates this method
        const result = yield* workflowClient.workflows.PcoSyncWorkflow({
          payload: {
            tokenKey: 'org_01jww7zkeyfzvsxd20nfjzc21z',
          },
        })

        return result
      }).pipe(
        Effect.provide(WorkflowClient.Default),
        Effect.provide(FetchHttpClient.layer),
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* Effect.logError(`Failed to trigger workflow: ${error}`)
            return { error: String(error) }
          }),
        ),
      )

      const result = await Effect.runPromise(program)

      console.log('📊 Workflow trigger result:', result)
      console.log('📋 Workflow trigger result JSON:', JSON.stringify(result))

      console.log('✅ Test function completed')

      return 'triggered'
    } catch (error) {
      console.log('❌ Test function error:', error)
      return 'error'
    }
  }),
})
