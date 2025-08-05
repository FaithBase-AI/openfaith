import { cn } from '@openfaith/ui/shared/utils'
import { Array, pipe } from 'effect'
import type { FC, ReactNode } from 'react'

type DisplayBadgesProps = {
  Badges: ReadonlyArray<ReactNode>
  hiddenCount: number
  className?: string
  emptyText: string
  emptyTextClassName?: string
}

export const DisplayBadges: FC<DisplayBadgesProps> = (props) => {
  const { Badges, hiddenCount, className, emptyText, emptyTextClassName } = props

  if (Badges.length === 0) {
    return (
      <span className={cn('text-muted-foreground text-sm', emptyTextClassName)}>{emptyText}</span>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {pipe(
        Badges,
        Array.filter((badge): badge is ReactNode => badge !== null),
        Array.map((badge, index) => <span key={index}>{badge}</span>),
      )}
      {hiddenCount > 0 && (
        <span className='text-muted-foreground text-xs'>{`+${hiddenCount} more`}</span>
      )}
    </div>
  )
}
