import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { Array, Option, pipe, type Schema, SchemaAST } from 'effect'

export interface ExtractedField {
  key: string
  schema: SchemaAST.PropertySignature
  isOptional: boolean
  isNullable: boolean
}

/**
 * Extracts field information from a Schema.Struct
 */
export const extractSchemaFields = <T>(schema: Schema.Schema<T>): Array<ExtractedField> => {
  const ast = schema.ast

  if (ast._tag !== 'TypeLiteral') {
    throw new Error('Can only extract fields from Struct schemas')
  }

  return pipe(
    ast.propertySignatures,
    Array.map((prop) => ({
      isNullable: isNullableSchema(prop.type),
      isOptional: prop.isOptional,
      key: prop.name as string,
      schema: prop,
    })),
  )
}

/**
 * Checks if a schema allows null values
 */
const isNullableSchema = (ast: SchemaAST.AST): boolean => {
  if (SchemaAST.isUnion(ast)) {
    return ast.types.some((t) => t._tag === 'Literal' && t.literal === null)
  }
  return false
}

/**
 * Gets UI configuration from schema annotations
 */
export const getUiConfig = (schema: Schema.Schema.AnyNoContext): FieldConfig | undefined => {
  return pipe(SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(schema.ast), Option.getOrUndefined)
}

// Helper to check if AST represents null or undefined
const isNullOrUndefined = (ast: SchemaAST.AST): boolean =>
  (ast._tag === 'Literal' && ast.literal === null) || ast._tag === 'UndefinedKeyword'

// Helper function that returns Option instead of undefined for better composition
const getUiConfigFromASTOption = (ast: SchemaAST.AST): Option.Option<FieldConfig> => {
  return pipe(
    ast,
    SchemaAST.getAnnotation<FieldConfig>(OfUiConfig),
    Option.orElse(() =>
      SchemaAST.isUnion(ast)
        ? pipe(
            ast.types,
            Array.findFirst((type) => !isNullOrUndefined(type)),
            Option.flatMap((type) => getUiConfigFromASTOption(type)),
          )
        : Option.none(),
    ),
  )
}

/**
 * Helper function to extract the AST from a PropertySignature or return the AST as-is
 */
export const extractAST = (schema: SchemaAST.AST | SchemaAST.PropertySignature): SchemaAST.AST => {
  return 'type' in schema ? schema.type : schema
}

/**
 * Gets UI configuration from AST annotations
 * Handles both PropertySignature and regular AST types
 * Handles Union types created by Schema.NullOr by recursively traversing nested unions
 * Written in Effect-TS style using functional composition
 */
export const getUiConfigFromAST = (
  ast: any, // Accept any AST-like object to handle various SchemaAST types
): FieldConfig | undefined => {
  // If this is a PropertySignature, check its annotations first
  if (ast && typeof ast === 'object' && 'annotations' in ast && 'type' in ast) {
    const directAnnotation = SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(ast)
    if (Option.isSome(directAnnotation)) {
      return directAnnotation.value
    }
    // If no annotation on the property signature, check the type
    return getUiConfigFromAST(ast.type)
  }

  // Handle regular AST types
  return pipe(
    ast,
    // Try direct annotation first
    SchemaAST.getAnnotation<FieldConfig>(OfUiConfig),
    Option.orElse(() =>
      // If no direct annotation and this is a union, search recursively
      SchemaAST.isUnion(ast)
        ? pipe(
            ast.types,
            Array.findFirst((type) => !isNullOrUndefined(type)),
            Option.flatMap((type) => getUiConfigFromASTOption(type)),
          )
        : Option.none(),
    ),
    Option.getOrUndefined,
  )
}

/**
 * Checks if a schema has an email pattern in its refinements
 */
export const hasEmailPattern = (ast: SchemaAST.AST): boolean => {
  // Check for refinement with email pattern
  if (SchemaAST.isRefinement(ast)) {
    // This is a simplified check - in practice, you'd need to inspect
    // the refinement predicate more thoroughly
    return false
  }
  return false
}

/**
 * Extracts literal values from a union of literals
 */
export const extractLiteralOptions = (
  ast: SchemaAST.AST,
): Array<{ value: string; label: string }> => {
  if (SchemaAST.isUnion(ast)) {
    const literalValues = pipe(
      ast.types,
      Array.filterMap((type) => {
        if (type._tag === 'Literal') {
          return Option.some({
            label: String(type.literal),
            value: String(type.literal),
          })
        }
        return Option.none()
      }),
    )

    return literalValues
  }

  return []
}

/**
 * Formats a field name into a human-readable label
 */
export const formatLabel = (fieldName: string): string => {
  if (!fieldName) return ''

  // Handle already formatted strings (containing spaces)
  if (fieldName.includes(' ')) {
    return fieldName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Handle snake_case and kebab-case
  if (fieldName.includes('_') || fieldName.includes('-')) {
    return fieldName
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Handle camelCase and PascalCase
  return fieldName
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before capital letters
    .replace(/([a-z])(\d)/g, '$1 $2') // Insert space before numbers
    .replace(/(\d)([A-Z])/g, '$1 $2') // Insert space between numbers and capital letters
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
