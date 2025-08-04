'use client'

import { cn } from '@openfaith/ui/shared/utils'
import type { FC, HTMLProps } from 'react'

export const HeightWrapper: FC<HTMLProps<HTMLDivElement>> = (props) => {
  const { children, className, ...domProps } = props

  return (
    <div
      className={cn(
        'flex h-[100svh] flex-col bg-background font-sans! text-foreground transition-all duration-500',
        className,
      )}
      data-wrapper=''
      vaul-drawer-wrapper=''
      {...domProps}
    >
      {children}
    </div>
  )
}
