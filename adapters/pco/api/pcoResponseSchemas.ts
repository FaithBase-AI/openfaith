import { Option, pipe, Schema } from 'effect'

/**
 * Creates a PCO collection response schema.
 *
 * A GET request for a collection (e.g., `/people/v2/people`) returns a
 * comprehensive object with pagination and metadata following JSON:API spec.
 */
// export function mkPcoCollectionSchema<A>(resourceSchema: Schema.Schema<A>): Schema.Struct<{
//   data: Schema.Array$<Schema.Schema<A, A, never>>
//   links: Schema.Struct<{
//     next: Schema.optional<typeof Schema.String>
//     self: typeof Schema.String
//   }>
//   included: Schema.Array$<typeof Schema.Void>
//   meta: Schema.Struct<{
//     can_include: Schema.optional<Schema.Array$<typeof Schema.String>>
//     can_order_by: Schema.optional<Schema.Array$<typeof Schema.String>>
//     can_query_by: Schema.optional<Schema.Array$<typeof Schema.String>>
//     count: typeof Schema.Number
//     next: Schema.optional<Schema.Struct<{ offset: typeof Schema.Number }>>
//     parent: Schema.optional<Schema.Struct<{ id: typeof Schema.String; type: typeof Schema.String }>>
//     prev: Schema.optional<Schema.Struct<{ offset: typeof Schema.Number }>>
//     total_count: typeof Schema.Number
//   }>
// }>
// export function mkPcoCollectionSchema<A, B>(
//   resourceSchema: Schema.Schema<A>,
//   entityRegistry: Schema.Schema<B>,
// ): Schema.Struct<{
//   data: Schema.Array$<Schema.Schema<A, A, never>>
//   included: Schema.Array$<Schema.Schema<B, B, never>>
//   links: Schema.Struct<{
//     next: Schema.optional<typeof Schema.String>
//     self: typeof Schema.String
//   }>
//   meta: Schema.Struct<{
//     can_include: Schema.optional<Schema.Array$<typeof Schema.String>>
//     can_order_by: Schema.optional<Schema.Array$<typeof Schema.String>>
//     can_query_by: Schema.optional<Schema.Array$<typeof Schema.String>>
//     count: typeof Schema.Number
//     next: Schema.optional<Schema.Struct<{ offset: typeof Schema.Number }>>
//     parent: Schema.optional<Schema.Struct<{ id: typeof Schema.String; type: typeof Schema.String }>>
//     prev: Schema.optional<Schema.Struct<{ offset: typeof Schema.Number }>>
//     total_count: typeof Schema.Number
//   }>
// }>
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

export type PcoBaseEntity = {
  id: string
  type: string
  attributes: {
    created_at: string
    updated_at?: string | null | undefined
  }

  relationships?: Record<string, { data: { id: string; type: string } | null }> | undefined
}
