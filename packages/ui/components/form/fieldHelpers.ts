import type { ValidationError } from '@tanstack/react-form'
import { Array, pipe, Schema } from 'effect'

export type MaybeFieldValue<T> = T | (T | undefined) | (T | null) | (T | undefined | null)

const ErrorSchema = Schema.Struct({
  message: Schema.String,
})

const extractErrorMessages = (errors: Array<ValidationError>) =>
  pipe(
    errors,
    Array.map((x) => Schema.decodeUnknownOption(ErrorSchema)(x)),
    Array.getSomes,
    Array.map((error) => error.message),
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
