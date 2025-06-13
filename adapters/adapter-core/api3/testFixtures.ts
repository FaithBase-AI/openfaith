import type { ResponseAdapter } from '@openfaith/adapter-core/api3/responseAdapter'
import { Schema } from 'effect'

export const pcoResponseAdapter: ResponseAdapter = {
  adaptCollection: (resourceSchema) =>
    Schema.Struct({
      data: Schema.Array(resourceSchema),
      included: Schema.optional(Schema.Array(Schema.Any)),
      links: Schema.Struct({
        next: Schema.optional(Schema.String),
        self: Schema.String,
      }),
      meta: Schema.Struct({
        can_include: Schema.optional(Schema.Array(Schema.String)),
        can_order_by: Schema.optional(Schema.Array(Schema.String)),
        can_query_by: Schema.optional(Schema.Array(Schema.String)),
        count: Schema.Number,
        parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
        total_count: Schema.Number,
      }),
    }),
  adaptSingle: (resourceSchema) =>
    Schema.Struct({
      data: resourceSchema,
      included: Schema.optional(Schema.Array(Schema.Any)),
    }),
}
