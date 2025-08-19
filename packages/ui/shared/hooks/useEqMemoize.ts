import type { StableHookOptions } from '@openfaith/ui/shared/hooks/options'
import type { Equivalence } from 'effect'
import { useRef, useState } from 'react'

// Use effect prior art comes from
// https://github.com/kentcdodds/use-deep-compare-effect/blob/master/src/index.ts
export const useEqMemoize = <A extends ReadonlyArray<unknown>>(
  value: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions,
) => {
  const ref = useRef<A>(null)
  const [signal, setSignal] = useState(0)

  if (ref.current == null) {
    ref.current = value
  }

  // eslint-disable-next-line react-compiler/react-compiler
  if (!eq(value, ref.current)) {
    // https://stackoverflow.com/questions/35469836/detecting-production-vs-development-react-at-runtime
    // eslint-disable-next-line no-restricted-properties
    if (options?.debug && process.env.NODE_ENV !== 'production') {
      console.info('Stable hook update triggered:', {
        // eslint-disable-next-line react-compiler/react-compiler
        prev: ref.current,
        value,
      })
    }
    // eslint-disable-next-line react-compiler/react-compiler
    ref.current = value
    setSignal((x) => x + 1)
  }

  return [signal]
}
