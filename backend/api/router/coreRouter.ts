import { FetchHttpClient, HttpApiClient } from '@effect/platform'
import { createTRPCRouter, protectedProcedure } from '@openfaith/api/trpc'
import { WorkflowApi } from '@openfaith/workers/api/workflowApi'
import { Effect } from 'effect'

export const coreRouter = createTRPCRouter({
  testFunction: protectedProcedure.mutation(async () => {
    try {
      console.log('🚀 Starting PCO sync workflow via test function')

      // Use WorkflowClient service similar to how PcoHttpClient is used
      const program = Effect.gen(function* () {
        const workflowClient = yield* HttpApiClient.make(WorkflowApi, {
          baseUrl: 'http://localhost:3020',
        })

        console.log('do the thing', workflowClient)

        // Call the PcoSyncWorkflow endpoint - WorkflowProxy generates this method
        const result = yield* workflowClient.workflows.PcoSyncWorkflow({
          payload: {
            entity: 'people',
            tokenKey: 'org_01jww7zkeyfzvsxd20nfjzc21z',
          },
        })

        console.log(result)

        return result
      }).pipe(
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
