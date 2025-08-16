import { setActiveOrganization } from '@openfaith/auth/authClientE'
import { activeOrgIdAtom } from '@openfaith/openfaith/shared/auth/authState'
import { useRouter } from '@tanstack/react-router'
import { Boolean, Effect, Option, pipe } from 'effect'
import { useAtom } from 'jotai'

export function useChangeOrg() {
  const [, setActiveOrgId] = useAtom(activeOrgIdAtom)

  const router = useRouter()

  const preloadOrg = (_orgId: string) => {
    // TODO
  }

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
    yield* setActiveOrganization({
      organizationId: orgId,
    })

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
