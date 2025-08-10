import type { GridColumn } from '@glideapps/glide-data-grid'
import {
  autoDetectCellConfig,
  extractAST,
  extractSchemaFields,
  getContextConfig,
  getVisibleFields,
} from '@openfaith/schema'
import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { formatLabel } from '@openfaith/shared'
import type { Schema } from 'effect'
import { Array, Order, pipe } from 'effect'

/**
 * Gets header icon for different cell types
 * These are from Glide Data Grid's built-in sprite sheet
 */
export const getHeaderIcon = (cellType?: string): string | undefined => {
  switch (cellType) {
    case 'avatar':
      return 'headerImage'
    case 'boolean':
      return 'headerBoolean'
    case 'number':
    case 'currency':
      return 'headerNumber'
    case 'date':
    case 'datetime':
      return 'headerDate'
    case 'email':
      return 'headerEmail'
    case 'link':
      return 'headerUri'
    case 'badge':
      return 'headerCode'
    default:
      return 'headerString'
  }
}

/**
 * Gets default width for different cell types
 */
export const getDefaultWidth = (cellType?: string): number => {
  switch (cellType) {
    case 'avatar':
      return 80
    case 'boolean':
      return 100
    case 'number':
      return 100
    case 'currency':
      return 120
    case 'date':
    case 'datetime':
      return 140
    case 'email':
      return 200
    case 'badge':
      return 120
    case 'link':
      return 180
    default:
      return 150
  }
}

/**
 * Generates Data Grid column definitions from a schema
 * Returns both the columns and a map of column IDs to field metadata
 */
export const generateDataGridColumns = <T,>(
  schema: Schema.Schema<T>,
): {
  columns: Array<GridColumn>
  columnIdToField: Map<string, any>
} => {
  const fields = extractSchemaFields(schema)
  const visibleFields = getVisibleFields(fields, 'table')

  // Create a map of column id to field for quick lookup
  const columnIdToField = new Map<string, any>()

  const columnsWithOrder = pipe(
    visibleFields,
    Array.map((field) => {
      const key = field.key
      const tableConfig = getContextConfig(field, 'table') as FieldConfig['table']

      // Always run auto-detection to get cellType if not explicitly configured
      const autoConfig = autoDetectCellConfig(extractAST(field.schema), field.key)

      // Merge configs with tableConfig taking precedence, but use autoConfig for missing cellType
      const mergedConfig = {
        ...autoConfig,
        ...tableConfig,
        cellType: tableConfig?.cellType || autoConfig?.cellType,
      }

      // Store field by column id (key)
      columnIdToField.set(key, field)

      const column: GridColumn & { order: number } = {
        icon: getHeaderIcon(mergedConfig.cellType),
        id: key,
        order: mergedConfig.order ?? 999,
        title: mergedConfig.header || formatLabel(`${key}`),
        width: mergedConfig.width || getDefaultWidth(mergedConfig.cellType),
      }

      return column
    }),
  )

  // Sort columns by order
  const sortedColumns = pipe(
    columnsWithOrder,
    Array.sortBy(
      Order.mapInput(Order.number, (item: GridColumn & { order: number }) => item.order),
    ),
    Array.map(({ order, ...column }) => column),
  )

  return { columnIdToField, columns: sortedColumns }
}
