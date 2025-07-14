import { ForbiddenError } from '@openfaith/domain'
import { AuthMiddlewareLive, SessionContext } from '@openfaith/server/auth/sessionContext'
import { Effect } from 'effect'

// Public procedure - no auth required
export const publicProcedure = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect

// Protected procedure - requires authentication
export const protectedProcedure = <A, E, R>(effect: Effect.Effect<A, E, R | SessionContext>) =>
  effect

// Organization procedure - requires active organization
export const orgProcedure = <A, E, R>(effect: Effect.Effect<A, E, R | SessionContext>) =>
  Effect.gen(function* () {
    const session = yield* SessionContext

    if (!session.session.activeOrganizationId) {
      return yield* Effect.fail(new ForbiddenError({ message: 'Active organization required' }))
    }

    return yield* effect
  })

// Admin procedure - requires admin role
export const adminProcedure = <A, E, R>(effect: Effect.Effect<A, E, R | SessionContext>) =>
  Effect.gen(function* () {
    const session = yield* SessionContext

    if (session.user.role !== 'admin') {
      return yield* Effect.fail(new ForbiddenError({ message: 'Admin role required' }))
    }

    return yield* effect
  })

// Auth middleware layer
export const AuthMiddlewareLayer = AuthMiddlewareLive
