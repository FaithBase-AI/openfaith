import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import {
  type CustomMutatorEfDefs,
  convertEffectMutatorsToPromise,
  type EffectTransaction,
  MutatorAuthError,
  MutatorValidationError,
} from '@openfaith/zero-effect'
import type { CustomMutatorDefs } from '@rocicorp/zero'
import { Effect, Runtime, Schema } from 'effect'

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
      update: (tx: EffectTransaction<ZSchema>, input: UpdatePersonInput) =>
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

          // Database operation using Effect transaction
          yield* tx.mutate.people.update({
            ...validatedInput,
          })

          yield* Effect.log('Person updated successfully', {
            id: validatedInput.id,
          })
        }),
    },
  } as const satisfies CustomMutatorEfDefs<ZSchema>
}

/**
 * Create Promise-based mutators for client-side use (Zero client expects Promise-based mutators)
 */
export function createClientMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
): CustomMutatorDefs<ZSchema> {
  const effectMutators = createMutators(authData)
  return convertEffectMutatorsToPromise(effectMutators, Runtime.defaultRuntime)
}

// Export type for the mutators
export type Mutators = ReturnType<typeof createClientMutators>
