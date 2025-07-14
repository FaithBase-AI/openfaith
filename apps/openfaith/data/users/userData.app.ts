import { authClient } from '@openfaith/auth/authClient'
import { useStableMemo } from '@openfaith/ui'
import { getBaseUserQuery, useZero } from '@openfaith/zero'
import { useQuery } from '@rocicorp/zero/react'
import { Equivalence, Option, pipe, Schema, String } from 'effect'

export function useCurrentUserOpt() {
  const { data: session, isPending } = authClient.useSession()

  return {
    currentUserOpt: pipe(
      session,
      Option.fromNullable,
      Option.map((x) => x.user),
    ),
    loading: isPending,
  }
}

export function useUserOpt(userId: string) {
  const z = useZero()

  const [user, info] = useQuery(getBaseUserQuery(z, userId), pipe(userId, String.isNonEmpty))

  return {
    loading: info.type !== 'complete',
    userOpt: pipe(user, Option.fromNullable),
  }
}

const orgUseRoleEq = Schema.equivalence(
  Schema.Struct({
    role: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
  }),
)

export function useIsAdmin() {
  const { currentUserOpt } = useCurrentUserOpt()

  return useStableMemo(
    () =>
      pipe(
        currentUserOpt,
        Option.match({
          onNone: () => false,
          onSome: (x) => x.role === 'admin',
        }),
      ),
    [currentUserOpt],
    Equivalence.tuple(Option.getEquivalence(orgUseRoleEq)),
  )
}
