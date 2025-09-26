import { useTheme } from 'next-themes'
import { useCallback, useMemo } from 'react'

const META_THEME_COLORS = {
  dark: '#09090b',
  light: '#ffffff',
}

export function useMetaColor() {
  const { resolvedTheme } = useTheme()

  const metaColor = useMemo(() => {
    return resolvedTheme !== 'dark' ? META_THEME_COLORS.light : META_THEME_COLORS.dark
  }, [resolvedTheme])

  const setMetaColor = useCallback((color: string) => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [])

  return {
    metaColor,
    setMetaColor,
  }
}
