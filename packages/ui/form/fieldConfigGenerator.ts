import {
  autoDetectCellConfig,
  autoDetectFieldConfig,
  extractAST,
  extractSchemaFields,
  getContextConfig,
  getVisibleFields,
} from '@openfaith/schema'
import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { formatLabel } from '@openfaith/shared'
import { Array, Order, pipe, type Schema } from 'effect'

/**
 * Generates field configurations for all fields in a schema
 */
export const generateFieldConfigs = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<FieldConfig['field']>>> = {},
): Record<keyof T, Required<FieldConfig['field']>> => {
  const fields = extractSchemaFields(schema)
  const visibleFields = getVisibleFields(fields, 'form') // Use shared filtering logic

  const fieldsWithOrder = pipe(
    visibleFields,
    Array.map((field) => {
      const key = field.key as keyof T

      // Get field config using shared utility
      const fieldConfig = (getContextConfig(field, 'form') as FieldConfig['field']) || {}

      // Fallback to auto-detection if no config provided
      const autoConfig = {
        ...autoDetectFieldConfig(extractAST(field.schema), field.key),
        ...fieldConfig,
      }

      // Apply defaults and overrides
      const baseConfig = {
        creatable: false,
        label: formatLabel(String(key)),
        max: 100,
        min: 0,
        multiple: false,
        options: [],
        placeholder: '',
        required: !field.isOptional && !field.isNullable,
        rows: 3,
        searchable: false,
        step: 1,
        type: 'text',
        ...autoConfig,
        ...fieldConfig,
        ...overrides[key],
      } as const

      // Only set hidden if it's explicitly provided, otherwise default to false
      const finalConfig: Required<FieldConfig['field']> = {
        ...baseConfig,
        hidden: baseConfig.hidden ?? false,
        order: baseConfig.order ?? 999,
      }

      // Get order from field config, fallback to a high number to put unordered fields at the end
      const order = fieldConfig?.order ?? 999

      return { config: finalConfig, key, order }
    }),
  )

  return pipe(
    fieldsWithOrder,
    Array.sort(Order.struct({ order: Order.number })),
    Array.reduce({} as Record<keyof T, Required<FieldConfig['field']>>, (acc, { key, config }) => ({
      ...acc,
      [key]: config,
    })),
  )
}

/**
 * Generates table column configurations for all fields in a schema
 */
export const generateColumnConfigs = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<FieldConfig['table']>>> = {},
): Record<keyof T, Required<FieldConfig['table']>> => {
  const fields = extractSchemaFields(schema)
  const visibleFields = getVisibleFields(fields, 'table') // Use shared filtering logic

  return pipe(
    visibleFields,
    Array.map((field) => {
      const key = field.key as keyof T

      // Get table config using shared utility
      const tableConfig = getContextConfig(field, 'table') as FieldConfig['table']

      // Fallback to auto-detection if no config provided
      const autoConfig = tableConfig || autoDetectCellConfig(extractAST(field.schema), field.key)

      // Apply defaults and overrides
      const baseConfig = {
        cellType: 'text',
        filterable: true,
        header: formatLabel(String(key)),
        order: 0,
        pinned: 'left',
        sortable: true,
        width: 150,
        ...autoConfig,
        ...tableConfig,
        ...overrides[key],
      } as const

      // Only set hidden if it's explicitly provided, otherwise default to false
      const finalConfig: Required<FieldConfig['table']> = {
        ...baseConfig,
        hidden: baseConfig.hidden ?? false,
        readonly: baseConfig.readonly ?? false,
      }

      return { config: finalConfig, key }
    }),
    Array.reduce({} as Record<keyof T, Required<FieldConfig['table']>>, (acc, { key, config }) => ({
      ...acc,
      [key]: config,
    })),
  )
}

/**
 * Generates both field and table configurations for a schema
 */
export const generateUiConfigs = <T>(
  schema: Schema.Schema<T>,
  fieldOverrides: Partial<Record<keyof T, Partial<FieldConfig['field']>>> = {},
  tableOverrides: Partial<Record<keyof T, Partial<FieldConfig['table']>>> = {},
): {
  fields: Record<keyof T, Required<FieldConfig['field']>>
  columns: Record<keyof T, Required<FieldConfig['table']>>
} => {
  return {
    columns: generateColumnConfigs(schema, tableOverrides),
    fields: generateFieldConfigs(schema, fieldOverrides),
  }
}

/**
 * Helper to get a single field configuration
 */
export const getFieldConfig = <T>(
  schema: Schema.Schema<T>,
  fieldName: keyof T,
  overrides: Partial<FieldConfig['field']> = {},
): Required<FieldConfig['field']> => {
  const configs = generateFieldConfigs(schema, {
    [fieldName]: overrides,
  } as any)
  return configs[fieldName]
}

/**
 * Helper to get a single column configuration
 */
export const getColumnConfig = <T>(
  schema: Schema.Schema<T>,
  fieldName: keyof T,
  overrides: Partial<FieldConfig['table']> = {},
): Required<FieldConfig['table']> => {
  const configs = generateColumnConfigs(schema, {
    [fieldName]: overrides,
  } as any)
  return configs[fieldName]
}
