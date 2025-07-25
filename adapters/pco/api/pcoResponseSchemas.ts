import { Array, Option, pipe, Schema } from 'effect'

/**
 * Creates a PCO collection response schema.
 *
 * A GET request for a collection (e.g., `/people/v2/people`) returns a
 * comprehensive object with pagination and metadata following JSON:API spec.
 */
export function mkPcoCollectionSchema<A, B>(
  resourceSchema: Schema.Schema<A>,
  entityRegistry?: Schema.Schema<B>,
) {
  return Schema.Struct({
    /** The 'data' key contains the array of primary resource objects. */
    data: Schema.Array(resourceSchema),

    /** The 'included' key contains side-loaded related resources. */
    ...pipe(
      entityRegistry,
      Option.fromNullable,
      Option.match({
        onNone: () => ({
          included: Schema.Array(Schema.Void),
        }),
        onSome: (x) => ({
          included: Schema.Array(x),
        }),
      }),
    ),

    /** The 'links' object contains pagination links. */
    links: Schema.Struct({
      next: Schema.optional(Schema.String),
      self: Schema.String,
    }),

    /** The 'meta' object contains counts and other metadata. */
    meta: Schema.Struct({
      can_include: Schema.optional(Schema.Array(Schema.String)),
      can_order_by: Schema.optional(Schema.Array(Schema.String)),
      can_query_by: Schema.optional(Schema.Array(Schema.String)),
      count: Schema.Number,
      next: Schema.optional(Schema.Struct({ offset: Schema.Number })),
      parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
      prev: Schema.optional(Schema.Struct({ offset: Schema.Number })),
      total_count: Schema.Number,
    }),
  })
}
/**
 * Creates a PCO single resource response schema.
 *
 * A GET request for a single item (e.g., `/people/v2/people/123`) returns an
 * object following JSON:API spec with data and included sections.
 */
export function mkPcoSingleSchema<A>(resourceSchema: Schema.Schema<A>): Schema.Struct<{
  data: Schema.Schema<A, A, never>
}>
export function mkPcoSingleSchema<A, B>(
  resourceSchema: Schema.Schema<A>,
  entityRegistry: Schema.Schema<B>,
): Schema.Struct<{
  included: Schema.Array$<Schema.Schema<B, B, never>>
  data: Schema.Schema<A, A, never>
}>
export function mkPcoSingleSchema(
  resourceSchema: Schema.Schema<any>,
  entityRegistry?: Schema.Schema<any>,
) {
  return Schema.Struct({
    data: resourceSchema,
    ...pipe(
      entityRegistry,
      Option.fromNullable,
      Option.match({
        onNone: () => ({}),
        onSome: (x) => ({
          included: Schema.Array(x),
        }),
      }),
    ),
  }) as any
}

type AttributesStruct<Fields extends Record<string, any>> = Schema.Struct<{
  [K in keyof Pick<Fields, keyof Fields>]: Pick<Fields, keyof Fields>[K]
}>

type AttributesWithSpecialStruct<
  Fields extends Record<string, any>,
  Special extends ReadonlyArray<string>,
> = Schema.Struct<
  {
    [K in keyof Pick<Fields, keyof Fields>]: Pick<Fields, keyof Fields>[K]
  } & {
    [key in Special[0]]: typeof Schema.String
  }
>

/**
 * Creates a PCO payload schema for POST/PATCH requests.
 *
 * PCO expects JSON:API format for requests:
 * - POST: { data: { type: "EntityName", attributes: {...} } }
 * - PATCH: { data: { type: "EntityName", id: "123", attributes: {...} } }
 */

// Overload 1: No special fields - returns clean, well-typed schema
export function mkPcoPayloadSchema<
  Fields extends Record<string, any>,
  EntityType extends string,
  MarkOptional extends boolean = false,
>(params: {
  attributesSchema: Schema.Struct<Fields>
  fields: ReadonlyArray<keyof Fields>
  entityType: EntityType
  makeOptional?: MarkOptional
}): Schema.Struct<{
  data: Schema.Struct<{
    attributes: MarkOptional extends true
      ? Schema.SchemaClass<
          Schema.Schema.Type<AttributesStruct<Fields>>,
          Schema.Schema.Encoded<AttributesStruct<Fields>>,
          Schema.Schema.Context<AttributesStruct<Fields>>
        >
      : AttributesStruct<Fields>
    id: typeof Schema.String
    type: Schema.Literal<[EntityType]>
  }>
}>

