import { Option, pipe, Schema } from 'effect'

const PcoResponseSchema = Schema.Struct({
  data: Schema.optional(
    Schema.Struct({
      attributes: Schema.optional(
        Schema.Struct({
          updated_at: Schema.optional(Schema.String),
        }),
      ),
    }),
  ),
})

export const extractPcoUpdatedAt = (response: unknown): Option.Option<string> => {
  return pipe(
    Schema.decodeUnknownOption(PcoResponseSchema)(response),
    Option.flatMap((parsed) => Option.fromNullable(parsed.data?.attributes?.updated_at)),
  )
}
