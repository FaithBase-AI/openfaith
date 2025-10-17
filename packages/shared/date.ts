import { Schema } from 'effect'

export const normalizeIsoString = (dateValue: number | string | Date): string => {
  return new Date(dateValue).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

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
    decode: normalizeIsoString,
    encode: normalizeIsoString,
  },
)

export const IsoStringToTimestamp = Schema.transform(
  Schema.Union(Schema.String, Schema.Number),
  Schema.Number,
  {
    decode: (input: string | number) => new Date(input).getTime(),
    encode: normalizeIsoString,
    strict: true,
  },
)
