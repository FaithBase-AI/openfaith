import type { StableHookOptions } from '@openfaith/ui/shared/hooks/options'
import { useEqMemoize } from '@openfaith/ui/shared/hooks/useEqMemoize'
import type { Equivalence } from 'effect'
import { useCallback } from 'react'

export const useStableCallback = <
  A extends ReadonlyArray<unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: Array<any>) => any,
>(
  callback: T,
  dependencies: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions,
): T =>
  // biome-ignore lint/correctness/useExhaustiveDependencies: Doesn't see that this is an array of deps.
  useCallback(callback, useEqMemoize(dependencies, eq, options))
