import { TokenKey } from '@openfaith/adapter-core/layers/tokenManager'
import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import {
  type CustomMutatorEfDefs,
  convertEffectMutatorsToPromise,
  type EffectTransaction,
  MutatorAuthError,
  MutatorValidationError,
} from '@openfaith/zero-effect'
import type { CustomMutatorDefs } from '@rocicorp/zero'
import { Context, Effect, FiberRefs, type Runtime, RuntimeFlags, Schema } from 'effect'

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
): CustomMutatorEfDefs<ZSchema, TokenKey> {
  return {
    people: {
      update: (
        tx: EffectTransaction<ZSchema>,
        input: UpdatePersonInput,
      ): Effect.Effect<void, MutatorAuthError | MutatorValidationError, TokenKey> =>
        Effect.gen(function* () {
          const tokenKey = yield* TokenKey

          console.log(tokenKey)

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
              (_error): MutatorValidationError =>
                new MutatorValidationError({
                  message: `Invalid input: ${String(_error)}`,
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
        }) as Effect.Effect<void, MutatorAuthError | MutatorValidationError, TokenKey>,
    },
  } as const
}

/**
 * Create Promise-based mutators for client-side use (Zero client expects Promise-based mutators)
 * Provides a mock TokenKey service for client-side use
 */
export function createClientMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
): CustomMutatorDefs<ZSchema> {
  const effectMutators = createMutators(authData)

  // Create a runtime with mock TokenKey service for client-side use
  const context = Context.make(TokenKey, 'client-token-key')
  const clientRuntime = {
    context,
    fiberRefs: FiberRefs.empty(),
    runtimeFlags: RuntimeFlags.none,
  } as Runtime.Runtime<TokenKey>

  return convertEffectMutatorsToPromise(effectMutators, clientRuntime)
}

// Export type for the mutators
export type Mutators = ReturnType<typeof createClientMutators>
