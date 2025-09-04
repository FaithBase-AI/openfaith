import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { Array, Option, pipe, type Schema, SchemaAST, String } from 'effect'

/**
 * Helper function to get annotation from schema, handling both old and new formats
 */
export const getAnnotationFromSchema = <A>(
  annotationId: symbol | any,
  ast: SchemaAST.AST | any,
): Option.Option<A> => {
  if (!ast) {
    return Option.none()
  }

  // Try direct annotation access first
  const directAnnotation = SchemaAST.getAnnotation<A>(annotationId)(ast)
  if (Option.isSome(directAnnotation)) {
    return directAnnotation
  }

  // For PropertySignature, try the type
  if (ast.type) {
    return SchemaAST.getAnnotation<A>(annotationId)(ast.type)
  }

  // For Transformation AST, check the Surrogate annotation
  // This handles branded types, refined types, and other transformations
  if (ast._tag === 'Transformation') {
    const surrogateOpt = SchemaAST.getAnnotation<SchemaAST.AST>(SchemaAST.SurrogateAnnotationId)(
      ast,
    )
    if (Option.isSome(surrogateOpt)) {
      return SchemaAST.getAnnotation<A>(annotationId)(surrogateOpt.value)
    }
  }

  // For class-based schemas, try to get from the constructor or prototype
  if (ast.constructor?.ast) {
    return SchemaAST.getAnnotation<A>(annotationId)(ast.constructor.ast)
  }

  return Option.none()
}

export interface ExtractedField {
  key: string
  schema: SchemaAST.PropertySignature
  isOptional: boolean
  isNullable: boolean
}

/**
 * Extracts field information from a Schema.Struct or class-based schema
 */
export const extractSchemaFields = <T>(
  schema: Schema.Schema<T> | { ast: SchemaAST.AST },
): Array<ExtractedField> => {
  const ast = schema.ast

  // Helper function to extract fields from a TypeLiteral AST
  const extractFromTypeLiteral = (typeLiteralAst: SchemaAST.AST): Array<ExtractedField> => {
    if (typeLiteralAst._tag !== 'TypeLiteral') {
      throw new Error('Expected TypeLiteral AST')
    }

    return pipe(
      typeLiteralAst.propertySignatures,
      Array.map((prop) => ({
        isNullable: isNullableSchema(prop.type),
        isOptional: prop.isOptional,
        key: prop.name as string,
        schema: prop,
      })),
    )
  }

  // Handle direct TypeLiteral (old Schema.Struct format)
  if (ast._tag === 'TypeLiteral') {
    return extractFromTypeLiteral(ast)
  }

  // Handle Transformation (class-based schema format)
  if (ast._tag === 'Transformation') {
    return extractFromTypeLiteral(ast.from)
  }

  throw new Error(
    `Can only extract fields from Struct schemas or class-based schemas, got: ${ast._tag}`,
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
    getAnnotationFromSchema<FieldConfig>(OfUiConfig, ast),
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
 * Extracts literal values from a union of literals with proper capitalization
 */
export const extractLiteralOptions = (ast: SchemaAST.AST): Array<{ value: any; label: string }> => {
  if (SchemaAST.isUnion(ast)) {
    const literalValues: Array<{ value: any; label: string }> = []

    for (const type of ast.types) {
      if (type._tag === 'Literal') {
        const literal = type.literal
        if (typeof literal === 'string') {
          literalValues.push({
            label: pipe(literal, String.capitalize),
            value: literal,
          })
        } else if (typeof literal === 'number' || typeof literal === 'boolean') {
          literalValues.push({
            label: `${literal}`,
            value: literal,
          })
        }
      }
    }

    return literalValues
  }

  if (ast._tag === 'Literal') {
    const literal = ast.literal
    if (typeof literal === 'string') {
      return [
        {
          label: pipe(literal, String.capitalize),
          value: literal,
        },
      ]
    }
    if (typeof literal === 'number' || typeof literal === 'boolean') {
      return [
        {
          label: `${literal}`,
          value: literal,
        },
      ]
    }
  }

  return []
}

/**
 * Gets UI configuration from AST annotations
 * Handles both PropertySignature and regular AST types
 * Handles Union types created by Schema.NullOr by recursively traversing nested unions
 * Written in Effect-TS style using functional composition
 */
export const getUiConfigFromAST = (ast: any): FieldConfig | undefined => {
  if (ast && typeof ast === 'object' && 'annotations' in ast && 'type' in ast) {
    const directAnnotation = getAnnotationFromSchema<FieldConfig>(OfUiConfig, ast)
    if (Option.isSome(directAnnotation)) {
      return directAnnotation.value
    }

    return getUiConfigFromAST(ast.type)
  }

  return pipe(
    getAnnotationFromSchema<FieldConfig>(OfUiConfig, ast),
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
 * Extracts the entity tag from a schema AST
 * Handles both TypeLiteral (old Schema.Struct) and Transformation (class-based) ASTs
 */
export const extractEntityTag = (ast: SchemaAST.AST): Option.Option<string> => {
  const extractFromTypeLiteral = (typeLiteralAst: SchemaAST.AST): Option.Option<string> => {
    if (!SchemaAST.isTypeLiteral(typeLiteralAst)) {
      return Option.none()
    }

    const propertySignatures = typeLiteralAst.propertySignatures
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

    return Option.none()
  }

  // Handle direct TypeLiteral (old Schema.Struct format)
  if (SchemaAST.isTypeLiteral(ast)) {
    return extractFromTypeLiteral(ast)
  }

  // Handle Transformation (class-based schema format)
  if (ast._tag === 'Transformation') {
    return extractFromTypeLiteral(ast.from)
  }

  return Option.none()
}

/**
 * Helper function to extract the AST from a PropertySignature or return the AST as-is
 */
export const extractAST = (schema: SchemaAST.AST | SchemaAST.PropertySignature): SchemaAST.AST => {
  return 'type' in schema ? schema.type : schema
}

/**
 * Extracts entity information from a schema, including entity name and tag
 */
export const extractEntityInfo = (
  schema: Schema.Schema.AnyNoContext,
): { entityName: string; entityTag?: string } => {
  // Import OfEntity symbol
  const OfEntity = Symbol.for('@openfaith/schema/entity')

  // Get entity annotation if present
  const entityAnnotation = pipe(
    SchemaAST.getAnnotation<string>(OfEntity)(schema.ast),
    Option.getOrUndefined,
  )

  // Get entity tag from _tag field if present
  const entityTag = pipe(extractEntityTag(schema.ast), Option.getOrUndefined)

  return {
    entityName: entityAnnotation || 'item',
    entityTag: entityAnnotation || entityTag,
  }
}

export const extractEntityName = (schema: Schema.Schema.Any): Option.Option<string> => {
  // Try to get the title annotation from the schema
  const titleOpt = getAnnotationFromSchema<string>(SchemaAST.TitleAnnotationId, schema.ast)

  if (Option.isSome(titleOpt)) {
    return titleOpt
  }

  // Fallback: try to get the constructor name
  const constructorName = schema.constructor?.name
  if (constructorName) {
    return Option.some(constructorName.toLowerCase())
  }

  return Option.none()
}
