import { Rx } from '@effect-rx/rx-react'
import { useRxMutation } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { extractEntityTag } from '@openfaith/schema'
import { getEntityId, mkZeroTableName } from '@openfaith/shared'
import { toast } from '@openfaith/ui/components/ui/sonner'
import { getBaseMutator } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { Effect, Option, pipe, Schema, type Schema as SchemaType } from 'effect'

export class SchemaInsertError extends Schema.TaggedError<SchemaInsertError>()(
  'SchemaInsertError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    operation: Schema.optional(Schema.String),
    tableName: Schema.optional(Schema.String),
    type: Schema.Literal('validation', 'operation'),
  },
) {}

const createSchemaInsertEffect = Effect.fn('createSchemaInsertEffect')(function* <T>(params: {
  data: T
  schema: SchemaType.Schema<T>
  z: ReturnType<typeof useZero>
  onSuccess?: (data: T) => void
  onError?: (error: SchemaInsertError) => void
}) {
  const { data, schema, z, onSuccess, onError } = params

  const entityTag = extractEntityTag(schema.ast)
  const tableName = pipe(
    entityTag,
    Option.match({
      onNone: () => null,
      onSome: (tag) => mkZeroTableName(tag),
    }),
  )

  if (!tableName) {
    return yield* Effect.fail(
      new SchemaInsertError({
        message: 'Table name not found - entity tag missing from schema',
        tableName: undefined,
        type: 'validation',
      }),
    )
  }

  const dataWithId = {
    id: getEntityId(tableName),
    ...data,
  }

  const insertMutator = getBaseMutator(z, tableName, 'insert')

  yield* pipe(
    Effect.tryPromise({
      catch: (cause) =>
        new SchemaInsertError({
          cause,
          message: `Failed to insert into table ${tableName}`,
          operation: 'insert',
          tableName,
          type: 'operation',
        }),
      try: () => insertMutator(dataWithId as any),
    }),
    Effect.tapError((error) =>
      Effect.gen(function* () {
        const errorMessage = pipe(error.type, (type) => {
          if (type === 'validation') {
            return `Validation error: ${error.message}`
          }
          if (type === 'operation') {
            return `Insert failed: ${error.message}`
          }
          return 'Unknown error occurred'
        })

        yield* Effect.sync(() => toast.error(errorMessage))

        if (onError) {
          yield* Effect.sync(() => onError(error))
        }
      }),
    ),
    Effect.tap(() =>
      Effect.gen(function* () {
        yield* Effect.sync(() => toast.success('Successfully created!'))

        if (onSuccess) {
          yield* Effect.sync(() => onSuccess(data))
        }

        yield* Effect.log('Schema insert successful', {
          id: dataWithId.id,
          tableName,
        })
      }),
    ),
  )
})

/**
 * Hook that provides insert functionality for a given schema using Zero mutations with Effect-RX
 */
export const useSchemaInsert = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (data: T) => void
    onError?: (error: SchemaInsertError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const insertRx = Rx.fn((data: T) => {
    return createSchemaInsertEffect({
      data,
      onError,
      onSuccess,
      schema,
      z,
    })
  })

  const mutation = useRxMutation(insertRx)

  return mutation
}
