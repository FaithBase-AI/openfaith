/** biome-ignore-all lint/suspicious/useAwait: test function */

import { createTRPCRouter, protectedProcedure } from '@openfaith/api/trpc'
import { peopleTable } from '@openfaith/db'
import { getTableColumns } from 'drizzle-orm'
// import { pipe, Record } from 'effect'

export const coreRouter = createTRPCRouter({
  testFunction: protectedProcedure.mutation(async () => {
    try {
      console.log('🚀 Starting PCO sync workflow via test function')

      console.log(Object.keys(getTableColumns(peopleTable)))

      // Use WorkflowClient service similar to how PcoHttpClient is used
      // const program = Effect.gen(function* () {
      //   const workflowClient = yield* HttpApiClient.make(WorkflowApi, {
      //     baseUrl: 'http://localhost:3020',
      //   })

      //   console.log('do the thing', workflowClient)

      //   // Call the PcoSyncWorkflow endpoint - WorkflowProxy generates this method
      //   const result = yield* workflowClient.workflows.TestWorkflow({
      //     payload: {
      //       message: 'Hello, world!',
      //     },
      //   })

      //   console.log(result)

      //   return result
      // }).pipe(
      //   Effect.provide(FetchHttpClient.layer),
      //   Effect.catchAll((error) =>
      //     Effect.gen(function* () {
      //       yield* Effect.logError(`Failed to trigger workflow: ${error}`)
      //       return { error: String(error) }
      //     }),
      //   ),
      // )

      // const result = await Effect.runPromise(program)

      // console.log('📊 Workflow trigger result:', result)
      // console.log('📋 Workflow trigger result JSON:', JSON.stringify(result))

      // console.log('✅ Test function completed')

      return 'triggered'
    } catch (error) {
      console.log('❌ Test function error:', error)
      return 'error'
    }
  }),
})
