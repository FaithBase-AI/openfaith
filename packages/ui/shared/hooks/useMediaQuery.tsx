import {
  isLgScreenAtom,
  isMdScreenAtom,
  isSmScreenAtom,
  isXlScreenAtom,
} from '@openfaith/ui/shared/globalState'
import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'

interface UseMediaQueryOptions {
  getInitialValueInEffect: boolean
}

type MediaQueryCallback = (event: { matches: boolean; media: string }) => void

/**
 * Older versions of Safari (shipped withCatalina and before) do not support
 * addEventListener on matchMedia
 * https://stackoverflow.com/questions/56466261/matchmedia-addlistener-marked-as-deprecated-addeventlistener-equivalent
 * */
function attachMediaListener(query: MediaQueryList, callback: MediaQueryCallback) {
  try {
    query.addEventListener('change', callback)
    return () => query.removeEventListener('change', callback)
  } catch (error) {
    console.warn('Failed to attach media listener', error)

    query.addListener(callback)
    return () => query.removeListener(callback)
  }
}

function getInitialValue(query: string, initialValue?: boolean) {
  if (typeof initialValue === 'boolean') {
    return initialValue
  }

  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    return window.matchMedia(query).matches
  }

  return false
}

export function useMediaQuery(
  query: string,
  initialValue?: boolean,
  { getInitialValueInEffect }: UseMediaQueryOptions = {
    getInitialValueInEffect: true,
  },
) {
  const [matches, setMatches] = useState(
    getInitialValueInEffect ? false : getInitialValue(query, initialValue),
  )
  const queryRef = useRef<MediaQueryList>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      queryRef.current = window.matchMedia(query)
      setMatches(queryRef.current.matches)
      return attachMediaListener(queryRef.current, (event) => setMatches(event.matches))
    }

    return undefined
  }, [query])

  return matches
}

export function getMediaQuery(query: string) {
  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    return window.matchMedia(query).matches
  }

  return false
}

export function useIsMdScreen() {
  const [isMdScreen] = useAtom(isMdScreenAtom)

  return isMdScreen
}

export function useIsSmScreen() {
  const [isSmScreen] = useAtom(isSmScreenAtom)

  return isSmScreen
}

export function useIsLgScreen() {
  const [isLgScreen] = useAtom(isLgScreenAtom)

  return isLgScreen
}

export function useIsXlScreen() {
  const [isXlScreen] = useAtom(isXlScreenAtom)

  return isXlScreen
}
