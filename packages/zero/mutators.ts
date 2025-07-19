import { TokenKey } from '@openfaith/adapter-core/layers/tokenManager'
import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import {
  type CustomMutatorEfDefs,
  type EffectTransaction,
  ZeroMutatorAuthError,
  ZeroMutatorValidationError,
} from '@openfaith/zero-effect/client'
import { convertEffectMutatorsToPromise } from '@openfaith/zero-effect/effectMutatorConverter'
import type { CustomMutatorDefs } from '@rocicorp/zero'
import { Effect, Runtime, Schema } from 'effect'

export const UpdatePersonInput = Schema.Struct({
  firstName: Schema.String.pipe(Schema.optional),
  id: Schema.String,
})

export type UpdatePersonInput = Schema.Schema.Type<typeof UpdatePersonInput>

export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
): CustomMutatorEfDefs<ZSchema, TokenKey> {
  return {
    people: {
      update: (
        tx: EffectTransaction<ZSchema>,
        input: UpdatePersonInput,
      ): Effect.Effect<void, ZeroMutatorAuthError | ZeroMutatorValidationError, TokenKey> =>
        Effect.gen(function* () {
          const tokenKey = yield* TokenKey

          console.log(tokenKey)

          if (!authData) {
            return yield* Effect.fail(
              new ZeroMutatorAuthError({
                message: 'Not authenticated',
              }),
            )
          }

          const validatedInput = yield* Schema.decodeUnknown(UpdatePersonInput)(input).pipe(
            Effect.mapError(
              (_error): ZeroMutatorValidationError =>
                new ZeroMutatorValidationError({
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
        }) as Effect.Effect<void, ZeroMutatorAuthError | ZeroMutatorValidationError, TokenKey>,
    },
  } as const
}

export function createClientMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
): CustomMutatorDefs<ZSchema> {
  const effectMutators = createMutators(authData)

  const clientRuntime = Runtime.defaultRuntime.pipe(
    Runtime.provideService(TokenKey, 'client-token-key'),
  )

  return convertEffectMutatorsToPromise(effectMutators, clientRuntime)
}

export type Mutators = ReturnType<typeof createClientMutators>
