import { Option, pipe } from 'effect'

export function useIsPWA() {
  if (typeof window === 'undefined') {
    return false
  }
  return (
    pipe(
      (window.navigator as { standalone?: boolean }).standalone,
      Option.fromNullable,
      Option.getOrElse(() => false),
    ) ||
    window.matchMedia('(display-mode: standalone)').matches ||
    false
  )
}
