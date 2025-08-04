import { authClient } from '@openfaith/auth/authClient'
import { OrgRole } from '@openfaith/openfaith/data/orgs/orgsShared'
import { useOrgId } from '@openfaith/openfaith/data/users/useOrgId'
import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import {
  getBaseOrgQuery,
  getBaseOrgUsersQuery,
  type OrgUserClientShape,
  useZero,
} from '@openfaith/zero'
import { useQuery } from '@rocicorp/zero/react'
import { Array, Option, pipe } from 'effect'

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
  const orgId = useOrgId()

  const z = useZero()

  const [orgUsersCollection, info] = useQuery(
    getBaseOrgUsersQuery(z).where('orgId', orgId),
    orgId !== 'noOrganization',
  )

  return {
    loading: info.type !== 'complete',
    orgUsersCollection: pipe(
      orgUsersCollection,
      Option.fromNullable,
      Option.getOrElse(() => []),
    ) as Array<OrgUserClientShape>,
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
