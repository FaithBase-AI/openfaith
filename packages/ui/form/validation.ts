import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { Schema } from 'effect'

/**
 * Creates a TanStack Form validator from field configuration and schema
 */
export const createValidator = <T>(
  config: Required<NonNullable<FieldConfig['field']>>,
  _schema: Schema.Schema<T>,
  _fieldName: keyof T,
) => {
  return (value: any): string | undefined => {
    // Basic required validation
    if (config.required && (value === null || value === undefined || value === '')) {
      return `${config.label} is required`
    }

    // Skip validation if field is empty and not required
    if (!config.required && (value === null || value === undefined || value === '')) {
      return undefined
    }

    // Type-specific validation
    if (config.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Invalid email address'
      }
    }

    if (config.type === 'number' && value !== null && value !== undefined) {
      const numValue = Number(value)
      if (Number.isNaN(numValue)) {
        return 'Must be a valid number'
      }
      if (config.min !== undefined && numValue < Number(config.min)) {
        return `Must be at least ${config.min}`
      }
      if (config.max !== undefined && numValue > Number(config.max)) {
        return `Must be at most ${config.max}`
      }
    }

    if (config.type === 'select' && config.options.length > 0) {
      const validValues = config.options.map((opt) => opt.value)
      if (!validValues.includes(String(value))) {
        return 'Please select a valid option'
      }
    }

    if (config.type === 'tags' && Array.isArray(value)) {
      if (config.options.length > 0) {
        const validValues = config.options.map((opt) => opt.value)
        const invalidTags = value.filter((tag: any) => !validValues.includes(String(tag)))
        if (invalidTags.length > 0) {
          return `Invalid tags: ${invalidTags.join(', ')}`
        }
      }
    }

    return undefined
  }
}

/**
 * Creates a comprehensive validator that uses Effect Schema for validation
 */
export const createSchemaValidator = <T>(schema: Schema.Schema<T>, fieldName: keyof T) => {
  return (value: any): string | undefined => {
    try {
      // Create a partial object with just this field
      const partialData = { [fieldName]: value } as Partial<T>

      // Try to decode the partial data
      // Note: This is a simplified approach. In practice, you might want to
      // extract the specific field schema and validate just that field
      const result = Schema.decodeUnknownEither(schema)(partialData)

      if (result._tag === 'Left') {
        // Extract the first error message for this field
        const errors = result.left.message || 'Validation failed'
        return errors
      }

      return undefined
    } catch (_error) {
      return 'Validation error occurred'
    }
  }
}

/**
 * Combines field-level and schema-level validation
 */
export const createCombinedValidator = <T>(
  config: Required<NonNullable<FieldConfig['field']>>,
  schema: Schema.Schema<T>,
  fieldName: keyof T,
) => {
  const fieldValidator = createValidator(config, schema, fieldName)
  const schemaValidator = createSchemaValidator(schema, fieldName)

  return (value: any): string | undefined => {
    // First run field-level validation
    const fieldError = fieldValidator(value)
    if (fieldError) {
      return fieldError
    }

    // Then run schema-level validation
    const schemaError = schemaValidator(value)
    if (schemaError) {
      return schemaError
    }

    return undefined
  }
}

/**
 * Validates a complete form object against a schema
 */
export const validateFormData = <T>(
  schema: Schema.Schema<T>,
  data: unknown,
): { isValid: boolean; errors: Record<string, string>; data?: T } => {
  try {
    const result = Schema.decodeUnknownEither(schema)(data)

    if (result._tag === 'Right') {
      return {
        data: result.right,
        errors: {},
        isValid: true,
      }
    }
    // Parse the error to extract field-specific errors
    const errors: Record<string, string> = {}

    // This is a simplified error parsing - you might want to implement
    // more sophisticated error extraction based on Effect's ParseError structure
    errors.general = result.left.message || 'Validation failed'

    return {
      errors,
      isValid: false,
    }
  } catch (_error) {
    return {
      errors: {
        general: 'Validation error occurred',
      },
      isValid: false,
    }
  }
}
