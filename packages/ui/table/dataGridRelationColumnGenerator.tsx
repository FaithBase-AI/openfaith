import type { GridColumn } from '@glideapps/glide-data-grid'
import { formatLabel } from '@openfaith/shared'
import type { UiEntityRelationships } from '@openfaith/ui/shared/hooks/schemaHooks'
import { Array, pipe } from 'effect'

/**
 * Generates Data Grid columns for entity relationships
 */
export const generateDataGridRelationColumns = (
  relationships: Array<UiEntityRelationships>,
): Array<GridColumn> => {
  if (relationships.length === 0) {
    return []
  }

  // Generate relation columns as GridColumns
  return pipe(
    relationships,
    Array.flatMap((rel) => {
      // Handle multiple target entity types
      return pipe(
        rel.targetEntityTypes,
        Array.map((targetEntityType) => {
          const column: GridColumn = {
            icon: 'headerArray',
            id: `relation_${targetEntityType}`,
            title: formatLabel(targetEntityType),
            width: 200,
          }
          return column
        }),
      )
    }),
  )
}

/**
 * Creates the actions column for Data Grid
 */
export const createDataGridActionsColumn = (): GridColumn => {
  return {
    icon: 'headerCode',
    id: 'actions',
    title: '',
    width: 56,
  }
}
