import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { nullOp } from '@openfaith/shared'
import { useStableMemo } from '@openfaith/ui'
import { getBaseUserQuery, useZero } from '@openfaith/zero'
import type { UserClientShape } from '@openfaith/zero/clientShapes'
import { useQuery } from '@rocicorp/zero/react'
import { Equivalence, Option, pipe, Schema, String } from 'effect'
import type { FC, ReactNode } from 'react'

export function useUserOpt(userId: string) {
  const z = useZero()

  const [user, info] = useQuery(getBaseUserQuery(z, userId), pipe(userId, String.isNonEmpty))

  return {
    loading: info.type !== 'complete',
    userOpt: pipe(user, Option.fromNullable),
  }
}

export function useCurrentUserOpt() {
  const userId = useUserId()

  const { userOpt, loading } = useUserOpt(userId)

  return {
    currentUserOpt: userOpt,
    loading,
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

type CurrentUserWrapperProps = {
  children: (user: UserClientShape) => ReactNode
}

export const CurrentUserWrapper: FC<CurrentUserWrapperProps> = (props) => {
  const { children } = props
  const { currentUserOpt } = useCurrentUserOpt()

  return pipe(
    currentUserOpt,
    Option.match({
      onNone: nullOp,
      onSome: (user) => children(user),
    }),
  )
}
