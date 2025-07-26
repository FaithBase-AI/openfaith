import { type FieldConfig, getUnderlyingType } from '@openfaith/schema/shared/schema'
import { extractLiteralOptions, hasEmailPattern } from '@openfaith/ui/form/schemaIntrospection'
import { SchemaAST } from 'effect'

/**
 * Auto-detects field configuration from schema AST
 */
export const autoDetectFieldConfig = (
  ast: SchemaAST.AST,
  fieldName: string,
): Partial<FieldConfig['field']> => {
  // First check for email patterns in refinements
  if (hasEmailPattern(ast)) {
    return { type: 'email' }
  }

  // Check for literal unions (select options)
  const literalOptions = extractLiteralOptions(ast)
  if (literalOptions.length > 0) {
    return {
      options: literalOptions,
      type: 'select',
    }
  }

  // Get the underlying type for basic detection
  const underlyingType = getUnderlyingType(ast)

  // Field name-based detection
  const lowerFieldName = fieldName.toLowerCase()

  if (underlyingType === 'string') {
    // Password fields
    if (lowerFieldName.includes('password')) {
      return { type: 'password' }
    }

    // Slug fields
    if (lowerFieldName.includes('slug')) {
      return { type: 'slug' }
    }

    // Bio, description, notes, etc. - longer text fields
    if (
      lowerFieldName.includes('bio') ||
      lowerFieldName.includes('description') ||
      lowerFieldName.includes('notes') ||
      lowerFieldName.includes('comment') ||
      lowerFieldName.includes('message')
    ) {
      return { rows: 3, type: 'textarea' }
    }

    // Default to text
    return { type: 'text' }
  }

  if (underlyingType === 'number') {
    return { type: 'number' }
  }

  if (underlyingType === 'boolean') {
    return { type: 'switch' }
  }

  // Handle array types
  if (SchemaAST.isTupleType(ast) || isArrayType(ast)) {
    return { type: 'tags' }
  }

  // Default fallback
  return { type: 'text' }
}

/**
 * Checks if the AST represents an array type
 */
const isArrayType = (ast: SchemaAST.AST): boolean => {
  // Check for array-like structures
  if (ast._tag === 'Declaration') {
    // This is a simplified check - you might need more sophisticated logic
    return ast.typeParameters.some(
      (param) => param.toString().includes('Array') || param.toString().includes('ReadonlyArray'),
    )
  }

  return false
}

/**
 * Auto-detects table cell configuration from schema AST
 */
export const autoDetectCellConfig = (
  ast: SchemaAST.AST,
  fieldName: string,
): Partial<FieldConfig['table']> => {
  // Email detection
  if (hasEmailPattern(ast)) {
    return { cellType: 'email' }
  }

  const underlyingType = getUnderlyingType(ast)
  const lowerFieldName = fieldName.toLowerCase()

  if (underlyingType === 'string') {
    // Avatar/image fields
    if (
      lowerFieldName.includes('avatar') ||
      lowerFieldName.includes('image') ||
      lowerFieldName.includes('photo')
    ) {
      return { cellType: 'avatar' }
    }

    // URL/link fields
    if (
      lowerFieldName.includes('url') ||
      lowerFieldName.includes('link') ||
      lowerFieldName.includes('website')
    ) {
      return { cellType: 'link' }
    }

    // Status/badge fields
    if (
      lowerFieldName.includes('status') ||
      lowerFieldName.includes('type') ||
      lowerFieldName.includes('category')
    ) {
      return { cellType: 'badge' }
    }

    return { cellType: 'text' }
  }

  if (underlyingType === 'number') {
    // Currency fields
    if (
      lowerFieldName.includes('price') ||
      lowerFieldName.includes('cost') ||
      lowerFieldName.includes('amount') ||
      lowerFieldName.includes('salary') ||
      lowerFieldName.includes('fee')
    ) {
      return { cellType: 'currency' }
    }

    return { cellType: 'number' }
  }

  if (underlyingType === 'boolean') {
    return { cellType: 'boolean' }
  }

  // Date fields (simplified detection)
  if (
    lowerFieldName.includes('date') ||
    lowerFieldName.includes('time') ||
    lowerFieldName.includes('created') ||
    lowerFieldName.includes('updated')
  ) {
    if (lowerFieldName.includes('time') && !lowerFieldName.includes('date')) {
      return { cellType: 'datetime' }
    }
    return { cellType: 'date' }
  }

  return { cellType: 'text' }
}
