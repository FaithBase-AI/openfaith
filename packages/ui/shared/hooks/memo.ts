import type { StableHookOptions } from '@openfaith/ui/shared/hooks/options'
import { useEqMemoize } from '@openfaith/ui/shared/hooks/useEqMemoize'
import type { Equivalence } from 'effect'
import { useMemo } from 'react'

export const useStableMemo = <A extends ReadonlyArray<unknown>, T>(
  factory: () => T,
  dependencies: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions,
  // biome-ignore lint/correctness/useExhaustiveDependencies: Doesn't see that this is an array of deps.
): T => useMemo(factory, useEqMemoize(dependencies, eq, options))
