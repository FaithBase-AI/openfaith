import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import {
  effectFnToPromise,
  MutatorAuthError,
  MutatorDatabaseError,
  MutatorValidationError,
} from '@openfaith/zero-effect'
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero'
import { Effect, Schema } from 'effect'

/**
 * App-specific input schemas
 */

// Define the input type for updating a person (basic fields for now)
export const UpdatePersonInput = Schema.Struct({
  firstName: Schema.String.pipe(Schema.optional),
  id: Schema.String,
})

export type UpdatePersonInput = Schema.Schema.Type<typeof UpdatePersonInput>

/**
 * App-specific mutators using Effect-based approach
 */
export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      update: effectFnToPromise(function* (tx: Transaction<ZSchema>, input: UpdatePersonInput) {
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
    },
  } as const satisfies CustomMutatorDefs<ZSchema>
}

// Export type for the mutators
export type Mutators = ReturnType<typeof createMutators>
