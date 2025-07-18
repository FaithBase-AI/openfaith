import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import {
  type CustomMutatorEfDefs,
  type EffectTransaction,
  MutatorAuthError,
  MutatorValidationError,
} from '@openfaith/zero-effect'
import { Effect, Schema } from 'effect'

// Define the input type for creating a person (basic fields for now)
export const UpdatePersonInput = Schema.Struct({
  id: Schema.String,
  name: Schema.String.pipe(Schema.optional),
})

export type UpdatePersonInput = Schema.Schema.Type<typeof UpdatePersonInput>

/**
 * This is the clean API you wanted - pure Effect.fn mutators!
 */
export function createMutatorsEf(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      update: Effect.fn('updatePerson')(function* (
        tx: EffectTransaction<ZSchema>,
        input: UpdatePersonInput,
      ) {
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

export type MutatorsEf = ReturnType<typeof createMutatorsEf>

/**
 * Example of a more complex mutator with multiple operations
 */
export function createAdvancedMutatorsEf(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      bulkUpdate: Effect.fn('bulkUpdatePeople')(function* (
        tx: EffectTransaction<ZSchema>,
        inputs: Array<UpdatePersonInput>,
      ) {
        if (!authData) {
          return yield* Effect.fail(
            new MutatorAuthError({
              message: 'Not authenticated',
            }),
          )
        }

        // Process all updates in sequence
        yield* Effect.forEach(inputs, (input) =>
          tx.mutate.people.update({
            ...input,
          }),
        )

        yield* Effect.log('Bulk update completed', { count: inputs.length })
      }),
      updateWithHistory: Effect.fn('updatePersonWithHistory')(function* (
        tx: EffectTransaction<ZSchema>,
        input: UpdatePersonInput & { reason: string },
      ) {
        if (!authData) {
          return yield* Effect.fail(
            new MutatorAuthError({
              message: 'Not authenticated',
            }),
          )
        }

        // Update the person
        yield* tx.mutate.people.update({
          id: input.id,
          name: input.name,
        })

        // Log the change (example of multiple operations)
        yield* Effect.log('Person updated with history', {
          id: input.id,
          reason: input.reason,
          updatedBy: authData.sub,
        })

        // Could add more operations here - all as Effects!
      }),
    },
  } as const satisfies CustomMutatorEfDefs<ZSchema>
}
