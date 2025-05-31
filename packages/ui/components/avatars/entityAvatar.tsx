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
        name={pipe(
          x.name,
          Option.fromNullable,
          Option.getOrElse(() => ''),
        )}
        userId={x.id}
        ref={ref}
        size={size}
        style={style}
        className={cn('rounded-md', className)}
        {...domProps}
      />
    )),
    Match.tag('org', (x) => (
      <OrgAvatar
        org={x}
        ref={ref}
        size={size}
        style={style}
        className={cn('rounded-md', className)}
        {...domProps}
      />
    )),
    Match.exhaustive,
  )(record)
}
EntityAvatar.displayName = 'EntityAvatar'
