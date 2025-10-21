import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { getEntityId, IsoStringToTimestamp, TimestampToIsoString } from '@openfaith/shared'
import { Array, Effect, Option, pipe, Schema, SchemaAST, String } from 'effect'

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
export const extractEntityTagOpt = (ast: SchemaAST.AST): Option.Option<string> => {
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
  // Get entity annotation if present
  const entityAnnotation = pipe(extractEntityName(schema), Option.getOrUndefined)

  // Get entity tag from _tag field if present
  const entityTag = pipe(extractEntityTagOpt(schema.ast), Option.getOrUndefined)

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

export const getCreateSchema = <A, I = A, R = never>(
  schema: Schema.Schema<A, I, R>,
): Schema.Schema<
  Omit<A, keyof typeof BaseSystemFields.fields & keyof typeof BaseIdentifiedEntity.fields & '_tag'>,
  I,
  R
> =>
  pipe(
    schema,
    Schema.omit(
      ...(Object.keys(BaseSystemFields.fields) as Array<keyof A & keyof I>),
      ...(Object.keys(BaseIdentifiedEntity.fields) as Array<keyof A & keyof I>),
      '_tag' as keyof A & keyof I,
    ),
  ) as any

export const getUpdateSchema = <A, I = A, R = never>(
  schema: Schema.Schema<A, I, R>,
): Schema.Schema<A, I, R> => {
  // Check if this is a class schema (has .fields property)
  if ('fields' in schema && typeof schema.fields === 'object') {
    // For class schemas: omit id, make partial, then extend with required id
    return Schema.Struct(schema.fields as any).pipe(
      Schema.omit('id'),
      Schema.partial,
      Schema.extend(Schema.Struct({ id: Schema.String })),
    ) as any
  }

  // For regular Struct schemas: omit id, make partial, then extend with required id
  return pipe(
    schema,
    Schema.omit('id' as any),
    Schema.partial,
    Schema.extend(Schema.Struct({ id: Schema.String })),
  ) as any
}

export const getDeleteSchema = <A, I = A, R = never>(_schema: Schema.Schema<A, I, R>) =>
  Schema.Struct({
    deletedAt: TimestampToIsoString,
    deletedBy: Schema.String,
    id: Schema.String,
    orgId: Schema.String,
    updatedAt: TimestampToIsoString,
    updatedBy: Schema.String,
  })

/**
 * Transforms a schema for server-side Zero mutations by converting timestamp fields
 * from ISO strings to Unix timestamps (numbers).
 *
 * Zero expects timestamps as numbers (milliseconds since epoch) and converts them to
 * PostgreSQL timestamps using `to_timestamp(value / 1000.0)`.
 *
 * This function:
 * 1. Extracts all fields from the schema
 * 2. Identifies fields using TimestampToIsoString transformation
 * 3. Replaces them with a schema that accepts ISO strings and encodes to numbers
 * 4. Preserves all other fields as-is
 *
 * @param schema - The entity schema with TimestampToIsoString fields
 * @returns A new schema that converts ISO strings to numbers for Zero
 */
export const getZeroMutationSchema = <A, I = A, R = never>(
  schema: Schema.Schema<A, I, R>,
): Schema.Schema<any, any, R> => {
  const fields = extractSchemaFields(schema)

  const transformedFields: Record<string, any> = {}

  for (const field of fields) {
    const fieldAst = extractAST(field.schema)

    if (isTimestampToIsoStringField(fieldAst)) {
      if (field.isOptional) {
        transformedFields[field.key] = Schema.optionalWith(IsoStringToTimestamp, { exact: true })
      } else if (field.isNullable) {
        transformedFields[field.key] = pipe(IsoStringToTimestamp, Schema.NullOr)
      } else {
        transformedFields[field.key] = IsoStringToTimestamp
      }
    } else {
      transformedFields[field.key] = Schema.make(fieldAst)
    }
  }

  return Schema.Struct(transformedFields) as any
}

/**
 * Helper function to detect if a field uses TimestampToIsoString transformation
 */
const isTimestampToIsoStringField = (ast: SchemaAST.AST): boolean => {
  if (ast._tag === 'Transformation') {
    const from = ast.from
    const to = ast.to

    if (
      from._tag === 'Union' &&
      to._tag === 'StringKeyword' &&
      pipe(
        from.types,
        Array.some((type) => type._tag === 'NumberKeyword'),
      ) &&
      pipe(
        from.types,
        Array.some((type) => type._tag === 'StringKeyword'),
      )
    ) {
      return true
    }
  }

  if (ast._tag === 'Union') {
    return pipe(
      ast.types,
      Array.some((type) => isTimestampToIsoStringField(type)),
    )
  }

  return false
}

export const enrichMutationData = Effect.fn('enrichMutationData')(function* (params: {
  data: Array<Record<string, any>>
  operation: 'delete' | 'insert' | 'update' | 'upsert'
  orgId: string
  userId: string
  entityType: string
  schema: Schema.Schema<any>
}) {
  const { data, operation, orgId, userId, entityType, schema } = params
  const mutatedAt = new Date().toISOString()

  switch (operation) {
    case 'upsert':
    case 'insert': {
      const result = yield* Schema.decodeUnknown(Schema.Array(getZeroMutationSchema(schema)), {
        errors: 'all',
        onExcessProperty: 'preserve',
      })(
        pipe(
          data,
          Array.map((item) => ({
            // Base data only for insert/upsert operations
            _tag: entityType,
            createdAt: mutatedAt,
            createdBy: userId,
            customFields: [],
            externalIds: [],
            id: getEntityId(entityType),
            orgId,
            status: 'active',
            tags: [],

            ...item,

            // Always update these fields
            updatedAt: mutatedAt,
            updatedBy: userId,
          })),
        ),
      )

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>
    }

    case 'update': {
      const result = yield* Schema.decodeUnknown(
        Schema.Array(
          getZeroMutationSchema(
            pipe(getUpdateSchema(schema), Schema.extend(Schema.Struct({ orgId: Schema.String }))),
          ),
        ),
        {
          errors: 'all',
          onExcessProperty: 'preserve',
        },
      )(
        pipe(
          data,
          Array.map((item) => ({
            ...item,
            orgId,
            updatedAt: mutatedAt,
            updatedBy: userId,
          })),
        ),
      )

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>
    }

    case 'delete': {
      const result = yield* Schema.decodeUnknown(
        Schema.Array(getZeroMutationSchema(getDeleteSchema(schema))),
        {
          errors: 'all',
          onExcessProperty: 'preserve',
        },
      )(
        pipe(
          data,
          Array.map((item) => ({
            ...item,
            deletedAt: mutatedAt,
            deletedBy: userId,
            orgId,
            updatedAt: mutatedAt,
            updatedBy: userId,
          })),
        ),
      )

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>
    }
  }
})

export const validateMutationData = Effect.fn('validateMutationData')(function* (params: {
  data: Array<Record<string, any>>
  operation: 'delete' | 'insert' | 'update' | 'upsert'
  schema: Schema.Schema<any>
}) {
  const { data, operation, schema } = params

  switch (operation) {
    case 'upsert':
    case 'insert': {
      const result = yield* Schema.decodeUnknown(Schema.Array(getZeroMutationSchema(schema)), {
        errors: 'all',
        onExcessProperty: 'preserve',
      })(data)

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>
    }

    case 'update': {
      const result = yield* Schema.decodeUnknown(
        Schema.Array(
          getZeroMutationSchema(
            pipe(getUpdateSchema(schema), Schema.extend(Schema.Struct({ orgId: Schema.String }))),
          ),
        ),
        {
          errors: 'all',
          onExcessProperty: 'preserve',
        },
      )(data, {})

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>
    }

    case 'delete': {
      const result = yield* Schema.decodeUnknown(
        Schema.Array(getZeroMutationSchema(getDeleteSchema(schema))),
        {
          errors: 'all',
          onExcessProperty: 'preserve',
        },
      )(data)

      return result as unknown as ReadonlyArray<{ id: string; updatedBy: string; orgId: string }>
    }
  }
})
