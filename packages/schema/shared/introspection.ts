import { type FieldConfig, OfEntity, OfUiConfig } from '@openfaith/schema/shared/schema'
import { Array, Option, pipe, type Schema, SchemaAST, String } from 'effect'

export interface ExtractedField {
  key: string
  schema: SchemaAST.PropertySignature
  isOptional: boolean
  isNullable: boolean
}

/**
 * Extracts field information from a Schema.Struct
 */
export const extractSchemaFields = <T>(
  schema: Schema.Schema<T> | { ast: SchemaAST.AST },
): Array<ExtractedField> => {
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
 * Checks if a schema allows null values using Effect-TS patterns
 */
const isNullableSchema = (ast: SchemaAST.AST): boolean => {
  if (SchemaAST.isUnion(ast)) {
    return pipe(
      ast.types,
      Array.some((t) => t._tag === 'Literal' && t.literal === null),
    )
  }
  return false
}

/**
 * Gets UI configuration from schema annotations
 */
export const getUiConfig = (schema: Schema.Schema.AnyNoContext): FieldConfig | undefined => {
  return pipe(SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(schema.ast), Option.getOrUndefined)
}

const isNullOrUndefined = (ast: SchemaAST.AST): boolean =>
  (ast._tag === 'Literal' && ast.literal === null) || ast._tag === 'UndefinedKeyword'

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
export const getUiConfigFromAST = (ast: any): FieldConfig | undefined => {
  if (ast && typeof ast === 'object' && 'annotations' in ast && 'type' in ast) {
    const directAnnotation = SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(ast)
    if (Option.isSome(directAnnotation)) {
      return directAnnotation.value
    }

    return getUiConfigFromAST(ast.type)
  }

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
    Option.getOrUndefined,
  )
}

/**
 * Checks if a schema has an email pattern in its refinements
 */
export const hasEmailPattern = (ast: SchemaAST.AST): boolean => {
  if (SchemaAST.isRefinement(ast)) {
    return false
  }
  return false
}

/**
 * Extracts literal values from a union of literals with proper capitalization
 */
export const extractLiteralOptions = (
  ast: SchemaAST.AST,
): Array<{ value: string; label: string }> => {
  if (SchemaAST.isUnion(ast)) {
    const literalValues = pipe(
      ast.types,
      Array.filterMap((type) => {
        if (type._tag === 'Literal' && typeof type.literal === 'string') {
          return Option.some({
            label: pipe(type.literal, String.capitalize),
            value: type.literal,
          })
        }
        return Option.none()
      }),
    )

    return literalValues
  }

  if (ast._tag === 'Literal' && typeof ast.literal === 'string') {
    return [
      {
        label: pipe(ast.literal, String.capitalize),
        value: ast.literal,
      },
    ]
  }

  return []
}

/**
 * Extracts the entity tag from a schema AST
 */
export const extractEntityTag = (ast: SchemaAST.AST): Option.Option<string> => {
  if (SchemaAST.isTypeLiteral(ast)) {
    const propertySignatures = ast.propertySignatures
    const tagProperty = pipe(
      propertySignatures,
      Array.findFirst((prop) => prop.name === '_tag'),
    )

    if (Option.isSome(tagProperty)) {
      const tagAST = tagProperty.value.type
      if (SchemaAST.isLiteral(tagAST) && typeof tagAST.literal === 'string') {
        return Option.some(tagAST.literal)
      }
    }
  }

  return Option.none()
}

/**
 * Extracts entity information from a schema including entity name and tag
 */
export const extractEntityInfo = <T>(schema: Schema.Schema<T>) => {
  const ast = schema.ast

  // First try to get entity name from OfEntity annotation
  const entityAnnotation = SchemaAST.getAnnotation<string>(OfEntity)(ast)

  // If no OfEntity annotation, try to extract from _tag field
  const tagFromField = extractEntityTag(ast)

  const entityName = pipe(
    entityAnnotation,
    Option.orElse(() => tagFromField),
    Option.match({
      onNone: () => 'item',
      onSome: (entity) => entity,
    }),
  )

  const entityTag = pipe(
    entityAnnotation,
    Option.orElse(() => tagFromField),
    Option.getOrUndefined,
  )

  return {
    entityName,
    entityTag,
  }
}
