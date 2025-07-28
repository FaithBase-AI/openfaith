import { useEffect, useRef } from 'react'

export function useUnmount(func: () => void) {
  const funcRef = useRef(func)

  // eslint-disable-next-line react-compiler/react-compiler
  funcRef.current = func

  useEffect(
    () => () => {
      funcRef.current()
    },
    [],
  )
}
