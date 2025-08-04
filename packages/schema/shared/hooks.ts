import { Rx } from '@effect-rx/rx-react'
import { useRxMutation } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { discoverUiEntities } from '@openfaith/schema/shared/entityDiscovery'
import { extractEntityTag } from '@openfaith/schema/shared/introspection'
import { getEntityId, mkZeroTableName, nullOp } from '@openfaith/shared'
import { toast } from '@openfaith/ui/components/ui/sonner'
import {
  getBaseEntitiesQuery,
  getBaseEntityQuery,
  getBaseMutator,
} from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import { useQuery } from '@rocicorp/zero/react'
import { Array, Effect, Option, pipe, Schema, type Schema as SchemaType, String } from 'effect'
import type { Option as OptionType } from 'effect/Option'
import { useMemo } from 'react'

/**
 * Get schema for an entity type using the entity discovery system
 */
export const getSchemaByEntityType = (entityType: string) => {
  const entities = discoverUiEntities()

  return pipe(
    entities,
    Array.findFirst(
      (entity) => pipe(entity.tag, String.toLowerCase) === pipe(entityType, String.toLowerCase),
    ),
    Option.map((entity) => entity.schema),
  )
}

/**
 * Hook to get schema for an entity type
 */
export const useEntitySchema = (entityType: string) => {
  return useMemo(() => {
    return getSchemaByEntityType(entityType)
  }, [entityType])
}

// Schema Insert Hook
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
      // Zero mutator expects any type due to dynamic schema nature
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

// Schema Update Hook
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
      // Zero mutator expects any type due to dynamic schema nature
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

// Schema Collection Hook
export interface SchemaCollectionResult<T> {
  data: Array<T>
  loading: boolean
  error: string | null
  nextPage: () => void
  pageSize: number
  limit: number
}

/**
 * Hook that provides collection data for a given schema using Zero queries
 */
export const useSchemaCollection = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    pageSize?: number
    limit?: number
    enabled?: boolean
  } = {},
): SchemaCollectionResult<T> => {
  const { pageSize = 20, limit = 100, enabled = true } = options

  const z = useZero()

  const entityTag = useMemo(() => extractEntityTag(schema.ast), [schema])

  const query = useMemo(() => {
    if (!enabled) return null

    return pipe(
      entityTag,
      Option.match({
        onNone: () => null,
        onSome: (tag) => {
          const tableName = mkZeroTableName(String.capitalize(tag))
          return getBaseEntitiesQuery(z, tableName)
        },
      }),
    )
  }, [z, entityTag, enabled])
  const [data, info] = useQuery(query as Parameters<typeof useQuery>[0])

  return useMemo(
    () => ({
      data: (data || []) as Array<T>,
      error: null,
      limit,
      loading: info.type !== 'complete',
      nextPage: nullOp,
      pageSize,
    }),
    [data, info, pageSize, limit],
  )
}

// Schema Entity Hook
export interface SchemaEntityResult<T> {
  entityOpt: OptionType<T>
  loading: boolean
  error: string | null
}

/**
 * Hook that provides individual entity data for a given schema and ID using Zero queries
 */
export const useSchemaEntity = <T>(
  schema: SchemaType.Schema<T>,
  entityId: string,
  options: {
    enabled?: boolean
  } = {},
): SchemaEntityResult<T> => {
  const { enabled = true } = options

  const z = useZero()

  const entityTag = useMemo(() => extractEntityTag(schema.ast), [schema])

  const query = useMemo(() => {
    if (!enabled || !entityId) return null

    return pipe(
      entityTag,
      Option.match({
        onNone: () => null,
        onSome: (tag) => {
          const tableName = mkZeroTableName(String.capitalize(tag))
          return getBaseEntityQuery(z, tableName, entityId)
        },
      }),
    )
  }, [z, entityTag, entityId, enabled])

  const [data, info] = useQuery(query as Parameters<typeof useQuery>[0])

  return useMemo(
    () => ({
      entityOpt: pipe(data, Option.fromNullable) as OptionType<T>,
      error: null,
      loading: info.type !== 'complete',
    }),
    [data, info],
  )
}
