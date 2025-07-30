import { ColumnHeader } from '@openfaith/ui/components/collections/collectionComponents'
import { autoDetectCellConfig } from '@openfaith/ui/form/autoDetection'
import {
  extractAST,
  extractSchemaFields,
  formatLabel,
  getUiConfigFromAST,
} from '@openfaith/ui/form/schemaIntrospection'
import type { ColumnDef } from '@tanstack/react-table'
import type { Schema } from 'effect'
import { getCellRenderer } from './cellRenderers'

// Helper function to get field description from schema
const getFieldDescription = (ast: any): string | undefined => {
  return ast.annotations?.description
}

// Helper function to create header with ColumnHeader component
const createColumnHeader = (column: any, title: string) => {
  return <ColumnHeader column={column}>{title}</ColumnHeader>
}

/**
 * Generates column definitions from a schema for TanStack Table
 */
export const generateColumns = <T,>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<ColumnDef<T>>>> = {},
): Array<ColumnDef<T>> => {
  const fields = extractSchemaFields(schema)
  const columnsWithOrder: Array<{ column: ColumnDef<T>; order: number }> = []

  for (const field of fields) {
    const key = field.key as keyof T

    // Get UI config from annotation
    const uiConfig = getUiConfigFromAST(field.schema)
    const tableConfig = uiConfig?.table

    // Skip hidden fields
    if (tableConfig?.hidden) continue

    // Skip system fields that should always be hidden (based on field key and context)
    const systemFieldsToHide = [
      'createdBy',
      'updatedBy',
      'deletedAt',
      'deletedBy',
      'inactivatedAt',
      'inactivatedBy',
      'customFields',
      'tags',
    ]
    if (systemFieldsToHide.includes(field.key)) continue

    // Skip identification fields (only if they match system field descriptions)
    if (field.key === 'id' || field.key === 'orgId' || field.key === 'externalIds') {
      // Check if this looks like a system field by checking for system-like descriptions
      const description = getFieldDescription(field.schema)
      if (description?.includes('typeid') || description?.includes('external ids')) {
        continue
      }
    }

    // Skip entity type fields
    if (field.key === '_tag' || field.key === 'type') continue

    // Fallback to auto-detection if no config provided
    const autoConfig = tableConfig || autoDetectCellConfig(extractAST(field.schema), field.key)

    // Build column definition
    const column: ColumnDef<T> = {
      accessorKey: key as string,
      cell: getCellRenderer(tableConfig?.cellType || autoConfig?.cellType),
      enableColumnFilter: tableConfig?.filterable ?? autoConfig?.filterable ?? true,
      enableSorting: tableConfig?.sortable ?? autoConfig?.sortable ?? true,
      header: ({ column }) => {
        const title = tableConfig?.header || autoConfig?.header || formatLabel(String(key))
        return createColumnHeader(column, title)
      },
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

    // Get order from table config, fallback to a high number to put unordered columns at the end
    const order = tableConfig?.order ?? 999

    columnsWithOrder.push({ column, order })
  }

  // Sort columns by order, then return just the column definitions
  return columnsWithOrder.sort((a, b) => a.order - b.order).map(({ column }) => column)
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

  return fields.map((field) => ({
    accessorKey: field.key,
    cell: ({ getValue }) => String(getValue() || ''),
    header: formatLabel(field.key),
  }))
}
