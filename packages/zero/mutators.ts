import { TokenKey } from '@openfaith/adapter-core/layers/tokenManager'
import type { AuthData, ZSchema } from '@openfaith/zero/zeroSchema.mts'
import {
  convertEffectMutatorsToPromise,
  type EffectTransaction,
  ZeroMutatorAuthError,
  ZeroMutatorValidationError,
} from '@openfaith/zero-effect/client'
import type { CustomMutatorDefs } from '@rocicorp/zero'
import { Effect, Runtime, Schema } from 'effect'

export const UpdatePersonInput = Schema.Struct({
  firstName: Schema.String.pipe(Schema.optional),
  id: Schema.String,
  name: Schema.String.pipe(Schema.optional),
})

export type UpdatePersonInput = Schema.Schema.Type<typeof UpdatePersonInput>

export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    people: {
      update: (tx: EffectTransaction<ZSchema>, input: UpdatePersonInput) =>
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

          console.log(input)

          const validatedInput = yield* Schema.decodeUnknown(UpdatePersonInput)(input).pipe(
            Effect.mapError(
              (error) =>
                new ZeroMutatorValidationError({
                  message: `Invalid input: ${String(error)}`,
                }),
            ),
          )

          yield* tx.mutate.people.update({
            ...validatedInput,
          })

          yield* Effect.log('Person updated successfully', {
            id: validatedInput.id,
          })
        }) as Effect.Effect<void, ZeroMutatorAuthError | ZeroMutatorValidationError, TokenKey>,
    },
  }
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
