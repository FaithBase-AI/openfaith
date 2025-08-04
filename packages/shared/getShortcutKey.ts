import { Boolean, pipe } from 'effect'

let isMac: boolean | undefined

interface Navigator {
  userAgentData?: {
    brands: ReadonlyArray<{ brand: string; version: string }>
    mobile: boolean
    platform: string
    getHighEntropyValues: (hints: ReadonlyArray<string>) => Promise<{
      platform: string
      platformVersion: string
      uaFullVersion: string
    }>
  }
}

function getPlatform(): string {
  if (typeof navigator === 'undefined') {
    return 'mac'
  }

  const nav = navigator as Navigator

  if (nav.userAgentData) {
    if (nav.userAgentData.platform) {
      return nav.userAgentData.platform
    }

    void nav.userAgentData.getHighEntropyValues(['platform']).then((highEntropyValues) => {
      if (highEntropyValues.platform) {
        return highEntropyValues.platform
      }
      return null
    })
  }

  if (typeof navigator.platform === 'string') {
    return navigator.platform
  }

  return ''
}

export function getIsMacOS() {
  if (isMac === undefined) {
    isMac = getPlatform().toLowerCase().includes('mac')
  }
  return isMac
}

interface ShortcutKeyResult {
  symbol: string
  readable: string
  root: 'mod' | 'alt' | 'shift' | 'enter' | 'other'
}

export function getShortcutKey(key: string): ShortcutKeyResult {
  const isMacOS = getIsMacOS()

  switch (key.toLowerCase()) {
    case 'mod':
      return pipe(
        isMacOS,
        Boolean.match({
          onFalse: () => ({
            readable: 'Control',
            root: 'mod' as const,
            symbol: 'Ctrl',
          }),
          onTrue: () => ({
            readable: 'Command',
            root: 'mod' as const,
            symbol: '⌘',
          }),
        }),
      )
    case 'alt':
      return pipe(
        isMacOS,
        Boolean.match({
          onFalse: () => ({
            readable: 'Alt',
            root: 'alt' as const,
            symbol: 'Alt',
          }),
          onTrue: () => ({
            readable: 'Option',
            root: 'alt' as const,
            symbol: '⌥',
          }),
        }),
      )
    case 'shift':
      return pipe(
        isMacOS,
        Boolean.match({
          onFalse: () => ({
            readable: 'Shift',
            root: 'shift' as const,
            symbol: 'Shift',
          }),
          onTrue: () => ({
            readable: 'Shift',
            root: 'shift' as const,
            symbol: '⇧',
          }),
        }),
      )
    case 'enter':
      return {
        readable: 'Enter',
        root: 'enter' as const,
        symbol: '↵',
      }
    default:
      return { readable: key, root: 'other' as const, symbol: key }
  }
}
