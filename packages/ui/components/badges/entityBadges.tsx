'use client'

import { pluralize } from '@openfaith/shared'
import { DisplayBadges } from '@openfaith/ui/components/badges/displayBadges'
import { EntityBadge, EntityIdBadge } from '@openfaith/ui/components/badges/entityBadge'
import { Array, pipe } from 'effect'
import type { FC, ReactNode } from 'react'

// Type for any entity with _tag, id, and name
type EntityRecord = {
  _tag: string
  id: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  [key: string]: unknown
}

type EntityIdBadgesProps = {
  entityIds: ReadonlyArray<string>
  entityType: string
  hiddenCount?: number
  className?: string
  emptyTextClassName?: string
  highlightIds?: ReadonlyArray<string>
  showAvatar?: boolean
}

type EntityBadgesProps = {
  entities: ReadonlyArray<EntityRecord>
  hiddenCount?: number
  className?: string
  emptyTextClassName?: string
  highlightIds?: ReadonlyArray<string>
  showAvatar?: boolean
  emptyText?: string
}

export const EntityIdBadges: FC<EntityIdBadgesProps> = (props) => {
  const {
    entityIds,
    entityType,
    hiddenCount = 0,
    className,
    emptyTextClassName,
    highlightIds = [],
    showAvatar = false,
  } = props

  const visibleIds =
    hiddenCount > 0 ? pipe(entityIds, Array.take(entityIds.length - hiddenCount)) : entityIds

  const renderBadge = (id: string): ReactNode => (
    <EntityIdBadge
      entityId={id}
      entityType={entityType}
      highlight={pipe(highlightIds, Array.contains(id))}
      key={id}
      showAvatar={showAvatar}
    />
  )

  const emptyText = `No ${pluralize(entityType)}`

  return (
    <DisplayBadges
      Badges={pipe(visibleIds, Array.map(renderBadge))}
      className={className}
      emptyText={emptyText}
      emptyTextClassName={emptyTextClassName}
      hiddenCount={hiddenCount}
    />
  )
}

export const EntityBadges: FC<EntityBadgesProps> = (props) => {
  const {
    entities,
    hiddenCount = 0,
    className,
    emptyTextClassName,
    highlightIds = [],
    showAvatar = false,
    emptyText = 'No items',
  } = props

  const visibleEntities =
    hiddenCount > 0 ? pipe(entities, Array.take(entities.length - hiddenCount)) : entities

  const renderBadge = (entity: EntityRecord): ReactNode => (
    <EntityBadge
      entity={entity}
      highlight={pipe(highlightIds, Array.contains(entity.id))}
      key={entity.id}
      showAvatar={showAvatar}
    />
  )

  return (
    <DisplayBadges
      Badges={pipe(visibleEntities, Array.map(renderBadge))}
      className={className}
      emptyText={emptyText}
      emptyTextClassName={emptyTextClassName}
      hiddenCount={hiddenCount}
    />
  )
}
