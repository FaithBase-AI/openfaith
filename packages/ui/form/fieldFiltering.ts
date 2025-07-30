import type { FieldConfig } from '@openfaith/schema/shared/schema'
import type { ExtractedField } from '@openfaith/ui/form/schemaIntrospection'
import { getUiConfigFromAST } from '@openfaith/ui/form/schemaIntrospection'
import { Array, pipe } from 'effect'

// Helper function to get field description from schema
const getFieldDescription = (ast: any): string | undefined => {
  return ast.annotations?.description
}

/**
 * System fields that should always be hidden from UI contexts
 */
export const SYSTEM_FIELDS_TO_HIDE = [
  'createdBy',
  'updatedBy',
  'deletedAt',
  'deletedBy',
  'inactivatedAt',
  'inactivatedBy',
  'customFields',
  'tags',
] as const

/**
 * Entity type fields that should be hidden from UI contexts
 */
export const ENTITY_TYPE_FIELDS = ['_tag', 'type'] as const

/**
 * Identification fields that may be hidden based on their description
 */
export const IDENTIFICATION_FIELDS = ['id', 'orgId', 'externalIds'] as const

/**
 * Type guard to check if a field key is a system field
 */
export const isSystemField = (key: string): key is (typeof SYSTEM_FIELDS_TO_HIDE)[number] => {
  return pipe(SYSTEM_FIELDS_TO_HIDE, Array.contains(key as any))
}

/**
 * Type guard to check if a field key is an entity type field
 */
export const isEntityTypeField = (key: string): key is (typeof ENTITY_TYPE_FIELDS)[number] => {
  return pipe(ENTITY_TYPE_FIELDS, Array.contains(key as any))
}

/**
 * Type guard to check if a field key is an identification field
 */
export const isIdentificationField = (
  key: string,
): key is (typeof IDENTIFICATION_FIELDS)[number] => {
  return pipe(IDENTIFICATION_FIELDS, Array.contains(key as any))
}

/**
 * Determines if a field should be hidden from UI based on annotations and field characteristics
 */
export const shouldHideField = (field: ExtractedField, context: 'table' | 'form'): boolean => {
  const uiConfig = getUiConfigFromAST(field.schema)
  const contextConfig = context === 'table' ? uiConfig?.table : uiConfig?.field

  // Check explicit hidden annotation for the context
  if (contextConfig?.hidden) return true

  // Skip system fields that should always be hidden
  if (isSystemField(field.key)) return true

  // Skip entity type fields
  if (isEntityTypeField(field.key)) return true

  // Skip identification fields if they match system field descriptions
  if (isIdentificationField(field.key)) {
    const description = getFieldDescription(field.schema)
    if (description?.includes('typeid') || description?.includes('external ids')) {
      return true
    }
  }

  return false
}

/**
 * Filters fields that should be visible in the UI context
 */
export const getVisibleFields = (
  fields: Array<ExtractedField>,
  context: 'table' | 'form',
): Array<ExtractedField> => {
  return pipe(
    fields,
    Array.filter((field) => !shouldHideField(field, context)),
  )
}

/**
 * Gets the UI config for a specific context (table or form)
 */
export const getContextConfig = (
  field: ExtractedField,
  context: 'table' | 'form',
): FieldConfig['table'] | FieldConfig['field'] | undefined => {
  const uiConfig = getUiConfigFromAST(field.schema)
  return context === 'table' ? uiConfig?.table : uiConfig?.field
}
