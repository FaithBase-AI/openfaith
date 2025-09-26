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
export type UpdatePersonInput = typeof UpdatePersonInput.Type

export const UpdateCampusInput = Schema.Struct({
  id: Schema.String,
  name: Schema.String.pipe(Schema.optional),
})
export type UpdateCampusInput = typeof UpdateCampusInput.Type

export function createMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
) {
  return {
    campuses: {
      update: (tx: EffectTransaction<ZSchema>, input: UpdateCampusInput) =>
        Effect.gen(function* () {
          if (!authData) {
            return yield* Effect.fail(
              new ZeroMutatorAuthError({
                message: 'Not authenticated',
              }),
            )
          }

          const validatedInput = yield* Schema.decodeUnknown(UpdateCampusInput)(input).pipe(
            Effect.mapError(
              (error) =>
                new ZeroMutatorValidationError({
                  message: `Invalid input: ${String(error)}`,
                }),
            ),
          )

          yield* tx.mutate.campuses.update({
            ...validatedInput,
          })

          yield* Effect.log('Campus updated successfully', {
            id: validatedInput.id,
          })
        }) as Effect.Effect<void, ZeroMutatorAuthError | ZeroMutatorValidationError>,
    },
    people: {
      update: (tx: EffectTransaction<ZSchema>, input: UpdatePersonInput) =>
        Effect.gen(function* () {
          if (!authData) {
            return yield* Effect.fail(
              new ZeroMutatorAuthError({
                message: 'Not authenticated',
              }),
            )
          }

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
        }) as Effect.Effect<void, ZeroMutatorAuthError | ZeroMutatorValidationError>,
    },
  }
}

export function createClientMutators(
  authData: Pick<AuthData, 'sub' | 'activeOrganizationId'> | undefined,
): CustomMutatorDefs<ZSchema> {
  const effectMutators = createMutators(authData)

  const clientRuntime = Runtime.defaultRuntime

  return convertEffectMutatorsToPromise(effectMutators, clientRuntime)
}

export type Mutators = ReturnType<typeof createClientMutators>
