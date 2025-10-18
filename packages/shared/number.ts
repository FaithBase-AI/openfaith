import { ParseResult, Schema } from 'effect'

/**
 * Schema transformer that converts string or number input to number output.
 * Useful for APIs that may return numeric values as either strings or numbers.
 *
 * Examples:
 * - "42.5" -> 42.5
 * - 42.5 -> 42.5
 * - "0" -> 0
 * - 0 -> 0
 */
export const StringOrNumberToNumber = Schema.transformOrFail(
  Schema.Union(Schema.String, Schema.Number),
  Schema.Number,
  {
    decode: (value) => {
      if (typeof value === 'number') {
        return ParseResult.succeed(value)
      }
      const parsed = Number.parseFloat(value)
      if (Number.isNaN(parsed)) {
        return ParseResult.fail(new ParseResult.Type(Schema.Number.ast, value))
      }
      return ParseResult.succeed(parsed)
    },
    encode: (value) => ParseResult.succeed(value),
    strict: true,
  },
)
