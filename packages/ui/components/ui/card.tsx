import { cn } from '@openfaith/ui/shared/utils'
import { cva } from 'class-variance-authority'
import { Boolean, pipe } from 'effect'
import { Slot } from 'radix-ui'
import type { ElementType } from 'react'

export const cardVariants = cva(
  'flex flex-col gap-6 rounded-2xl border bg-card py-6 text-card-foreground shadow-sm',
)
function Card({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = pipe(
    asChild,
    Boolean.match({ onFalse: () => 'div', onTrue: () => Slot }),
  ) as ElementType
  return <Comp className={cn(cardVariants(), className)} data-slot='card' {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      data-slot='card-header'
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('font-semibold leading-none tracking-tight', className)}
      data-slot='card-title'
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-muted-foreground text-sm', className)}
      data-slot='card-description'
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      data-slot='card-action'
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-6', className)} data-slot='card-content' {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      data-slot='card-footer'
      {...props}
    />
  )
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
