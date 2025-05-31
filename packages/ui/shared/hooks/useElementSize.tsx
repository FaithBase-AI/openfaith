import { type RefObject, useEffect, useState } from 'react'

export function useElementSize<T extends HTMLElement | null>(ref?: RefObject<T>) {
  const [size, setSize] = useState<{
    width: number | undefined
    height: number | undefined
  }>({ width: undefined, height: undefined })

  useEffect(() => {
    if (ref && ref.current) {
      const updateSize = () => {
        if (ref.current) {
          const { offsetWidth, offsetHeight } = ref.current
          setSize({
            width: offsetWidth,
            height: offsetHeight,
          })
        }
      }

      // Initialize size
      updateSize()

      // Create a ResizeObserver to track size changes
      const resizeObserver = new ResizeObserver(() => {
        updateSize()
      })

      // Start observing the element
      resizeObserver.observe(ref.current)

      // Clean up by disconnecting observer when component unmounts
      return () => {
        resizeObserver.disconnect()
      }
    }

    return
  }, [ref])

  return size
}
