'use client'

import { EntityAvatar } from '@openfaith/ui/components/avatars/entityAvatar'
import { BadgeSkeleton } from '@openfaith/ui/components/badges/badgeSkeleton'
import { Badge, entityBadgeClassName } from '@openfaith/ui/components/ui/badge'
import { cn } from '@openfaith/ui/shared/utils'
import { useZero } from '@openfaith/zero/useZero'
import { Boolean, Option, pipe } from 'effect'
import type { FC } from 'react'
import { useMemo } from 'react'

// Type for any entity with _tag, id, and name
type EntityRecord = {
  _tag: string
  id: string
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

// Helper to get display name for an entity
const getEntityDisplayName = (entity: EntityRecord): string => {
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

  // For group entities
  if (entity._tag === 'group' && 'name' in entity) {
    return entity.name || `Group ${entity.id}`
  }

  // Fallback to entity type + ID
  return `${entity._tag} ${entity.id}`
}

// Component that requires Zero context
const EntityIdBadgeWithZero: FC<EntityIdBadgeProps> = (props) => {
  const { entityId, entityType, showAvatar = false, highlight = false, className } = props
  const z = useZero()

  // Fetch the entity data
  const entityOpt = useMemo(() => {
    try {
      // Access the query for this entity type
      const query = z.query[entityType as keyof typeof z.query]
      if (!query) {
        return Option.none()
      }

      // Get the entity by ID
      const entity = (query as any).where('id', entityId).one()
      return Option.fromNullable(entity)
    } catch {
      return Option.none()
    }
  }, [z, entityType, entityId])

  const loading = Option.isNone(entityOpt) && !!entityType && !!entityId

  return pipe(
    entityOpt,
    Option.match({
      onNone: () =>
        loading ? (
          <BadgeSkeleton className={className} highlight={highlight} showAvatar={showAvatar} />
        ) : null,
      onSome: (entity) => (
        <EntityBadge
          className={className}
          entity={entity as EntityRecord}
          highlight={highlight}
          showAvatar={showAvatar}
        />
      ),
    }),
  )
}

// Export component that gracefully handles missing Zero context
// In production, this should always have Zero context
// In tests, we show a loading skeleton
export const EntityIdBadge: FC<EntityIdBadgeProps> = (props) => {
  // For now, just use the Zero version directly
  // In tests, this will throw and be caught by error boundaries
  // In production, Zero context should always be available
  return <EntityIdBadgeWithZero {...props} />
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
