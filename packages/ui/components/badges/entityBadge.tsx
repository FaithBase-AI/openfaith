'use client'

import { formatLabel } from '@openfaith/shared'
import { EntityAvatar } from '@openfaith/ui/components/avatars/entityAvatar'
import { BadgeSkeleton } from '@openfaith/ui/components/badges/badgeSkeleton'
import { Badge, entityBadgeClassName } from '@openfaith/ui/components/ui/badge'
import { cn } from '@openfaith/ui/shared/utils'
import { getBaseEntityQuery } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import { Boolean, pipe } from 'effect'
import type { FC } from 'react'
import { useMemo } from 'react'

// Type for any entity with _tag, id, and optional displayName getter
type EntityRecord = {
  _tag: string
  id: string
  displayName?: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  [key: string]: unknown
}

type EntityBadgeBaseProps = {
  showAvatar?: boolean
  highlight?: boolean
  className?: string
}

type EntityIdBadgeProps = EntityBadgeBaseProps & {
  entityId: string
  entityType: string
}

// Helper to get display name for an entity - now checks for displayName getter first
const getEntityDisplayName = (entity: EntityRecord): string => {
  // First, try the displayName getter from schema classes
  if ('displayName' in entity && typeof entity.displayName === 'string') {
    return entity.displayName
  }

  // Fallback to legacy logic for entities that haven't been converted to classes yet
  // Try common name field first
  if (entity.name) {
    return entity.name
  }

  // For person entities, try to construct name from firstName/lastName
  if (entity._tag === 'person' && ('firstName' in entity || 'lastName' in entity)) {
    const firstName = entity.firstName || ''
    const lastName = entity.lastName || ''
    return `${firstName} ${lastName}`.trim() || `Person ${entity.id}`
  }

  // For address entities, construct from street and city
  if (entity._tag === 'address') {
    const streetLine1 = (entity as any).streetLine1 || ''
    const city = (entity as any).city || ''
    const location = (entity as any).location || ''

    if (streetLine1 && city) {
      return `${streetLine1}, ${city}`
    }
    if (streetLine1) {
      return streetLine1
    }
    if (city) {
      return city
    }
    if (location) {
      return `${location} Address`
    }
    return `Address ${entity.id}`
  }

  // For campus entities, use name field
  if (entity._tag === 'campus' && entity.name) {
    return entity.name
  }

  // For phone number entities
  if (entity._tag === 'phoneNumber') {
    const number = (entity as any).number || ''
    const location = (entity as any).location || ''
    if (number) {
      return location ? `${location}: ${number}` : number
    }
    return `Phone ${entity.id}`
  }

  // For group entities
  if (entity._tag === 'group' && 'name' in entity) {
    return entity.name || `Group ${entity.id}`
  }

  // Fallback to entity type + ID
  return `${formatLabel(entity._tag)} ${entity.id}`
}

// Component that fetches entity directly from Zero
const _EntityIdBadgeWithZero: FC<EntityIdBadgeProps> = (props) => {
  const { entityId, entityType, showAvatar = false, highlight = false, className } = props
  const z = useZero()
  // Create Zero query directly using the entity type as table name
  const tableName = useMemo(() => {
    // Convert entity type to Zero table name (e.g., "campus" -> "campuses", "phoneNumber" -> "phoneNumbers")
    if (entityType === 'campus') return 'campuses'
    if (entityType === 'phoneNumber') return 'phoneNumbers'
    if (entityType === 'address') return 'addresses'
    if (entityType === 'person') return 'people'
    if (entityType === 'group') return 'groups'
    // Add more mappings as needed
    return `${entityType}s` // Default pluralization
  }, [entityType])

  const query = useMemo(() => {
    if (!entityId) return null
    return getBaseEntityQuery(z, tableName, entityId)
  }, [z, tableName, entityId])

  const [data, info] = useQuery(query as Parameters<typeof useQuery>[0])

  if (info.type !== 'complete') {
    return <BadgeSkeleton className={className} highlight={highlight} showAvatar={showAvatar} />
  }

  if (!data) {
    // Fallback display when entity not found
    return (
      <Badge className={cn(entityBadgeClassName, className)} variant='secondary'>
        <span className='truncate'>{`${formatLabel(entityType)} ${entityId}`}</span>
      </Badge>
    )
  }

  // Convert to EntityRecord format and render
  const entity = {
    ...data,
    _tag: entityType,
  } as EntityRecord

  return (
    <EntityBadge
      className={className}
      entity={entity}
      highlight={highlight}
      showAvatar={showAvatar}
    />
  )
}

// Export component that uses Zero-based entity fetching
export const EntityIdBadge: FC<EntityIdBadgeProps> = (props) => {
  return <_EntityIdBadgeWithZero {...props} />
}

type EntityBadgeProps = EntityBadgeBaseProps & {
  entity: EntityRecord
}

export const EntityBadge: FC<EntityBadgeProps> = (props) => {
  const { entity, showAvatar = false, highlight = false, className } = props
  const displayName = getEntityDisplayName(entity)

  return (
    <Badge
      className={cn(entityBadgeClassName, className)}
      highlight={highlight}
      variant='secondary'
    >
      {pipe(
        showAvatar,
        Boolean.match({
          onFalse: () => null,
          onTrue: () => (
            <EntityAvatar
              className='-ml-1.5 relative mr-1.5 size-6 rounded-md'
              record={entity}
              size={24}
            />
          ),
        }),
      )}
      <span className='truncate'>{displayName}</span>
    </Badge>
  )
}
