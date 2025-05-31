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
      data-slot='avatar'
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn('aspect-square size-full', className)}
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
      data-slot='avatar-fallback'
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted uppercase',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage, getAvatarInitials }
