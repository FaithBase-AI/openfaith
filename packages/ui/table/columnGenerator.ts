import { autoDetectCellConfig } from '@openfaith/ui/form/autoDetection'
import {
  extractSchemaFields,
  formatLabel,
  getUiConfigFromAST,
} from '@openfaith/ui/form/schemaIntrospection'
import type { ColumnDef } from '@tanstack/react-table'
import type { Schema } from 'effect'
import { getCellRenderer } from './cellRenderers'

/**
 * Generates column definitions from a schema for TanStack Table
 */
export const generateColumns = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<ColumnDef<T>>>> = {},
): Array<ColumnDef<T>> => {
  const fields = extractSchemaFields(schema)
  const columns: Array<ColumnDef<T>> = []

  for (const field of fields) {
    const key = field.key as keyof T

    // Get UI config from annotation
    const uiConfig = getUiConfigFromAST(field.schema)
    const tableConfig = uiConfig?.table

    // Skip hidden fields
    if (tableConfig?.hidden) continue

    // Fallback to auto-detection if no config provided
    const autoConfig = tableConfig || autoDetectCellConfig(field.schema, field.key)

    // Build column definition
    const column: ColumnDef<T> = {
      accessorKey: key as string,
      cell: getCellRenderer(tableConfig?.cellType || autoConfig?.cellType),
      enableColumnFilter: tableConfig?.filterable ?? autoConfig?.filterable ?? true,
      enableSorting: tableConfig?.sortable ?? autoConfig?.sortable ?? true,
      header: tableConfig?.header || autoConfig?.header || formatLabel(String(key)),
      size: tableConfig?.width || autoConfig?.width || getDefaultWidth(autoConfig?.cellType),
      ...overrides[key],
    }

    // Handle pinned columns
    if (tableConfig?.pinned) {
      column.meta = {
        ...column.meta,
        pinned: tableConfig.pinned,
      }
    }

    columns.push(column)
  }

  return columns
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
export const generateSimpleColumns = <T>(schema: Schema.Schema<T>): Array<ColumnDef<T>> => {
  const fields = extractSchemaFields(schema)

  return fields.map((field) => ({
    accessorKey: field.key,
    cell: ({ getValue }) => String(getValue() || ''),
    header: formatLabel(field.key),
  }))
}
