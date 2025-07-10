import { CoreRpc, TestFunctionError } from '@openfaith/domain'
import { Effect } from 'effect'

export const CoreHandlerLive = CoreRpc.toLayer(
  Effect.gen(function* () {
    return {
      testFunction: () =>
        Effect.gen(function* () {
          console.log('🚀 Test function called')

          // Simulate some work
          yield* Effect.sleep('100 millis')

          console.log('✅ Test function completed')

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