// Overload 2: With special fields - returns schema with special fields as optional strings
export function mkPcoPayloadSchema<
  Fields extends Record<string, any>,
  Special extends ReadonlyArray<string>,
  EntityType extends string,
  MarkOptional extends boolean = false,
>(params: {
  attributesSchema: Schema.Struct<Fields>
  fields: ReadonlyArray<keyof Fields>
  entityType: EntityType
  special: Special
  makeOptional?: MarkOptional
}): Schema.Struct<{
  data: Schema.Struct<{
    attributes: MarkOptional extends true
      ? Schema.SchemaClass<
          Schema.Schema.Type<AttributesWithSpecialStruct<Fields, Special>>,
          Schema.Schema.Encoded<AttributesWithSpecialStruct<Fields, Special>>,
          Schema.Schema.Context<AttributesWithSpecialStruct<Fields, Special>>
        >
      : AttributesWithSpecialStruct<Fields, Special>
    id: typeof Schema.String
    type: Schema.Literal<[EntityType]>
  }>
}>

// Implementation function
export function mkPcoPayloadSchema<
  Fields extends Record<string, any>,
  Special extends ReadonlyArray<string>,
  EntityType extends string,
  MarkOptional extends boolean = false,
>(params: {
  attributesSchema: Schema.Struct<Fields>
  fields: ReadonlyArray<keyof Fields>
  entityType: EntityType
  special?: Special
  makeOptional?: MarkOptional
}): any {
  const { attributesSchema, fields, entityType, special = [], makeOptional } = params

  // If no special fields, use the original approach for better type compatibility
  if (special.length === 0) {
    const pickedSchema = attributesSchema.pick(...fields)
    const finalAttributesSchema = makeOptional ? Schema.partial(pickedSchema) : pickedSchema

    return Schema.Struct({
      data: Schema.Struct({
        attributes: finalAttributesSchema,
        id: Schema.String,
        type: Schema.Literal(entityType),
      }),
    })
  }

  // When we have special fields, create the combined schema
  const pickedSchema = attributesSchema.pick(...fields)
  const pickedFields = pickedSchema.fields
  const specialFields = pipe(
    special as ReadonlyArray<string>,
    Array.reduce(
      {} as { [key in Special[0]]: Schema.optional<typeof Schema.String> },
      (acc, fieldName) => {
        return {
          ...acc,
          [fieldName]: Schema.optional(Schema.String),
        }
      },
    ),
  )

  const combinedFields = { ...pickedFields, ...specialFields }
  const combinedSchema = Schema.Struct(combinedFields)
  const finalAttributesSchema = makeOptional ? Schema.partial(combinedSchema) : combinedSchema

  return Schema.Struct({
    data: Schema.Struct({
      attributes: finalAttributesSchema,
      id: Schema.String,
      type: Schema.Literal(entityType),
    }),
  })
}
/**
 * PCO-specific type helper that mirrors mkPcoPayloadSchema function.
 * Takes the Fields type (which represents the attributes structure) and picks specified fields,
 * then wraps them in PCO's JSON:API payload structure with data.attributes.
 *
 * This is similar to BuildPayloadSchemaType from adapter-core but specifically for PCO's
 * JSON:API format with the data wrapper and type/id fields.
 */
export type PcoBuildPayloadSchemaType<
  Fields extends Record<string, any>,
  Keys extends ReadonlyArray<string>,
  Special extends ReadonlyArray<string> = [],
  EntityType extends string = string,
  MarkOptional extends boolean = false,
> = {
  data: {
    attributes: MarkOptional extends true
      ? Partial<
          Pick<Fields, Keys[number] & keyof Fields> & {
            [K in Special[number]]: string
          }
        >
      : Pick<Fields, Keys[number] & keyof Fields> & {
          [K in Special[number]]?: string
        }
    id: string
    type: EntityType
  }
}

export type PcoBaseEntity = {
  id: string
  type: string
  attributes: {
    created_at: string
    updated_at?: string | null | undefined
  }

  relationships?: Record<string, { data: { id: string; type: string } | null }> | undefined
}
