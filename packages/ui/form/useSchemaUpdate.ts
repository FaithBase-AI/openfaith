import { Rx } from '@effect-rx/rx-react'
import { useRxMutation } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { extractEntityTag } from '@openfaith/schema'
import { mkZeroTableName } from '@openfaith/shared'
import { toast } from '@openfaith/ui/components/ui/sonner'
import { getBaseMutator } from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { Effect, Option, pipe, Schema, type Schema as SchemaType } from 'effect'

export class SchemaUpdateError extends Schema.TaggedError<SchemaUpdateError>()(
  'SchemaUpdateError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    operation: Schema.optional(Schema.String),
    tableName: Schema.optional(Schema.String),
    type: Schema.Literal('validation', 'operation'),
  },
) {}

const createSchemaUpdateEffect = Effect.fn('createSchemaUpdateEffect')(function* <T>(params: {
  data: T & { id: string }
  schema: SchemaType.Schema<T>
  z: ReturnType<typeof useZero>
  onSuccess?: (data: T & { id: string }) => void
  onError?: (error: SchemaUpdateError) => void
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
      new SchemaUpdateError({
        message: 'Table name not found - entity tag missing from schema',
        tableName: undefined,
        type: 'validation',
      }),
    )
  }

  const updateMutator = getBaseMutator(z, tableName, 'update')

  yield* pipe(
    Effect.tryPromise({
      catch: (cause) =>
        new SchemaUpdateError({
          cause,
          message: `Failed to update in table ${tableName}`,
          operation: 'update',
          tableName,
          type: 'operation',
        }),
      try: () => updateMutator(data as any),
    }),
    Effect.tapError((error) =>
      Effect.gen(function* () {
        const errorMessage = pipe(error.type, (type) => {
          if (type === 'validation') {
            return `Validation error: ${error.message}`
          }
          if (type === 'operation') {
            return `Update failed: ${error.message}`
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
        yield* Effect.sync(() => toast.success('Successfully updated!'))

        if (onSuccess) {
          yield* Effect.sync(() => onSuccess(data))
        }

        yield* Effect.log('Schema update successful', {
          id: data.id,
          tableName,
        })
      }),
    ),
  )
})

/**
 * Hook that provides update functionality for a given schema using Zero mutations with Effect-RX
 */
export const useSchemaUpdate = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (data: T & { id: string }) => void
    onError?: (error: SchemaUpdateError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const updateRx = Rx.fn((data: T & { id: string }) => {
    return createSchemaUpdateEffect({
      data,
      onError,
      onSuccess,
      schema,
      z,
    })
  })

  const mutation = useRxMutation(updateRx)

  return mutation
}
