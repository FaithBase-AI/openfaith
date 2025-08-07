import { Schema } from 'effect'

/**
 * Schema transformer that converts timestamp (number) or ISO string to ISO string and vice versa.
 * Useful for database fields that store timestamps as numbers but need to be
 * represented as ISO strings in the application layer.
 * Accepts both timestamp numbers and ISO strings on the encoded side for flexibility.
 * Always encodes back to ISO string format without milliseconds.
 *
 * Examples:
 * - 1640995200000 -> "2022-01-01T00:00:00Z"
 * - "2022-01-01T00:00:00.000Z" -> "2022-01-01T00:00:00Z"
 * - "2022-01-01T00:00:00Z" -> "2022-01-01T00:00:00Z" (when encoding back)
 */
export const TimestampToIsoString = Schema.transform(
  Schema.Union(Schema.Number, Schema.String),
  Schema.String,
  {
    decode: (input) => new Date(input).toISOString().replace(/\.\d{3}Z$/, 'Z'),
    encode: (isoString) => new Date(isoString).toISOString().replace(/\.\d{3}Z$/, 'Z'),
  },
)
