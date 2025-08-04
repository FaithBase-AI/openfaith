import {
  type ExtractedField,
  extractAST,
  extractLiteralOptions,
  extractSchemaFields,
  getContextConfig,
  getVisibleFields,
} from '@openfaith/schema'
import { getUiConfigFromAST } from '@openfaith/schema/shared/introspection'
import { type FieldConfig, getUnderlyingType } from '@openfaith/schema/shared/schema'
import { formatLabel } from '@openfaith/shared'
import { createColumnConfigHelper } from '@openfaith/ui/components/data-table-filter/core/filters'
import type {
  ColumnConfig,
  ColumnDataType,
} from '@openfaith/ui/components/data-table-filter/core/types'
import { CalendarIcon } from '@openfaith/ui/icons/calendarIcon'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { FilterIcon } from '@openfaith/ui/icons/filterIcon'
import { ListIcon } from '@openfaith/ui/icons/listIcon'
import { SearchIcon } from '@openfaith/ui/icons/searchIcon'
import { Array, Match, Option, pipe, type Schema, String } from 'effect'

/**
 * Maps field types to appropriate filter icons
 */
const getFilterIcon = (filterType: ColumnDataType, fieldName: string) => {
  const lowerFieldName = pipe(fieldName, String.toLowerCase)

  return Match.value(filterType).pipe(
    Match.when('text', () => SearchIcon),
    Match.when('number', () => FilterIcon),
    Match.when('date', () => CalendarIcon),
    Match.when('option', () => {
      if (
        pipe(lowerFieldName, String.includes('status')) ||
        pipe(lowerFieldName, String.includes('type')) ||
        pipe(lowerFieldName, String.includes('category'))
      ) {
        return CircleIcon
      }
      return ListIcon
    }),
    Match.when('multiOption', () => ListIcon),
    Match.orElse(() => SearchIcon),
  )
}

/**
 * Detects the appropriate filter type based on schema field information
 */
const detectFilterType = (
  fieldSchema: ExtractedField['schema'],
  fieldName: string,
  tableConfig: FieldConfig['table'],
): { type: ColumnDataType; options?: Array<{ value: string; label: string }> } => {
  const ast = extractAST(fieldSchema)
  const underlyingType = getUnderlyingType(ast)
  const lowerFieldName = pipe(fieldName, String.toLowerCase)

  // Check for literal options (enums)
  const literalOptions = extractLiteralOptions(ast)
  if (literalOptions.length > 0) {
    return {
      options: literalOptions,
      type: 'option',
    }
  }

  // Check underlying type
  return Match.value(underlyingType).pipe(
    Match.when('boolean', () => ({
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      type: 'option' as const,
    })),
    Match.when('number', () => ({ type: 'number' as const })),
    Match.when('string', () => {
      // Check for date-related fields
      if (
        pipe(lowerFieldName, String.includes('date')) ||
        pipe(lowerFieldName, String.includes('time')) ||
        pipe(lowerFieldName, String.includes('created')) ||
        pipe(lowerFieldName, String.includes('updated')) ||
        pipe(lowerFieldName, String.includes('birthday')) ||
        pipe(lowerFieldName, String.includes('anniversary'))
      ) {
        return { type: 'date' as const }
      }

      // Check table config for specific cell types that suggest filter types
      if (tableConfig?.cellType === 'date' || tableConfig?.cellType === 'datetime') {
        return { type: 'date' as const }
      }

      if (tableConfig?.cellType === 'badge') {
        return { type: 'option' as const }
      }

      return { type: 'text' as const }
    }),
    Match.orElse(() => ({ type: 'text' as const })),
  )
}

/**
 * Creates a filter configuration for a single field
 */
