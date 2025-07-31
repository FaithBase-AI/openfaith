'use client'

import type { RecordData } from '@openfaith/schema'
import { BaseAvatar } from '@openfaith/ui/components/avatars/baseAvatar'
import { OrgAvatar } from '@openfaith/ui/components/avatars/orgAvatar'
import { UserAvatar } from '@openfaith/ui/components/avatars/userAvatar'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Match, Option, pipe } from 'effect'
import type { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentPropsWithoutRef, FC, Ref } from 'react'

// Type for any entity with _tag, id, name, and optional avatar
type EntityRecord = {
  _tag: string
  id: string
  name?: string | null
  avatar?: string | null
  // Allow additional properties for specific entity types
  [key: string]: unknown
}

type EntityAvatarProps = {
  record: EntityRecord
  size?: number
  ref?: Ref<HTMLElement>
} & ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>

// Helper function to get entity display name
const getEntityDisplayName = (record: EntityRecord): string => {
  // Try common name fields in order of preference
  if (record.name) {
    return record.name
  }

  // For person entities, try to construct name from firstName/lastName
  if (record._tag === 'person') {
    const firstName = 'firstName' in record ? record.firstName : undefined
    const lastName = 'lastName' in record ? record.lastName : undefined
    if (firstName || lastName) {
      return pipe(
        [firstName, lastName] as Array<string | undefined>,
        Array.filter((name): name is string => Boolean(name)),
        Array.join(' '),
      )
    }
  }

  // Fallback to entity type + ID
  return `${record._tag} ${record.id}`
}

// Helper function to get avatar URL
const getEntityAvatarUrl = (record: EntityRecord): string | null => {
  // Try common avatar fields
  if (record.avatar) {
    return record.avatar
  }

  // For user entities, try image field
  if (record._tag === 'user' && 'image' in record && record.image) {
    return record.image as string
  }

  // For org entities, try logo field
  if (record._tag === 'org' && 'logo' in record && record.logo) {
    return record.logo as string
  }

  return null
}

export const EntityAvatar: FC<EntityAvatarProps> = (props) => {
  const { record, size = 40, style = {}, className, ref, ...domProps } = props

  // Handle legacy RecordData types (user/org) with specialized components
  if (record._tag === 'user' || record._tag === 'org') {
    const recordData = record as RecordData

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
    )(recordData)
  }

  // Handle all other entity types with BaseAvatar
  const displayName = getEntityDisplayName(record)
  const avatarUrl = getEntityAvatarUrl(record)

  return (
    <BaseAvatar
      _tag={record._tag === 'user' || record._tag === 'org' ? record._tag : undefined}
      avatar={avatarUrl}
      className={cn('rounded-md', className)}
      name={displayName}
      ref={ref}
      size={size}
      style={style}
      {...domProps}
    />
  )
}
EntityAvatar.displayName = 'EntityAvatar'
