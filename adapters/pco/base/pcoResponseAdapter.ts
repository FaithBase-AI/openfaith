import type { ResponseAdapter } from '@openfaith/adapter-core/api2/responseAdapter'
import { Schema } from 'effect'

/**
 * A `ResponseAdapter` tailored for the Planning Center Online (PCO) API.
 *
 * This implementation understands the JSON:API specification that PCO follows,
 * where single resources are nested under a `data` key, and collection
 * responses include `data`, `included`, `links`, and `meta` top-level keys.
 */
export const pcoResponseAdapter: ResponseAdapter = {
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
  adaptCollection: (resourceSchema) =>
    Schema.Struct({
      /** The 'data' key contains the array of primary resource objects. */
      data: Schema.Array(resourceSchema),

      /** The 'included' key contains side-loaded related resources. */
      included: Schema.optional(Schema.Array(Schema.Any)),

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
    }),
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
  adaptSingle: (resourceSchema) =>
    Schema.Struct({
      data: resourceSchema,
      included: Schema.optional(Schema.Array(Schema.Any)),
    }),
}
