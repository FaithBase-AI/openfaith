import { HttpLayerRouter, HttpServerRequest } from '@effect/platform'
import { auth } from '@openfaith/auth/auth'
import { SessionContext, UnauthorizedError } from '@openfaith/server/auth/sessionContext'
import { Effect } from 'effect'

export const HttpAuthMiddlewareLive = HttpLayerRouter.middleware<{
  provides: SessionContext
}>()(
  Effect.gen(function* () {
    return (httpEffect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest
        const headers = request.headers

        // Get session from auth
        const session = yield* Effect.promise(() =>
          auth.api.getSession({ headers: headers as any }),
        )

        if (!session?.user) {
          throw new UnauthorizedError('Unauthorized')
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

        return yield* Effect.provideService(httpEffect, SessionContext, sessionContext)
      })
  }),
)
