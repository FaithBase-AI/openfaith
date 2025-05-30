import type { StableHookOptions } from '@openfaith/ui/shared/hooks/options'
import { useEqMemoize } from '@openfaith/ui/shared/hooks/useEqMemoize'
import type { Equivalence } from 'effect'
import type { EffectCallback } from 'react'
import { useLayoutEffect } from 'react'

export const useStableLayoutEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions,
): ReturnType<typeof useLayoutEffect> =>
  // biome-ignore lint/correctness/useExhaustiveDependencies: Doesn't see that this is an array of deps.
  useLayoutEffect(callback, useEqMemoize(dependencies, eq, options))
