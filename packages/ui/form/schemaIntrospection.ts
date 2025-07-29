import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { Array, Option, pipe, type Schema, SchemaAST } from 'effect'

export interface ExtractedField {
  key: string
  schema: SchemaAST.AST
  isOptional: boolean
  isNullable: boolean
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
export const extractSchemaFields = <T>(schema: Schema.Schema<T>): Array<ExtractedField> => {
  const ast = schema.ast

  if (ast._tag !== 'TypeLiteral') {
    throw new Error('Can only extract fields from Struct schemas')
  }

  return ast.propertySignatures.map((prop) => ({
    isNullable: isNullableSchema(prop.type),
    isOptional: prop.isOptional,
    key: prop.name as string,
    schema: prop.type,
  }))
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
            Array.findFirst(
              (type) => !isNullOrUndefined(type) && Option.isSome(getUiConfigFromASTOption(type)),
            ),
            Option.flatMap(getUiConfigFromASTOption),
          )
        : Option.none(),
    ),
  )
}

/**
 * Gets UI configuration from AST annotations
 * Handles Union types created by Schema.NullOr by recursively traversing nested unions
 * Written in Effect-TS style using functional composition
 */
export const getUiConfigFromAST = (ast: SchemaAST.AST): FieldConfig | undefined => {
  return pipe(
    ast,
    // Try direct annotation first
    SchemaAST.getAnnotation<FieldConfig>(OfUiConfig),
    Option.orElse(() =>
      // If no direct annotation and this is a union, search recursively
      SchemaAST.isUnion(ast)
        ? pipe(
            ast.types,
            Array.findFirst(
              (type) =>
                // Skip null and undefined types, recursively search others
                !isNullOrUndefined(type) && Option.isSome(getUiConfigFromASTOption(type)),
            ),
            Option.flatMap(getUiConfigFromASTOption),
          )
        : Option.none(),
    ),
    Option.getOrUndefined,
  )
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
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim()
}
