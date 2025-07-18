import { Effect, Schema } from 'effect'

/**
 * Helper that converts an Effect generator function to a Promise-based function for Zero compatibility
 */
export function effectFnToPromise<A extends ReadonlyArray<unknown>>(
  effectGenFn: (...args: A) => Generator<any, void, any>,
): (...args: A) => Promise<void> {
  return (...args: A) =>
    Effect.runPromise(Effect.gen(() => effectGenFn(...args)) as Effect.Effect<void, never, never>)
}

/**
 * Base error classes for mutators
 */

// Define authentication error
export class MutatorAuthError extends Schema.TaggedError<MutatorAuthError>()('MutatorAuthError', {
  message: Schema.String,
}) {}

// Define validation error
export class MutatorValidationError extends Schema.TaggedError<MutatorValidationError>()(
  'MutatorValidationError',
  {
    field: Schema.String.pipe(Schema.optional),
    message: Schema.String,
  },
) {}

// Define database error
export class MutatorDatabaseError extends Schema.TaggedError<MutatorDatabaseError>()(
  'MutatorDatabaseError',
  {
    cause: Schema.Unknown.pipe(Schema.optional),
    message: Schema.String,
  },
) {}

// Union of all mutator errors
export type MutatorError = MutatorAuthError | MutatorValidationError | MutatorDatabaseError
