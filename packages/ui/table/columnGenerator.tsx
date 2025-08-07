import {
  autoDetectCellConfig,
  extractAST,
  extractEntityInfo,
  extractSchemaFields,
  getContextConfig,
  getVisibleFields,
} from '@openfaith/schema'
import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { formatLabel } from '@openfaith/shared'
import { ColumnHeader } from '@openfaith/ui/components/collections/collectionComponents'
import { getCellRenderer } from '@openfaith/ui/table/cellRenderers'
import type { Column, ColumnDef } from '@tanstack/react-table'
import type { Schema } from 'effect'
import { Array, Order, pipe } from 'effect'

// Helper function to create header with ColumnHeader component
const createColumnHeader = (column: Column<any, unknown>, title: string) => {
  return <ColumnHeader column={column}>{title}</ColumnHeader>
}

/**
 * Generates column definitions from a schema for TanStack Table
 */
export const generateColumns = <T,>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<ColumnDef<T>>>> = {},
): Array<ColumnDef<T>> => {
  const { entityName: entityType } = extractEntityInfo(schema)
  const fields = extractSchemaFields(schema)
  const visibleFields = getVisibleFields(fields, 'table') // Use shared filtering logic

  const columnsWithOrder = pipe(
    visibleFields,
    Array.map((field) => {
      const key = field.key as Extract<keyof T, string>

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

      // Build column definition
      const finalCellType = mergedConfig.cellType

      const column: ColumnDef<T> = {
        accessorKey: key,
        cell: getCellRenderer(finalCellType, entityType),
        enableColumnFilter: mergedConfig.filterable ?? true,
        enableSorting: mergedConfig.sortable ?? true,
        header: ({ column }) => {
          const title = mergedConfig.header || formatLabel(String(key))
          return createColumnHeader(column, title)
        },
        size: mergedConfig.width || getDefaultWidth(mergedConfig.cellType),
        ...overrides[key],
      }

      // Handle pinned columns
      if (mergedConfig.pinned) {
        column.meta = {
          ...column.meta,
          pinned: mergedConfig.pinned,
        }
      }

      // Get order from merged config, fallback to a high number to put unordered columns at the end
      const order = mergedConfig.order ?? 999

      return { column, order }
    }),
  )

  // Sort columns by order, then return just the column definitions
  return pipe(
    columnsWithOrder,
    Array.sortBy(
      Order.mapInput(Order.number, (item: { column: ColumnDef<T>; order: number }) => item.order),
    ),
    Array.map((item) => item.column),
  )
}

/**
 * Gets default width for different cell types
 */
const getDefaultWidth = (cellType?: string): number => {
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
 * Generates a simple column definition for quick prototyping
 */
export const generateSimpleColumns = <T,>(schema: Schema.Schema<T>): Array<ColumnDef<T>> => {
  const fields = extractSchemaFields(schema)

  return pipe(
    fields,
    Array.map((field) => ({
      accessorKey: field.key,
      cell: ({ getValue }) => String(getValue() || ''),
      header: formatLabel(field.key),
    })),
  )
}
