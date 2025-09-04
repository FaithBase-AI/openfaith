import { CoreRpc, TestFunctionError } from '@openfaith/domain'
import { Effect } from 'effect'

export const CoreHandlerLive = CoreRpc.toLayer(
  Effect.gen(function* () {
    return {
      testFunction: () =>
        Effect.gen(function* () {
          yield* Effect.log('🚀 Test function called')

          yield* Effect.log('✅ Test function completed')

          return {
            message: 'Test function completed',
          }
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
