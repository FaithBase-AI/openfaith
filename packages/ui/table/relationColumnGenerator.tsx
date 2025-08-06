import type { Edge } from '@openfaith/db'
import { pluralize } from '@openfaith/shared'
import { EntityIdBadges } from '@openfaith/ui/components/badges/entityBadges'
import { ColumnHeader } from '@openfaith/ui/components/collections/collectionComponents'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, pipe, String } from 'effect'
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
    Array.filter((edge) => edge.targetEntityTypeTag === targetEntityType.toLowerCase()),
    Array.map((edge) => edge.targetEntityId),
  )

  // Get IDs from target edges (where this entity is the target)
  const fromTargetEdges = pipe(
    targetEdges,
    Array.filter((edge) => edge.sourceEntityTypeTag === targetEntityType.toLowerCase()),
    Array.map((edge) => edge.sourceEntityId),
  )

  // Combine and dedupe
  return pipe([...fromSourceEdges, ...fromTargetEdges], Array.dedupe)
}

// Helper to get relationship type string
export const getRelationshipType = (sourceType: string, targetType: string): string => {
  const source = sourceType.toLowerCase()
  const target = targetType.toLowerCase()
  return `${source}_has_${target}`
}

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
): ReadonlyArray<ColumnDef<T>> => {
  // Find relationships for this entity type
  const relationships = pipe(
    entityRelationships,
    Array.findFirst((rel) => {
      return rel.sourceEntityType === entityType.toLowerCase()
    }),
  )

  if (relationships._tag === 'None') {
    return []
  }

  // Generate a column for each target entity type
  return pipe(
    relationships.value.targetEntityTypes,
    Array.map((targetEntityType): ColumnDef<T> => {
      const columnId = `relation_${targetEntityType}`
      const displayName = pipe(targetEntityType, String.capitalize, pluralize)

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
        enableColumnFilter: true,
        enableSorting: true,
        // Enable filtering by presence of relations
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue) return true

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

          // Filter value can be 'has' or 'none'
          if (filterValue === 'has') {
            return relatedIds.length > 0
          }
          if (filterValue === 'none') {
            return relatedIds.length === 0
          }

          return true
        },
        header: ({ column }) => <ColumnHeader column={column}>{displayName}</ColumnHeader>,
        id: columnId,
        // Sort by count of relations
        sortingFn: (rowA, rowB, _columnId) => {
          const entityA = rowA.original
          const entityB = rowB.original

          const entityIdA = entityA.id as string
          const entityIdB = entityB.id as string

          const sourceEdgesA = (entityA.sourceEdges || []) as Array<Edge>
          const targetEdgesA = (entityA.targetEdges || []) as Array<Edge>
          const sourceEdgesB = (entityB.sourceEdges || []) as Array<Edge>
          const targetEdgesB = (entityB.targetEdges || []) as Array<Edge>

          const relatedIdsA = getRelatedEntityIds(
            entityIdA,
            targetEntityType,
            sourceEdgesA,
            targetEdgesA,
          )
          const relatedIdsB = getRelatedEntityIds(
            entityIdB,
            targetEntityType,
            sourceEdgesB,
            targetEdgesB,
          )

          return relatedIdsA.length - relatedIdsB.length
        },
      }
    }),
  )
}
