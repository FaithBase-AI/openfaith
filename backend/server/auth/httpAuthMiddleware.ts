import { auth } from '@openfaith/auth/auth'
import { SessionContext, UnauthorizedError } from '@openfaith/server/auth/sessionContext'
import { Effect, Layer } from 'effect'

// Simple function to get session from request
export const getSessionFromRequest = (request: any) =>
  Effect.gen(function* () {
    const session = yield* Effect.promise(() =>
      auth.api.getSession({ headers: request.headers as any }),
    )

    if (!session?.user) {
      throw new UnauthorizedError()
    }

    return {
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
  })

// Layer that provides session context from request
export const HttpAuthLayer = Layer.effect(
  SessionContext,
  Effect.gen(function* () {
    // This will be provided by the handler when processing requests
    return yield* SessionContext
  }),
)
