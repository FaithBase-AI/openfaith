import type { EffectTransaction } from '@openfaith/zero-effect/effectTransaction'
import type { Schema as ZeroSchema } from '@rocicorp/zero'
import { type Effect, Schema } from 'effect'

export type CustomMutatorEfDefs<TSchema extends ZeroSchema, R = never> = {
  [TableName in keyof TSchema['tables']]?: {
    [MutatorName: string]: (
      tx: EffectTransaction<TSchema>,
      ...args: ReadonlyArray<any>
    ) => Effect.Effect<any, any, R>
  }
}

export class ZeroMutatorAuthError extends Schema.TaggedError<ZeroMutatorAuthError>()(
  'ZeroMutatorAuthError',
  {
    message: Schema.String,
  },
) {}

export class ZeroMutatorValidationError extends Schema.TaggedError<ZeroMutatorValidationError>()(
  'ZeroMutatorValidationError',
  {
    field: Schema.String.pipe(Schema.optional),
    message: Schema.String,
  },
) {}

export class ZeroMutatorDatabaseError extends Schema.TaggedError<ZeroMutatorDatabaseError>()(
  'ZeroMutatorDatabaseError',
  {
    cause: Schema.Unknown.pipe(Schema.optional),
    message: Schema.String,
  },
) {}

export class ZeroMutationProcessingError extends Schema.TaggedError<ZeroMutationProcessingError>()(
  'ZeroMutationProcessingError',
  {
    cause: Schema.Unknown.pipe(Schema.optional),
    message: Schema.String,
  },
) {}
