import { Schema } from 'effect'

/**
 * Schema transformer that converts timestamp (number) to ISO string and vice versa.
 * Useful for database fields that store timestamps as numbers but need to be
 * represented as ISO strings in the application layer.
 *
 * Examples:
 * - 1640995200000 -> "2022-01-01T00:00:00.000Z"
 * - "2022-01-01T00:00:00.000Z" -> 1640995200000
 */
export const TimestampToIsoString = Schema.transform(Schema.Number, Schema.String, {
  decode: (timestamp) => new Date(timestamp).toISOString(),
  encode: (isoString) => new Date(isoString).getTime(),
})
