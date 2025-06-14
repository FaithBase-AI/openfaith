import {
  getPcoIncludes,
  type PcoEntities,
  type PcoEntityName,
} from '@openfaith/pco/pcoEntityManifest'
import { Schema } from 'effect'

/**
 * A `ResponseAdapter` tailored for the Planning Center Online (PCO) API.
 *
 * This implementation understands the JSON:API specification that PCO follows,
 * where single resources are nested under a `data` key, and collection
 * responses include `data`, `included`, `links`, and `meta` top-level keys.
 */
export const pcoResponseAdapter = {
  /**
   * Adapts the schema for a PCO collection response.
   *
   * A GET request for a collection (e.g., `/people/v2/people`) returns a
   * comprehensive object with pagination and metadata. This method wraps the
   * resource schema to match this full JSON:API collection structure.
   *
   * @param resourceSchema The schema for an individual resource in the collection.
   * @returns A new schema representing the complete collection response envelope.
   */
  adaptCollection: <A, I, R, Includes extends ReadonlyArray<string>>(
    resourceSchema: Schema.Schema<A, I, R>,
    includes: Includes,
  ) => {
    const entityIncludes = getPcoIncludes(includes)

    return Schema.Struct({
      /** The 'data' key contains the array of primary resource objects. */
      data: Schema.Array(resourceSchema),

      /** The 'included' key contains side-loaded related resources. */
      included: Schema.Array(Schema.Union(...getPcoIncludes(includes))) as Schema.Array$<
        Schema.Union<[(typeof entityIncludes)[number]]>
      >,

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
        parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
        total_count: Schema.Number,
      }),
    })
  },
  /**
   * Adapts the schema for a single PCO resource response.
   *
   * A GET request for a single item (e.g., `/people/v2/people/123`) returns an
   * object like: `{ "data": { ... PCOPerson ... }, "included": [...] }`.
   * This method wraps the provided resource schema to match this envelope.
   *
   * @param resourceSchema The schema for the core resource (e.g., PCOPerson).
   * @returns A new schema representing the `{ data: ..., included: [...] }` structure.
   */
  adaptSingle: <A, I, R, Includes extends ReadonlyArray<string>>(
    resourceSchema: Schema.Schema<A, I, R>,
    includes: Includes,
  ) => {
    const entityIncludes = getPcoIncludes(includes)

    return Schema.Struct({
      data: resourceSchema,
      included: Schema.Array(Schema.Union(...entityIncludes)) as Schema.Array$<
        Schema.Union<[(typeof entityIncludes)[number]]>
      >,
    })
  },
}

type BaseResponseSchema = Schema.Struct<{
  included: Schema.Array$<Schema.Union<Array<(typeof PcoEntities)[number]>>>
  [key: string]: Schema.Schema.Any
}>

// Use the runtime-based extraction that actually works
type ExtractLiteralFromSchema<T> = T extends {
  fields: {
    type: {
      literals: readonly [infer U, ...Array<any>]
    }
  }
}
  ? U
  : never

type MemberKeys = ExtractLiteralFromSchema<
  BaseResponseSchema['fields']['included']['value']['members'][number]
>
// This should now be "Person" | "Address" | "Email"

// Create the mapped type
type ExtractedMembers = {
  [K in MemberKeys]: Extract<
    BaseResponseSchema['fields']['included']['value']['members'][number],
    { fields: { type: { literals: readonly [K, ...Array<any>] } } }
  >
}

// Runtime helper
function extractMembersFromUnion(
  unionMembers: BaseResponseSchema['fields']['included']['value']['members'],
): ExtractedMembers {
  const result = {} as any

  unionMembers.forEach((member) => {
    const typeValue = member.fields.type.literals[0] as MemberKeys
    result[typeValue] = member
  })

  return result
}

/**
 * A factory that creates a PCO-specific `reconcile` function for use with
 * `HttpApiSchema.dynamic`.
 *
 * This resolver understands the JSON:API `include` parameter and filters the
 * `included` array in the response schema to match what was requested.
 *
 * @param resourceMap A map where keys are the valid strings for the `include`
 *   parameter (e.g., "emails", "addresses") and values are their corresponding
 *   Effect Schemas.
 * @returns A `reconcile` function that can be passed to `HttpApiSchema.dynamic`.
 */
export const createPcoResponseResolver = <
  RequestSchema extends {
    include?: PcoEntityName | ReadonlyArray<PcoEntityName> | undefined
  },
  BRS extends BaseResponseSchema,
>(
  // Argument 1: The decoded request params, containing the `includes` array.
  request: RequestSchema,
  // Argument 2: The base response schema, containing all possible includes as optional.
  baseResponseSchema: BRS,
) => {
  const members = extractMembersFromUnion(baseResponseSchema.fields.included.value.members)

  // Now your pickMembers should work
  function pickMembers<const T extends ReadonlyArray<MemberKeys>>(
    ts: T,
  ): T extends readonly []
    ? Schema.Tuple<[]>
    : Schema.Union<{ readonly [K in keyof T]: ExtractedMembers[T[K]] }> {
    if (ts.length === 0) {
      // Return a schema that will never match anything
      return Schema.Never as any
    }

    return Schema.Union(...ts.map((t) => members[t])) as any
  }

  // Usage

  const { included: _included, ...rest } = baseResponseSchema.fields

  return Schema.Struct({
    ...rest,
    included: Schema.Array(
      pickMembers(
        typeof request.include === 'string' ? [request.include] : (request.include ?? []),
      ),
    ),
  })
}
