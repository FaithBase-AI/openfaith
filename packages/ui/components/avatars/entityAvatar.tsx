'use client'

import type { RecordData } from '@openfaith/schema'
import { OrgAvatar } from '@openfaith/ui/components/avatars/orgAvatar'
import { UserAvatar } from '@openfaith/ui/components/avatars/userAvatar'
import { cn } from '@openfaith/ui/shared/utils'
import { Match, Option, pipe } from 'effect'
import type { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentPropsWithoutRef, FC, Ref } from 'react'

type EntityAvatarProps = {
  record: RecordData
  size?: number
  ref?: Ref<HTMLElement>
} & ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>

export const EntityAvatar: FC<EntityAvatarProps> = (props) => {
  const { record, size = 40, style = {}, className, ref, ...domProps } = props

  return pipe(
    Match.type<RecordData>(),

    Match.tag('user', (x) => (
      <UserAvatar
        className={cn('rounded-md', className)}
        name={pipe(
          x.name,
          Option.fromNullable,
          Option.getOrElse(() => ''),
        )}
        ref={ref}
        size={size}
        style={style}
        userId={x.id}
        {...domProps}
      />
    )),
    Match.tag('org', (x) => (
      <OrgAvatar
        className={cn('rounded-md', className)}
        org={x}
        ref={ref}
        size={size}
        style={style}
        {...domProps}
      />
    )),
    Match.exhaustive,
  )(record)
}
EntityAvatar.displayName = 'EntityAvatar'
