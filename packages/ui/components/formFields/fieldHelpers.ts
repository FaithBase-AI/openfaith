import type { ValidationError } from '@tanstack/react-form'
import { Boolean, pipe } from 'effect'

export type MaybeFieldValue<T> = T | (T | undefined) | (T | null) | (T | undefined | null)

export const getFieldErrors = ({
  errors,
  isTouched,
  submissionAttempts,
}: {
  errors: Array<ValidationError>
  isTouched: boolean
  submissionAttempts: number
}): { processedError?: string } =>
  pipe(
    isTouched && errors.length > 0 && submissionAttempts > 0,
    Boolean.match({
      onFalse: () => ({}),
      onTrue: () => ({ processedError: errors.join(', ') }),
    }),
  )
