import { useUserId } from '@openfaith/openfaith/data/users/useUserId'
import { getBaseOrgsQuery, useZero } from '@openfaith/zero'
import { useQuery } from '@rocicorp/zero/react'
import { Array, Option, pipe } from 'effect'

export function useOrgsCollection() {
  const z = useZero()

  const userId = useUserId()

  const [orgsCollection, info] = useQuery(getBaseOrgsQuery(z), { ttl: '1d' })

  return {
    adminOrgsCollection: pipe(
      orgsCollection,
      Array.filter((x) =>
        pipe(
          x.orgUsers,
          Array.findFirst((y) => y.userId === userId),
          Option.isNone,
        ),
      ),
    ),
    loading: info.type !== 'complete',
    orgsCollection: pipe(
      orgsCollection,
      Array.filter((x) =>
        pipe(
          x.orgUsers,
          Array.findFirst((y) => y.userId === userId),
          Option.isSome,
        ),
      ),
    ),
  }
}
