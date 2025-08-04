'use client'

import { cn } from '@openfaith/ui/shared/utils'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

const kbdVariants = cva(
  'pointer-events-none flex h-5 min-w-5 select-none items-center justify-center gap-0.5 rounded border px-[3px] font-medium font-sans text-[11px] uppercase',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-muted text-foreground/60',
        inherit: 'border-current bg-inherit text-inherit',
      },
    },
  },
)

export const Kbd = (props: ComponentProps<'kbd'> & VariantProps<typeof kbdVariants>) => {
  const { className, variant, ...domProps } = props

  return <kbd className={cn(kbdVariants({ variant }), className)} data-slot='kbd' {...domProps} />
}
