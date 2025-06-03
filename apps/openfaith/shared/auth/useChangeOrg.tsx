import { authClient } from '@openfaith/auth/authClient'
import { activeOrgIdAtom } from '@openfaith/openfaith/shared/auth/authState'
import { noOp } from '@openfaith/shared'
import { useRouter } from '@tanstack/react-router'
import { Boolean, Option, pipe } from 'effect'
import { useAtom } from 'jotai'

export function useChangeOrg() {
  const [, setActiveOrgId] = useAtom(activeOrgIdAtom)

  const router = useRouter()

  const preloadOrg = (_orgId: string) => {
    // TODO
  }

  const changeOrg = (params: { orgId: string; skipRefresh?: boolean; refetch?: () => void }) => {
    const { orgId, skipRefresh = false, refetch } = params

    setActiveOrgId(orgId)

    preloadOrg(orgId)

    authClient.organization
      .setActive({
        organizationId: orgId,
      })
      .then(() => {
        pipe(
          refetch,
          Option.fromNullable,
          Option.match({
            onNone: noOp,
            onSome: (x) => x(),
          }),
        )

        pipe(
          skipRefresh,
          Boolean.match({
            onFalse: () => {
              router.invalidate()
            },
            onTrue: noOp,
          }),
        )
      })
  }

  return {
    changeOrg,
    preloadOrg,
  }
}
