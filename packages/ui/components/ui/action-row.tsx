'use client'

import { useKeyboardStatus } from '@openfaith/ui/shared/hooks/useKeyboardStatus'
import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, pipe } from 'effect'
import type { ComponentProps } from 'react'

export const ActionRow = ({ className, ...props }: ComponentProps<'div'>) => {
  const { isKeyboardOpen } = useKeyboardStatus()

  return (
    <div
      className={cn(
        'flex w-auto items-center gap-1 rounded-b-[inherit] border-t bg-l2 p-2 align-middle',
        pipe(
          isKeyboardOpen,
          Boolean.match({
            onFalse: () => 'pb-[max(.5rem,env(safe-area-inset-bottom))]!',
            onTrue: () => '',
          }),
        ),
        className,
      )}
      data-slot='action-row'
      {...props}
    />
  )
}
