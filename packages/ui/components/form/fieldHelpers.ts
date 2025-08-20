import type { ValidationError } from '@tanstack/react-form'
import { Array, pipe, Schema } from 'effect'

export type MaybeFieldValue<T> = T | (T | undefined) | (T | null) | (T | undefined | null)

// Schema that accepts either {message: string} or string and transforms to string
const ErrorMessageSchema = Schema.Union(
  Schema.transform(Schema.Struct({ message: Schema.String }), Schema.String, {
    decode: (obj) => obj.message,
    encode: (str) => ({ message: str }),
    strict: true,
  }),
  Schema.String,
)

const extractErrorMessages = (errors: Array<ValidationError>) =>
  pipe(
    errors,
    Array.map((x) => Schema.decodeUnknownOption(ErrorMessageSchema)(x)),
    Array.getSomes,
    Array.join(', '),
  )

export const getFieldErrors = (errors: Array<ValidationError>): { processedError?: string } =>
  pipe(
    errors,
    Array.match({
      onEmpty: () => ({}),
      onNonEmpty: () => ({
        processedError: extractErrorMessages(errors),
      }),
    }),
  )
