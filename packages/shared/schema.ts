import { ParseResult, Schema } from 'effect'

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
