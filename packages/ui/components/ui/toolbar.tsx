'use client'

import { cn } from '@openfaith/ui/shared/utils'
import { Toolbar as ToolbarPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

const ToolbarRoot = ({ className, ...props }: ComponentProps<typeof ToolbarPrimitive.Root>) => (
  <ToolbarPrimitive.Root className={cn('flex w-full', className)} data-slot='toolbar' {...props} />
)

const ToolbarSeparator = ({
  className,
  ...props
}: ComponentProps<typeof ToolbarPrimitive.Separator>) => (
  <ToolbarPrimitive.Separator
    className={cn('mx-2 my-1 w-px shrink-0 bg-muted', className)}
    data-slot='toolbar-separator'
    {...props}
  />
)

export { ToolbarRoot, ToolbarSeparator }
