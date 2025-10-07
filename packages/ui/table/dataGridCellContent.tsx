import type { GridCell } from '@glideapps/glide-data-grid'
import { GridCellKind } from '@glideapps/glide-data-grid'
import { autoDetectCellConfig, extractAST, getContextConfig } from '@openfaith/schema'
import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { format } from 'date-fns/fp'
import { Array, Option, pipe, Record } from 'effect'

/**
 * Converts schema field type to GridCell type
 * This is the core function that determines how data is displayed in Glide Data Grid
 */
export const getGridCellContent = (field: any, value: any, editable = true): GridCell => {
  // Get table config using shared utility
  const tableConfig = getContextConfig(field, 'table') as FieldConfig['table']

  // Always run auto-detection to get cellType if not explicitly configured
  const autoConfig = autoDetectCellConfig(extractAST(field.schema), field.key)

  // Merge configs with tableConfig taking precedence, but use autoConfig for missing cellType
  const mergedConfig = {
    ...autoConfig,
    ...tableConfig,
    cellType: tableConfig?.cellType || autoConfig?.cellType,
  }

  const cellType = mergedConfig.cellType

  // Determine if this specific field should be editable
  // Avatar images are not editable, everything else can be edited if editable is true
  const isFieldReadonly = tableConfig?.readonly === true
  const isEditable = editable && !isFieldReadonly && cellType !== 'avatar'

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return {
      allowOverlay: isEditable,
      data: '',
      displayData: '',
      kind: GridCellKind.Text,
    }
  }

  // Map cell types to GridCell types
  switch (cellType) {
    case 'boolean':
      return {
        allowOverlay: false, // Boolean cells don't support overlay editing in Glide
        data: Boolean(value),
        kind: GridCellKind.Boolean,
      }

    case 'number':
    case 'currency':
      return {
        allowOverlay: isEditable,
        data: Number(value),
        displayData: `${value}`,
        kind: GridCellKind.Number,
      }

    case 'link':
    case 'email':
      return {
        allowOverlay: isEditable,
        data: `${value}`,
        kind: GridCellKind.Uri,
      }

    case 'avatar':
      return {
        allowOverlay: false, // Always false for images
        data: [`${value}`],
        displayData: [`${value}`], // URLs for display
        kind: GridCellKind.Image,
        rounding: 9999, // Make it fully rounded (circle)
      }

    case 'date':
    case 'datetime': {
      const dateStr = pipe(new Date(value), format('MMM d, yyyy h:mm a'))

      return {
        allowOverlay: isEditable,
        data: value,
        displayData: dateStr,
        kind: GridCellKind.Text,
      }
    }

    case 'badge':
      return {
        allowOverlay: isEditable,
        data: [`${value}`],
        kind: GridCellKind.Bubble,
        // Could potentially use bubble/tag styling in the future
      }

    case 'entityLink':
      // Entity links are displayed as text but could be made clickable
      return {
        allowOverlay: isEditable,
        data: `${value}`,
        displayData: `${value}`,
        kind: GridCellKind.Text,
      }

    default:
      return {
        allowOverlay: isEditable,
        data: `${value}`,
        displayData: `${value}`,
        kind: GridCellKind.Text,
      }
  }
}

/**
 * Creates a special cell for the actions column
 */
export const getActionsCell = (): GridCell => {
  return {
    allowOverlay: false,
    data: '',
    displayData: '⋮', // Three dots icon
    kind: GridCellKind.Text,
  }
}

export const getRelationCell = (
  relatedIds: ReadonlyArray<string> = [],
  entityNames: Record<string, string> = {},
): GridCell => ({
  allowOverlay: false,
  data: pipe(
    relatedIds,
    Array.map((id) =>
      pipe(
        entityNames,
        Record.get(id),
        Option.getOrElse(() => id),
      ),
    ),
  ),
  kind: GridCellKind.Bubble,
})
