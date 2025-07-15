import { type Headers, HttpServerRequest } from '@effect/platform'
import { auth } from '@openfaith/auth/auth'
import {
  SessionError,
  SessionHttpMiddleware,
  SessionRpcMiddleware,
  UnauthorizedError,
} from '@openfaith/domain'
import { Effect, Layer } from 'effect'

export const SessionHttpMiddlewareLayer = Layer.effect(
  SessionHttpMiddleware,
  // biome-ignore lint/correctness/useYield: This is how the layer is defined
  Effect.gen(function* () {
    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const headers = request.headers

      return yield* setSession(headers)
    })
  }),
)

export const SessionRpcMiddlewareLayer: Layer.Layer<SessionRpcMiddleware> = Layer.succeed(
  SessionRpcMiddleware,
  SessionRpcMiddleware.of(() =>
    Effect.gen(function* () {
      const request = yield* Effect.serviceOptional(HttpServerRequest.HttpServerRequest).pipe(
        Effect.orDie,
      )

      return yield* setSession(request.headers)
    }),
  ),
)

const setSession = Effect.fn('setSession')(function* (headers: Headers.Headers) {
  const session = yield* Effect.tryPromise({
    catch: (error) => {
      return new SessionError({ message: `Failed to get session: ${error}` })
    },
    try: () =>
      auth.api.getSession({
        headers: headers as unknown as Parameters<typeof auth.api.getSession>[0]['headers'],
      }),
  })

  if (!session) {
    return yield* Effect.fail(new UnauthorizedError({ message: 'Unauthorized' }))
  }

  return session
})
