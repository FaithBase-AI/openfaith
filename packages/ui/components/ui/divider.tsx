import { cn } from '@openfaith/ui/shared/utils'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

const dividerVariants = cva('shrink-0 bg-border', {
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'primary',
  },
  variants: {
    orientation: {
      horizontal: 'h-px',
      vertical: 'w-px',
    },
    variant: {
      modal: 'mx-4',
      page: 'relative z-10 mx-2 md:mx-4',
      primary: '',
    },
  },
})

export const Divider = (props: ComponentProps<'div'> & VariantProps<typeof dividerVariants>) => {
  const { className, variant, orientation, ...domProps } = props

  return (
    <div
      className={cn(dividerVariants({ orientation, variant }), className)}
      data-slot='divider'
      {...domProps}
    />
  )
}
