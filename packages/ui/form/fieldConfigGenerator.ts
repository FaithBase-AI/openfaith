import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { autoDetectCellConfig, autoDetectFieldConfig } from '@openfaith/ui/form/autoDetection'
import {
  extractSchemaFields,
  formatLabel,
  getUiConfigFromAST,
} from '@openfaith/ui/form/schemaIntrospection'
import type { Schema } from 'effect'

/**
 * Generates field configurations for all fields in a schema
 */
export const generateFieldConfigs = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<FieldConfig['field']>>> = {},
): Record<keyof T, Required<FieldConfig['field']>> => {
  const fields = extractSchemaFields(schema)
  const result = {} as Record<keyof T, Required<FieldConfig['field']>>

  for (const field of fields) {
    const key = field.key as keyof T

    // Get UI config from annotation
    const uiConfig = getUiConfigFromAST(field.schema)
    const fieldConfig = uiConfig?.field

    // Fallback to auto-detection if no config provided
    const autoConfig = fieldConfig || autoDetectFieldConfig(field.schema, field.key)

    // Apply defaults and overrides
    const finalConfig: Required<FieldConfig['field']> = {
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
    }

    result[key] = finalConfig
  }

  return result
}

/**
 * Generates table column configurations for all fields in a schema
 */
export const generateColumnConfigs = <T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<FieldConfig['table']>>> = {},
): Record<keyof T, Required<FieldConfig['table']>> => {
  const fields = extractSchemaFields(schema)
  const result = {} as Record<keyof T, Required<FieldConfig['table']>>

  for (const field of fields) {
    const key = field.key as keyof T

    // Get UI config from annotation
    const uiConfig = getUiConfigFromAST(field.schema)
    const tableConfig = uiConfig?.table

    // Fallback to auto-detection if no config provided
    const autoConfig = tableConfig || autoDetectCellConfig(field.schema, field.key)

    // Apply defaults and overrides
    const finalConfig: Required<FieldConfig['table']> = {
      cellType: 'text',
      filterable: true,
      header: formatLabel(String(key)),
      hidden: false,
      pinned: 'left',
      sortable: true,
      width: 150,
      ...autoConfig,
      ...tableConfig,
      ...overrides[key],
    }

    result[key] = finalConfig
  }

  return result
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
