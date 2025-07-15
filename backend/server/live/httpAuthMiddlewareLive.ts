import { HttpServerRequest } from '@effect/platform'
import { auth } from '@openfaith/auth/auth'
import { SessionHttpMiddleware, SessionRpcMiddleware, UnauthorizedError } from '@openfaith/domain'
import { Effect, Layer } from 'effect'

export const SessionHttpMiddlewareLayer = Layer.effect(
  SessionHttpMiddleware,
  Effect.gen(function* () {
    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const headers = request.headers

      // Get session from auth
      const session = yield* Effect.promise(() => auth.api.getSession({ headers: headers as any }))

      if (!session?.user) {
        throw new UnauthorizedError({ message: 'Unauthorized' })
      }

      const sessionContext = {
        session: {
          activeOrganizationId: session.session.activeOrganizationId ?? null,
          id: session.session.id,
        },
        user: {
          email: session.user.email,
          id: session.user.id,
          name: session.user.name,
          role: session.user.role || 'user',
        },
      }

      return sessionContext
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

      const headers = request.headers

      // Get session from auth
      const session = yield* Effect.promise(() => auth.api.getSession({ headers: headers as any }))

      if (!session?.user) {
        throw new UnauthorizedError({ message: 'Unauthorized' })
      }

      const sessionContext = {
        session: {
          activeOrganizationId: session.session.activeOrganizationId ?? null,
          id: session.session.id,
        },
        user: {
          email: session.user.email,
          id: session.user.id,
          name: session.user.name,
          role: session.user.role || 'user',
        },
      }

      return sessionContext
    }),
  ),
)
