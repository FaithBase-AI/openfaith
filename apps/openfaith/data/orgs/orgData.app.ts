import { authClient } from '@openfaith/auth/authClient'
import { OrgRole } from '@openfaith/openfaith/data/orgs/orgsShared'
import { useOrgId } from '@openfaith/openfaith/data/users/useOrgId'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { useStableMemo } from '@openfaith/ui'
import { getBaseOrgQuery, useZero } from '@openfaith/zero'
import type { OrgUserClientShape } from '@openfaith/zero/clientShapes'
import { useQuery } from '@rocicorp/zero/react'
import { Array, Equivalence, Option, pipe, String } from 'effect'

export function useAuthOrgOpt() {
  const { data, isPending } = authClient.useActiveOrganization()

  return {
    loading: isPending,
    orgOpt: pipe(data, Option.fromNullable),
  }
}

export function useOrgOpt() {
  const orgId = useOrgId()

  const z = useZero()

  const [org, info] = useQuery(getBaseOrgQuery(z, orgId), orgId !== 'noOrganization')

  return {
    loading: info.type !== 'complete',
    orgOpt: pipe(org, Option.fromNullable),
  }
}

export function useOrgUsers() {
  const { orgOpt, loading } = useOrgOpt()

  const orgUsersCollection = useStableMemo(
    () =>
      pipe(
        orgOpt,
        Option.match({
          onNone: (): Array<OrgUserClientShape> => [],
          onSome: (x) => x.orgUsers || [],
        }),
      ),
    [orgOpt],
    Equivalence.tuple(
      Option.getEquivalence(
        Equivalence.struct({
          orgUsers: Array.getEquivalence(
            Equivalence.struct({
              id: String.Equivalence,
            }),
          ),
        }),
      ),
    ),
  )

  return {
    loading,
    orgUsersCollection,
  }
}

export function useUserOrgRole() {
  const { orgOpt } = useOrgOpt()
  const userId = useUserId()

  return pipe(
    orgOpt,
    Option.flatMap((x) =>
      pipe(
        x.orgUsers || [],
        Array.findFirst((y) => y.userId === userId),
      ),
    ),
    Option.match({
      onNone: () => OrgRole.Member,
      onSome: (x) => x.role as OrgRole,
    }),
  )
}
