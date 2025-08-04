'use client'

import type { RecordData } from '@openfaith/schema'
import { Avatar, AvatarFallback, getAvatarInitials } from '@openfaith/ui/components/ui/avatar'
import { Skeleton } from '@openfaith/ui/components/ui/skeleton'
import { cn } from '@openfaith/ui/shared/utils'
import { Match, Option, pipe, String } from 'effect'

import type { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentPropsWithoutRef, FC, Ref } from 'react'

type BaseAvatarProps = {
  size?: number
  ref?: Ref<HTMLElement>
  name: string | null
  avatar?: string | null
  _tag?: RecordData['_tag']
} & ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>

type BaseAvatarSkeletonProps = {
  size?: number
  _tag?: RecordData['_tag']
  className?: string
}

const getAvatarClassName = (_tag?: RecordData['_tag']) =>
  pipe(
    _tag,
    Option.fromNullable,
    Option.match({
      onNone: () => '',
      onSome: (x) =>
        pipe(
          Match.value(x),
          Match.when('org', () => 'rounded-md'),
          Match.orElse(() => ''),
        ),
    }),
  )

export const BaseAvatarSkeleton: FC<BaseAvatarSkeletonProps> = (props) => {
  const { size = 40, _tag, className } = props

  return (
    <Skeleton
      className={cn(getAvatarClassName(_tag), className)}
      style={{ height: size, width: size }}
    />
  )
}

export const BaseAvatar: FC<BaseAvatarProps> = (props) => {
  const { size = 40, style = {}, name, avatar, ref, className, _tag, ...domProps } = props

  return (
    <Avatar
      {...domProps}
      className={cn(getAvatarClassName(_tag), className)}
      ref={ref}
      style={{ ...style, height: size, width: size }}
    >
      {pipe(
        avatar,
        Option.fromNullable,
        Option.filter(String.isNonEmpty),
        Option.match({
          onNone: () => (
            <AvatarFallback>
              {pipe(
                name,
                Option.fromNullable,
                Option.match({
                  onNone: () => '',
                  onSome: (x) =>
                    pipe(
                      _tag,
                      Option.fromNullable,
                      Option.match({
                        onNone: () => getAvatarInitials(x),
                        onSome: (y) => getAvatarInitials(x, y),
                      }),
                    ),
                }),
              )}
            </AvatarFallback>
          ),
          onSome: (x) => (
            <img
              alt={`Avatar image.`}
              className={'object-cover'}
              height={size}
              src={x}
              style={{ height: size, width: size }}
              width={size}
            />
          ),
        }),
      )}
    </Avatar>
  )
}
