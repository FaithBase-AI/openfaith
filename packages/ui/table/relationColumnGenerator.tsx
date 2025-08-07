import type { Edge } from '@openfaith/db'
import { formatLabel, pluralize } from '@openfaith/shared'
import { EntityIdBadges } from '@openfaith/ui/components/badges/entityBadges'
import { ColumnHeader } from '@openfaith/ui/components/collections/collectionComponents'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, Option, pipe } from 'effect'
import type { FC } from 'react'

// Type for entity relationships from the database
export type EntityRelationships = {
  sourceEntityType: string
  targetEntityTypes: ReadonlyArray<string>
}

// Helper to extract related entity IDs from edges
export const getRelatedEntityIds = (
  _entityId: string,
  targetEntityType: string,
  sourceEdges: ReadonlyArray<Edge> = [],
  targetEdges: ReadonlyArray<Edge> = [],
): ReadonlyArray<string> => {
  // Get IDs from source edges (where this entity is the source)
  const fromSourceEdges = pipe(
    sourceEdges,
    Array.filter((edge) => edge.targetEntityTypeTag === targetEntityType),
    Array.map((edge) => edge.targetEntityId),
  )

  // Get IDs from target edges (where this entity is the target)
  const fromTargetEdges = pipe(
    targetEdges,
    Array.filter((edge) => edge.sourceEntityTypeTag === targetEntityType),
    Array.map((edge) => edge.sourceEntityId),
  )

  return pipe([...fromSourceEdges, ...fromTargetEdges], Array.dedupe)
}

// Helper to get relationship type string
export const getRelationshipType = (sourceType: string, targetType: string): string =>
  `${sourceType}_has_${targetType}`

// Component for rendering relation badges in a cell
const RelationCell: FC<{
  relatedIds: ReadonlyArray<string>
  entityType: string
  maxVisible?: number
}> = (props) => {
  const { relatedIds, entityType, maxVisible = 3 } = props

  const hiddenCount = Math.max(0, relatedIds.length - maxVisible)
  const visibleIds = pipe(relatedIds, Array.take(maxVisible))

  return (
    <EntityIdBadges
      entityIds={visibleIds}
      entityType={entityType}
      hiddenCount={hiddenCount}
      showAvatar={true}
    />
  )
}

// Generate relation columns for an entity type
export const generateRelationColumns = <T extends Record<string, any>>(
  entityType: string,
  entityRelationships: ReadonlyArray<EntityRelationships>,
  maxVisibleBadges = 3,
): ReadonlyArray<ColumnDef<T>> =>
  pipe(
    entityRelationships,
    Array.findFirst((rel) => rel.sourceEntityType === entityType),
    Option.match({
      onNone: () => [],
      onSome: (rel) => rel.targetEntityTypes,
    }),
    Array.map((targetEntityType): ColumnDef<T> => {
      const columnId = `relation_${targetEntityType}`
      const displayName = pipe(targetEntityType, formatLabel, pluralize)

      return {
        accessorKey: columnId,
        cell: ({ row }) => {
          const entity = row.original
          const entityId = entity.id as string
          const sourceEdges = (entity.sourceEdges || []) as Array<Edge>
          const targetEdges = (entity.targetEdges || []) as Array<Edge>

          const relatedIds = getRelatedEntityIds(
            entityId,
            targetEntityType,
            sourceEdges,
            targetEdges,
          )

          return (
            <RelationCell
              entityType={targetEntityType}
              maxVisible={maxVisibleBadges}
              relatedIds={relatedIds}
            />
          )
        },
        enableSorting: true,
        header: ({ column }) => <ColumnHeader column={column}>{displayName}</ColumnHeader>,
        id: columnId,
      }
    }),
  )
