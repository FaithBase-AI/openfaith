'use client'

import { cn } from '@openfaith/ui/shared/utils'
import { Separator as SeparatorPrimitive } from 'radix-ui'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px',
        className,
      )}
      data-slot='separator-root'
      decorative={decorative}
      orientation={orientation}
      {...props}
    />
  )
}

export { Separator }
