import type { Headers } from '@effect/platform'
import { RpcMiddleware } from '@effect/rpc'
import { auth } from '@openfaith/auth/auth'
import { Context, Effect, Layer, Option, pipe } from 'effect'

// Session context tag - provides authenticated user and session data
export class SessionContext extends Context.Tag('@openfaith/server/SessionContext')<
  SessionContext,
  {
    user: {
      id: string
      email: string
      name: string | null
      role: string
    }
    session: {
      id: string
      activeOrganizationId: string | null
    }
  }
>() {}

// Auth errors
export class UnauthorizedError extends Error {
  readonly _tag = 'UnauthorizedError'
  constructor(message = 'Unauthorized') {
    super(message)
  }
}

export class ForbiddenError extends Error {
  readonly _tag = 'ForbiddenError'
  constructor(message = 'Forbidden') {
    super(message)
  }
}

// RPC Authentication middleware
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()('AuthMiddleware', {
  provides: SessionContext,
  requiredForClient: false,
}) {}

// Helper to extract session from headers
const getSessionFromHeaders = (headers: Headers.Headers) =>
  Effect.gen(function* () {
    const session = yield* Effect.promise(() => auth.api.getSession({ headers: headers as any }))

    return pipe(
      session,
      Option.fromNullable,
      Option.flatMapNullable((x) => x.user),
      Option.match({
        onNone: () => {
          throw new UnauthorizedError()
        },
        onSome: (user) => ({
          session: {
            activeOrganizationId: session!.session.activeOrganizationId ?? null,
            id: session!.session.id,
          },
          user: {
            email: user.email,
            id: user.id,
            name: user.name,
            role: user.role || 'user',
          },
        }),
      }),
    )
  })

// Auth middleware implementation
export const AuthMiddlewareLive = Layer.succeed(
  AuthMiddleware,
  AuthMiddleware.of(({ headers }) => getSessionFromHeaders(headers)),
)
