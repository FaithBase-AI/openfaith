import { Schema } from 'effect'

export const arrayToCommaSeparatedString = <A extends string | number | boolean>(
  literalSchema: Schema.Schema<A, A, never>,
) =>
  Schema.transform(Schema.String, Schema.Array(literalSchema), {
    decode: (str) => str.split(',') as Array<A>,
    encode: (array) => array.join(','),
    strict: true,
  })
