import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { Array, Option, pipe, type Schema, SchemaAST } from 'effect'

export interface ExtractedField {
  key: string
  schema: SchemaAST.AST
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

/**
 * Gets UI configuration from AST annotations
 */
export const getUiConfigFromAST = (ast: SchemaAST.AST): FieldConfig | undefined => {
  return pipe(SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(ast), Option.getOrUndefined)
}

/**
 * Checks if a schema has an email pattern in its refinements
 */
export const hasEmailPattern = (ast: SchemaAST.AST): boolean => {
  // Check for refinement with email pattern
  if (SchemaAST.isRefinement(ast)) {
    // This is a simplified check - in practice, you'd need to inspect
    // the refinement predicate more thoroughly
    return (
      ast.filter.toString().includes('email') ||
      ast.filter.toString().includes('@') ||
      ast.filter.toString().includes('\\S+@\\S+\\.\\S+')
    )
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
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim()
}
