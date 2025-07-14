import { useIsPWA } from '@openfaith/ui/shared/hooks/useIsPWA'
import { Boolean, Option, pipe } from 'effect'
import { useCallback, useEffect, useState } from 'react'

const getCurrentHeight = () =>
  pipe(
    window.visualViewport,
    Option.fromNullable,
    Option.match({
      onNone: () => window.innerHeight,
      onSome: (x) => x.height,
    }),
  )

export function useKeyboardStatus() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  const isPWA = useIsPWA()

  const updateInitialHeight = useCallback(() => {
    const currentHeight = getCurrentHeight()

    if (currentHeight < window.innerHeight) {
      setIsKeyboardOpen(true)
    } else {
      setIsKeyboardOpen(false)
    }
  }, [])

  const checkKeyboardState = useCallback(() => {
    updateInitialHeight()

    setTimeout(() => {
      updateInitialHeight()
    }, 48)
  }, [updateInitialHeight])

  useEffect(() => {
    const handleResize = () => checkKeyboardState()
    const handleFocus = () => checkKeyboardState()
    const handleBlur = () => checkKeyboardState()

    window.addEventListener('resize', handleResize)
    document.querySelectorAll('input, textarea').forEach((element) => {
      element.addEventListener('focus', handleFocus)
      element.addEventListener('blur', handleBlur)
    })

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      document.querySelectorAll('input, textarea').forEach((element) => {
        element.removeEventListener('focus', handleFocus)
        element.removeEventListener('blur', handleBlur)
      })
    }
  }, [checkKeyboardState])

  return {
    checkKeyboardState,
    isKeyboardOpen: pipe(
      isPWA,
      Boolean.match({
        onFalse: () => false,
        onTrue: () => isKeyboardOpen,
      }),
    ),
  }
}
