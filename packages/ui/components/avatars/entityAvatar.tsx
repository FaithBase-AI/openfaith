'use client'

import { BaseAvatar } from '@openfaith/ui/components/avatars/baseAvatar'
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

  // Handle all other entity types with BaseAvatar
  const displayName = getEntityDisplayName(record)
  const avatarUrl = getEntityAvatarUrl(record)

  return (
    <BaseAvatar
      _tag={record._tag}
      avatar={avatarUrl}
      className={className}
      name={displayName}
      ref={ref}
      size={size}
      style={style}
      {...domProps}
    />
  )
}
EntityAvatar.displayName = 'EntityAvatar'
