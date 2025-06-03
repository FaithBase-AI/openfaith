import { cn } from '@openfaith/ui/shared/utils'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

const dividerVariants = cva('shrink-0 bg-border', {
  variants: {
    variant: {
      primary: '',
      page: 'relative z-10 mx-2 md:mx-4',
      modal: 'mx-4',
    },
    orientation: {
      horizontal: 'h-px',
      vertical: 'w-px',
    },
  },
  defaultVariants: {
    variant: 'primary',
    orientation: 'horizontal',
  },
})

export const Divider = (props: ComponentProps<'div'> & VariantProps<typeof dividerVariants>) => {
  const { className, variant, orientation, ...domProps } = props

  return (
    <div
      className={cn(dividerVariants({ variant, orientation }), className)}
      data-slot='divider'
      {...domProps}
    />
  )
}
