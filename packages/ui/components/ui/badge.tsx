import { cn } from '@openfaith/ui/shared/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps, ElementType } from 'react'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        avatar:
          'content-center gap-2 border-transparent bg-secondary py-[3px] pl-[3px] text-secondary-foreground capitalize hover:bg-secondary/80',
      },
      highlight: {
        true: 'shadow-indigo-500/25 shadow-lg',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      highlight: false,
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  highlight = false,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = (asChild ? Slot : 'span') as ElementType

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant, highlight }), className)}
      {...props}
    />
  )
}

const BadgeRow = (props: ComponentProps<'div'>) => {
  const { className, ...domProps } = props

  return (
    <div
      className={cn('flex flex-col items-start gap-2', className)}
      data-slot='badge-row'
      {...domProps}
    />
  )
}
BadgeRow.displayName = 'BadgeRow'

const NoBadges = (props: ComponentProps<'p'>) => {
  const { className, children, ...domProps } = props

  return (
    <p
      className={cn('ml-1 text-muted-foreground text-xs', className)}
      data-slot='no-badges'
      {...domProps}
    >
      {children}
    </p>
  )
}
NoBadges.displayName = 'NoBadges'

const entityBadgeClassName = 'text-left capitalize rounded-xl truncate shrink-0'

export { Badge, BadgeRow, badgeVariants, entityBadgeClassName, NoBadges }
