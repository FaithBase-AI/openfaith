import { Schema } from 'effect'

export const PcoHeaders = Schema.Struct({
  Authorization: Schema.String,
})
export type PcoHeaders = typeof PcoHeaders.Type

export const PcoResponseHeaders = Schema.Struct({
  'access-control-allow-credentials': Schema.String,
  'access-control-allow-headers': Schema.String,
  'access-control-allow-methods': Schema.String,
  'access-control-allow-origin': Schema.String,
  'access-control-expose-headers': Schema.String,
  'alt-svc': Schema.String,
  connection: Schema.String,
  'content-length': Schema.String,
  'content-type': Schema.String,
  date: Schema.String,
  server: Schema.String,
  'strict-transport-security': Schema.String,
  vary: Schema.String,
  via: Schema.String,
  'x-amz-cf-id': Schema.String,
  'x-amz-cf-pop': Schema.String,
  'x-cache': Schema.String,
  'x-pco-api-processor': Schema.String,
  'x-pco-api-request-rate-count': Schema.String,
  'x-pco-api-request-rate-limit': Schema.String,
  'x-pco-api-request-rate-period': Schema.String,
  'x-request-id': Schema.String,
  'x-runtime': Schema.String,
})
export type PcoResponseHeaders = typeof PcoResponseHeaders.Type

export const PcoItem = Schema.Struct({
  data: Schema.Unknown,
  included: Schema.Array(Schema.Unknown),
  meta: Schema.Unknown,
})
export type PcoItem = typeof PcoItem.Type

export const PcoCollection = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      attributes: Schema.Unknown,
      id: Schema.String,
      type: Schema.String,
    }),
  ),
  included: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.String,
    }),
  ),
  links: Schema.Struct({
    next: Schema.optional(Schema.String),
    self: Schema.String,
  }),
  meta: Schema.Struct({
    count: Schema.Number,
    next: Schema.optional(
      Schema.Struct({
        offset: Schema.Number,
      }),
    ),
    total_count: Schema.Number,
  }),
})
export type PcoCollection = typeof PcoCollection.Type
