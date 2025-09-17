import { Loader2Icon } from '@openfaith/ui/icons/loader2Icon'
import { cn } from '@openfaith/ui/shared/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { type ComponentProps, cloneElement, isValidElement, type ReactNode } from 'react'

const buttonDisplayClassNames =
  'inline-flex items-center justify-center gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer'

const buttonVariants = cva(
  cn(
    buttonDisplayClassNames,
    'group relative whitespace-nowrap rounded-lg font-medium text-sm ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
  ),
  {
    compoundVariants: [
      {
        className: 'text-primary-background/80',
        size: 'icon-sm',
        variant: 'ghost',
      },
    ],
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-10 px-4 py-2',
        icon: 'h-10 w-10',
        'icon-sm': 'size-8 [&_svg]:size-3.5',
        'icon-xs': 'size-6 [&_svg]:size-3.5',
        lg: 'h-11 rounded-lg px-8',
        md: 'h-10 rounded-lg px-3',
        sm: 'h-9 rounded-lg px-3',
        xs: 'h-8 rounded-lg px-2',
      },
      variant: {
        default:
          'border border-primary bg-linear-to-b from-primary/80 to-primary text-primary-foreground text-sm shadow-md shadow-zinc-950/30 ring-1 ring-3 ring-white/20 ring-inset transition-[filter] duration-200 hover:brightness-125 active:brightness-95 dark:border-primary dark:from-primary dark:to-primary/80 **:[text-shadow:0_1px_0_var(--color-primary)]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
  },
)

// Supper hacky
// https://github.com/radix-ui/primitives/issues/1825#issuecomment-1574481325
const NewSlottable = ({
  asChild,
  child,
  children,
  ...props
}: {
  asChild: boolean
  child: ReactNode
  children: (props: any) => ReactNode
}) => {
  return (
    <>
      {asChild
        ? isValidElement(child)
          ? // @ts-ignore
            cloneElement(child, props, children(child.props.children))
          : null
        : children(child)}
    </>
  )
}

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  contentWrapperClassName?: string
}

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled = false,
  children,
  contentWrapperClassName,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot.Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ size, variant }), className)}
      data-disabled={disabled || loading}
      data-loading={loading}
      data-slot='button'
      {...props}
    >
      <NewSlottable asChild={asChild} child={children}>
        {(child) => (
          <>
            <span className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2'>
              <Loader2Icon className='size-8 opacity-0 group-data-[loading=true]:animate-spin group-data-[loading=true]:opacity-100' />
            </span>
            <span
              className={cn(
                buttonDisplayClassNames,
                'transition-opacity group-data-[loading=true]:opacity-30',
                contentWrapperClassName,
              )}
            >
              {child}
            </span>
          </>
        )}
      </NewSlottable>
    </Comp>
  )
}
Button.displayName = 'Button'

export { Button, buttonVariants }
