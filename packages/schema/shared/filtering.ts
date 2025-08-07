import type { ExtractedField } from '@openfaith/schema/shared/introspection'
import { getUiConfigFromAST } from '@openfaith/schema/shared/introspection'
import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { Array, Option, pipe, SchemaAST } from 'effect'

/**
 * Helper function to get annotation from schema, handling both old and new formats
 */
const getAnnotationFromSchema = <A>(annotation: any, schema: any): Option.Option<A> => {
  if (!schema) {
    return Option.none()
  }

  // Try direct annotation access first
  const directAnnotation = SchemaAST.getAnnotation<A>(annotation)(schema)
  if (Option.isSome(directAnnotation)) {
    return directAnnotation
  }

  // For PropertySignature, try the type
  if (schema.type) {
    return SchemaAST.getAnnotation<A>(annotation)(schema.type)
  }

  return Option.none()
}

const getFieldDescription = (field: ExtractedField): string | undefined => {
  // Try to get description from the property signature first
  const propertyDescriptionOpt = getAnnotationFromSchema<string>(
    SchemaAST.DescriptionAnnotationId,
    field.schema,
  )
  if (Option.isSome(propertyDescriptionOpt)) {
    return propertyDescriptionOpt.value
  }

  return undefined
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

  if (contextConfig?.hidden) {
    return true
  }

  if (isSystemField(field.key)) {
    return true
  }

  if (isEntityTypeField(field.key)) {
    return true
  }

  if (isIdentificationField(field.key)) {
    const description = getFieldDescription(field)
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
