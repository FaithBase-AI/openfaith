import { useCurrentUserOpt } from '@openfaith/openfaith/data/users/userData.app'
import { useStableMemo } from '@openfaith/ui'
import { Equivalence, Option, pipe, String } from 'effect'

export function useUserId() {
  const { currentUserOpt } = useCurrentUserOpt()

  return useStableMemo(
    () =>
      pipe(
        currentUserOpt,
        Option.map((x) => x.id),
        Option.getOrElse(() => ''),
      ),
    [currentUserOpt],
    Equivalence.tuple(
      Option.getEquivalence(
        Equivalence.struct({
          id: String.Equivalence,
        }),
      ),
    ),
  )
}