const createFilterConfigForField = <T,>(
  field: ExtractedField,
  dtf: ReturnType<typeof createColumnConfigHelper<T>>,
): Option.Option<ColumnConfig<T, any, any, any>> => {
  const key = field.key as keyof T
  const tableConfig = getContextConfig(field, 'table')

  // Skip fields that are explicitly marked as non-filterable
  if (tableConfig && 'filterable' in tableConfig && tableConfig.filterable === false) {
    return Option.none()
  }

  const filterInfo = detectFilterType(field.schema, field.key, tableConfig)
  const icon = getFilterIcon(filterInfo.type, field.key)
  const displayName =
    (tableConfig && 'header' in tableConfig ? tableConfig.header : undefined) ||
    formatLabel(field.key)

  // Create the appropriate builder based on filter type
  const baseBuilder = Match.value(filterInfo.type).pipe(
    Match.when('text', () => dtf.text()),
    Match.when('number', () => dtf.number()),
    Match.when('date', () => dtf.date()),
    Match.when('option', () => dtf.option()),
    Match.when('multiOption', () => dtf.multiOption()),
    Match.orElse(() => dtf.text()),
  )

  // Build the configuration with common properties
  const builderWithCommon = baseBuilder
    .id(key as string)
    .accessor((row: T) => {
      const value = row[key]

      // Handle different value types for filtering
      if (filterInfo.type === 'option' && typeof value === 'boolean') {
        return value ? 'true' : 'false'
      }

      if (filterInfo.type === 'date' && value instanceof Date) {
        return value
      }

      if (filterInfo.type === 'number' && typeof value === 'number') {
        return value
      }

      // Default to string conversion
      return pipe(
        Option.fromNullable(value),
        Option.map((v) => `${v}`),
        Option.getOrElse(() => ''),
      )
    })
    .displayName(displayName)
    .icon(icon)

  // Add options for option-based filters
  const builderWithOptions = pipe(
    filterInfo.options && (filterInfo.type === 'option' || filterInfo.type === 'multiOption'),
    (hasOptions) => {
      if (hasOptions && filterInfo.options) {
        return builderWithCommon.options(filterInfo.options)
      }
      return builderWithCommon
    },
  )

  // Add min/max for number filters if available from field config
  const uiConfig = getUiConfigFromAST(field.schema)
  const fieldConfig = uiConfig?.field
  const finalBuilder = pipe(
    filterInfo.type === 'number' && fieldConfig && ('min' in fieldConfig || 'max' in fieldConfig),
    (hasMinMax) => {
      if (hasMinMax && fieldConfig) {
        const withMin =
          typeof fieldConfig.min === 'number'
            ? builderWithOptions.min(fieldConfig.min)
            : builderWithOptions
        const withMax = typeof fieldConfig.max === 'number' ? withMin.max(fieldConfig.max) : withMin
        return withMax
      }
      return builderWithOptions
    },
  )

  return Option.some(finalBuilder.build())
}

/**
 * Generates filter column configurations from a schema for data-table-filter
 */
export const generateFilterConfig = <T,>(
  schema: Schema.Schema<T>,
): ReadonlyArray<ColumnConfig<T, any, any, any>> => {
  const fields = extractSchemaFields(schema)
  const visibleFields = getVisibleFields(fields, 'table') // Use table context for consistency
  const dtf = createColumnConfigHelper<T>()

  return pipe(
    visibleFields,
    Array.filterMap((field) => createFilterConfigForField<T>(field, dtf)),
  )
}

/**
 * Generates a simple filter configuration for quick prototyping
 */
export const generateSimpleFilterConfig = <T,>(
  schema: Schema.Schema<T>,
): ReadonlyArray<ColumnConfig<T, any, any, any>> => {
  const fields = extractSchemaFields(schema)
  const dtf = createColumnConfigHelper<T>()

  return pipe(
    fields,
    Array.map((field) =>
      dtf
        .text()
        .id(field.key)
        .accessor((row: T) => {
          const value = row[field.key as keyof T]
          return pipe(
            Option.fromNullable(value),
            Option.map((v) => `${v}`),
            Option.getOrElse(() => ''),
          )
        })
        .displayName(formatLabel(field.key))
        .icon(SearchIcon)
        .build(),
    ),
  )
}
