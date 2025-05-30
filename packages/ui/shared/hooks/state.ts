import { Either, Equivalence, Option } from 'effect'
import type { Dispatch, SetStateAction } from 'react'
import { useReducer } from 'react'

const isSetStateFn = <A>(s: SetStateAction<A>): s is (a: A) => A =>
  typeof s === 'function'

export const useStable = <A>(
  initState: A,
  eq: Equivalence.Equivalence<A>,
): [A, Dispatch<SetStateAction<A>>] =>
  useReducer((s1: A, s2: SetStateAction<A>) => {
    const _s2 = isSetStateFn(s2) ? s2(s1) : s2
    return eq(s1, _s2) ? s1 : _s2
  }, initState)

export const useStableO = <A>(
  initState: Option.Option<A>,
): [Option.Option<A>, Dispatch<SetStateAction<Option.Option<A>>>] =>
  useStable(initState, Option.getEquivalence(Equivalence.strict()))

export const useStableE = <E, A>(
  initState: Either.Either<E, A>,
): [Either.Either<E, A>, Dispatch<SetStateAction<Either.Either<E, A>>>] =>
  useStable(
    initState,
    Either.getEquivalence({
      left: Equivalence.strict(),
      right: Equivalence.strict(),
    }),
  )
