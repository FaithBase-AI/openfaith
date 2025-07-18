import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero'
import { Effect, Schema } from 'effect'

// Define the input type for creating a person (basic fields for now)
export const UpdatePersonInput = Schema.Struct({
  firstName: Schema.String.pipe(Schema.optional),
  id: Schema.String,
})

export type UpdatePersonInput = Schema.Schema.Type<typeof UpdatePersonInput>

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

/**
 * Helper that converts an Effect.fn to a Promise-based function for Zero compatibility
 */
export function effectFnToPromise<A extends ReadonlyArray<unknown>, E>(
  effectFn: (...args: A) => Effect.Effect<void, E, never>,
): (...args: A) => Promise<void> {
  return (...args: A) => Effect.runPromise(effectFn(...args))
}

/**
 * Helper function to create Effect-based mutators that are compatible with Zero's CustomMutatorDefs
 */
export function createEffectMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      // Use Effect.fn directly for the mutator, then convert to Promise for Zero compatibility
      update: effectFnToPromise(
        Effect.fn('updatePerson')((tx: Transaction<ZSchema>, input: UpdatePersonInput) =>
          Effect.gen(function* () {
            // Authentication check
            if (!authData) {
              return yield* Effect.fail(
                new MutatorAuthError({
                  message: 'Not authenticated',
                }),
              )
            }

            // Input validation using Effect Schema
            const validatedInput = yield* Schema.decodeUnknown(UpdatePersonInput)(input).pipe(
              Effect.mapError(
                (error) =>
                  new MutatorValidationError({
                    message: `Invalid input: ${String(error)}`,
                  }),
              ),
            )

            // Database operation wrapped in Effect
            yield* Effect.tryPromise({
              catch: (error) =>
                new MutatorDatabaseError({
                  cause: error,
                  message: `Failed to update person: ${String(error)}`,
                }),
              try: () =>
                tx.mutate.people.update({
                  ...validatedInput,
                }),
            })

            yield* Effect.log('Person updated successfully', {
              id: validatedInput.id,
            })
          }),
        ),
      ),
    },
  } as const satisfies CustomMutatorDefs<ZSchema>
}

export type EffectMutators = ReturnType<typeof createEffectMutators>

/**
 * Alternative approach: Create individual Effect.fn mutators that can be composed
 */
export const updatePersonEffectFn = Effect.fn('updatePerson')(
  (
    tx: Transaction<ZSchema>,
    input: UpdatePersonInput,
    authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
  ) =>
    Effect.gen(function* () {
      // Authentication check
      if (!authData) {
        return yield* Effect.fail(
          new MutatorAuthError({
            message: 'Not authenticated',
          }),
        )
      }

      // Input validation using Effect Schema
      const validatedInput = yield* Schema.decodeUnknown(UpdatePersonInput)(input).pipe(
        Effect.mapError(
          (error) =>
            new MutatorValidationError({
              message: `Invalid input: ${String(error)}`,
            }),
        ),
      )

      // Database operation wrapped in Effect
      yield* Effect.tryPromise({
        catch: (error) =>
          new MutatorDatabaseError({
            cause: error,
            message: `Failed to update person: ${String(error)}`,
          }),
        try: () =>
          tx.mutate.people.update({
            ...validatedInput,
          }),
      })

      yield* Effect.log('Person updated successfully', {
        id: validatedInput.id,
      })
    }),
)

/**
 * Create mutators using individual Effect.fn functions
 */
export function createEffectMutatorsWithIndividualFns(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      update: effectFnToPromise((tx: Transaction<ZSchema>, input: UpdatePersonInput) =>
        updatePersonEffectFn(tx, input, authData),
      ),
    },
  } as const satisfies CustomMutatorDefs<ZSchema>
}

/**
 * Generic helper to create a mutator from an Effect.fn
 */
export function createMutatorFromEffectFn<TInput>(
  effectFn: (
    tx: Transaction<ZSchema>,
    input: TInput,
    authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
  ) => Effect.Effect<void, MutatorError, never>,
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return effectFnToPromise((tx: Transaction<ZSchema>, input: TInput) =>
    effectFn(tx, input, authData),
  )
}

/**
 * Example using the generic helper
 */
export function createEffectMutatorsWithGenericHelper(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      update: createMutatorFromEffectFn(updatePersonEffectFn, authData),
    },
  } as const satisfies CustomMutatorDefs<ZSchema>
}
