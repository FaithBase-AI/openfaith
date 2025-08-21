import { setActiveOrganization } from '@openfaith/auth/authClientE'
import { activeOrgIdAtom } from '@openfaith/openfaith/shared/auth/authState'
import { useRouter } from '@tanstack/react-router'
import { Boolean, Effect, Option, pipe, Schema } from 'effect'
import { useAtom } from 'jotai'

class RefreshSessionError extends Schema.TaggedError<RefreshSessionError>()('RefreshSessionError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
}) {}

export function useChangeOrg() {
  const [, setActiveOrgId] = useAtom(activeOrgIdAtom)

  const router = useRouter()

  const preloadOrg = (_orgId: string) => {
    // TODO
  }

  const refreshSession = Effect.fn('refreshSession')(function* () {
    yield* Effect.tryPromise({
      catch: (cause) =>
        new RefreshSessionError({
          cause,
          message: 'Failed to refresh session',
        }),
      try: () => fetch('/api/auth/refresh', { credentials: 'include' }),
    })
  })

  const changeOrg = Effect.fn('changeOrg')(function* (params: {
    orgId: string
    skipRefresh?: boolean
    refetch?: () => void
  }) {
    const { orgId, skipRefresh = false, refetch } = params

    // Set the active org ID in state
    yield* Effect.sync(() => setActiveOrgId(orgId))

    // Preload org data
    yield* Effect.sync(() => preloadOrg(orgId))

    // Set the active organization in the auth system
    // This updates the session on the backend
    yield* setActiveOrganization({
      organizationId: orgId,
    })

    // Refresh the session to get updated cookies with the new activeOrganizationId
    yield* refreshSession()

    // Small delay to ensure cookies are propagated
    yield* Effect.sleep('100 millis')

    // Execute optional refetch callback
    yield* pipe(
      refetch,
      Option.fromNullable,
      Option.match({
        onNone: () => Effect.void,
        onSome: (fn) => Effect.sync(() => fn()),
      }),
    )

    // Invalidate router if not skipping refresh
    yield* pipe(
      skipRefresh,
      Boolean.match({
        onFalse: () => Effect.sync(() => router.invalidate()),
        onTrue: () => Effect.void,
      }),
    )
  })

  return {
    changeOrg,
    preloadOrg,
  }
}
