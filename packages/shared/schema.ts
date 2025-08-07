import { Effect, ParseResult, Schema } from 'effect'

export const arrayToCommaSeparatedString = <A extends string | number | boolean>(
  literalSchema: Schema.Schema<A, A, never>,
) =>
  Schema.transform(Schema.String, Schema.Array(literalSchema), {
    decode: (str) => str.split(',') as Array<A>,
    encode: (array) => array.join(','),
    strict: true,
  })

// Schema-based edge direction transformation
const EdgeDirectionInput = Schema.Struct({
  idA: Schema.String,
  idB: Schema.String,
})

const EdgeDirectionOutput = Schema.Struct({
  source: Schema.String,
  target: Schema.String,
})

export const EdgeDirectionSchema = Schema.transformOrFail(EdgeDirectionInput, EdgeDirectionOutput, {
  decode: ({ idA, idB }, _options, ast) => {
    // Check for empty IDs first
    if (!idA || !idB) {
      return ParseResult.fail(
        new ParseResult.Type(ast, { idA, idB }, 'Cannot determine edge direction: empty ID'),
      )
    }

    // Allow self-linking (identical IDs)
    if (idA === idB) {
      return ParseResult.succeed({ source: idA, target: idB })
    }

    const alphaRange = (id: string) => {
      const c = id[0]!.toLowerCase()
      return c >= 'a' && c <= 'm' ? 'A-M' : 'N-Z'
    }

    const rangeA = alphaRange(idA)
    const rangeB = alphaRange(idB)

    // If different ranges, use the range rule (A-M is source, N-Z is target)
    if (rangeA !== rangeB) {
      return ParseResult.succeed(
        rangeA === 'A-M' ? { source: idA, target: idB } : { source: idB, target: idA },
      )
    }

    // Same range: use full string comparison (handles same entity type linking)
    if (idA < idB) return ParseResult.succeed({ source: idA, target: idB })
    return ParseResult.succeed({ source: idB, target: idA })
  },
  encode: ({ source, target }) => ParseResult.succeed({ idA: source, idB: target }),
  strict: true,
})

/**
 * Schema transformer that converts JSON string or Array<string> to Array<string> and vice versa.
 * Uses proper schema validation to ensure the result is actually an array of strings.
 * Falls back to empty array if parsing fails or result is not a valid string array.
 * Accepts both JSON strings and arrays on the encoded side for flexibility.
 *
 * Examples:
 * - '["tag1", "tag2"]' -> ["tag1", "tag2"]
 * - ["tag1", "tag2"] -> ["tag1", "tag2"]
 * - '[]' -> []
 * - [] -> []
 * - 'invalid json' -> []
 * - '["valid", 123, "mixed"]' -> [] (invalid due to mixed types)
 * - 'null' -> []
 */
export const JsonStringToStringArray = Schema.transformOrFail(
  Schema.Union(Schema.String, Schema.Array(Schema.String)),
  Schema.Array(Schema.String),
  {
    decode: (input) =>
      Effect.gen(function* () {
        // If input is already an array, validate it directly
        if (Array.isArray(input)) {
          const validated = yield* Schema.decodeUnknown(Schema.Array(Schema.String))(input).pipe(
            Effect.orElse(() => Effect.succeed([])),
          )
          return validated
        }

        // If input is a string, try to parse the JSON
        const parsed = yield* Effect.try(() => JSON.parse(input as string)).pipe(
          Effect.orElse(() => Effect.succeed(null)),
        )

        // Validate that the parsed result is an array of strings
        const validated = yield* Schema.decodeUnknown(Schema.Array(Schema.String))(parsed).pipe(
          Effect.orElse(() => Effect.succeed([])),
        )

        return validated
      }),
    encode: (array) => Effect.succeed(JSON.stringify(array)),
    strict: true,
  },
)
