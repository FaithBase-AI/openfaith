import { nullOp } from '@openfaith/shared'
import { Badge, entityBadgeClassName } from '@openfaith/ui/components/ui/badge'
import { Skeleton } from '@openfaith/ui/components/ui/skeleton'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, pipe } from 'effect'
import type { FC } from 'react'

function getRandomWidth() {
  const values = ['w-full', 'w-[90%]', 'w-[80%]', 'w-[70%]']
  const randomIndex = Math.floor(Math.random() * values.length)
  return values[randomIndex]
}

type BadgeSkeletonProps = {
  showAvatar?: boolean
  className?: string
  highlight?: boolean
}

export const BadgeSkeleton: FC<BadgeSkeletonProps> = (props) => {
  const { showAvatar = false, className, highlight = false } = props

  return (
    <Badge
      className={cn(entityBadgeClassName, getRandomWidth(), className)}
      highlight={highlight}
      variant='secondary'
    >
      {pipe(
        showAvatar,
        Boolean.match({
          onFalse: nullOp,
          onTrue: () => (
            <Skeleton className='-ml-1.5 mr-1.5 size-6 shrink-0 rounded-full bg-slate-200' />
          ),
        }),
      )}
      <Skeleton className={cn('h-3 w-full bg-slate-200')} />
    </Badge>
  )
}
