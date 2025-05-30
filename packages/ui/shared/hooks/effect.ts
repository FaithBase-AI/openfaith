import type { StableHookOptions } from '@openfaith/ui/shared/hooks/options'
import { useEqMemoize } from '@openfaith/ui/shared/hooks/useEqMemoize'
import type { Equivalence } from 'effect'
import type { EffectCallback } from 'react'
import { useEffect } from 'react'

export const useStableEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions,
): ReturnType<typeof useEffect> =>
  // biome-ignore lint/correctness/useExhaustiveDependencies: Doesn't see that this is an array of deps.
  useEffect(callback, useEqMemoize(dependencies, eq, options))
