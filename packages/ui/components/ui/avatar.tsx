'use client'

import { cn } from '@openfaith/ui/shared/utils'
import { Boolean, Option, pipe, String } from 'effect'
import initials from 'initials'
import { Avatar as AvatarPrimitive } from 'radix-ui'

const getAvatarInitials = (name?: string | null, fallback = '') =>
  initials(
    pipe(
      name,
      Option.fromNullable,
      Option.getOrElse(() => fallback),
      (x) =>
        pipe(
          x.length > 2,
          Boolean.match({
            onFalse: () => x,
            onTrue: () => `${pipe(x, String.takeLeft(1))}${pipe(x, String.takeRight(1))}`,
          }),
        ),
    ),
  )

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      data-slot='avatar'
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn('aspect-square size-full', className)}
      data-slot='avatar-image'
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted uppercase',
        className,
      )}
      data-slot='avatar-fallback'
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage, getAvatarInitials }
