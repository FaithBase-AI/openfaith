import { Rx } from '@effect-rx/rx-react'
import { useRxMutation } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { discoverUiEntities } from '@openfaith/schema/shared/entityDiscovery'
import { extractEntityInfo, extractEntityTag } from '@openfaith/schema/shared/introspection'
import { OfForeignKey, OfRelations, type RelationConfig } from '@openfaith/schema/shared/schema'
import { getEntityId, mkZeroTableName } from '@openfaith/shared'
import { toast } from '@openfaith/ui/components/ui/sonner'
import { useFilterQuery } from '@openfaith/ui/shared/hooks/useFilterQuery'
import type { ZSchema } from '@openfaith/zero'
import {
  getBaseEntitiesQuery,
  getBaseEntityQuery,
  getBaseMutator,
} from '@openfaith/zero/baseQueries'
import { useZero } from '@openfaith/zero/useZero'
import type { Query } from '@rocicorp/zero'
import { useQuery } from '@rocicorp/zero/react'
import {
  Array,
  Effect,
  Option,
  Order,
  pipe,
  Schema,
  SchemaAST,
  type Schema as SchemaType,
  String,
} from 'effect'
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

// -------------------------
// Relation helpers (OfRelations)
// -------------------------

/**
 * Reads schema-declared relations (OfRelations) for UI usage
 */
export const getSchemaDeclaredRelations = <T>(schema: SchemaType.Schema<T>) => {
  const ast = schema.ast
  const relOpt = SchemaAST.getAnnotation<ReadonlyArray<RelationConfig>>(OfRelations)(ast)
  return pipe(
    relOpt,
    Option.getOrElse(() => [] as ReadonlyArray<RelationConfig>),
  )
}

export type UiEntityRelationships = {
  sourceEntityType: string
  targetEntityTypes: ReadonlyArray<string>
}

/**
 * Builds ordered relation targets for the current entity type by merging
 * schema-declared relations (pinned and ordered) with DB-discovered ones.
 */
export const buildEntityRelationshipsForTable = <T>(
  schema: SchemaType.Schema<T>,
  dbRelationships: ReadonlyArray<UiEntityRelationships>,
): ReadonlyArray<UiEntityRelationships> => {
  const { entityName } = extractEntityInfo(schema)
  const sourceType = pipe(entityName, String.toLowerCase)

  const declared = getSchemaDeclaredRelations(schema)

  // Filter declared table-visible relations and sort by order
  const declaredTargetsOrdered: ReadonlyArray<string> = pipe(
    declared,
    Array.filter((r) => r.table?.show === true),
    Array.map((r) => ({ order: r.table?.order ?? 999, tag: r.targetEntityTag })),
    Array.sort(Order.struct({ order: Order.number })),
    Array.map((r) => r.tag),
  )

  // Include FK-based relation targets discovered from field annotations
  const fkTargets: ReadonlyArray<string> = pipe(
    SchemaAST.isTransformation(schema.ast) ? schema.ast.from : schema.ast,
    (ast) => (SchemaAST.isTypeLiteral(ast) ? ast.propertySignatures : []),
    Array.filterMap((prop) =>
      pipe(
        SchemaAST.getAnnotation<{ targetEntityTag: string }>(OfForeignKey)(prop),
        Option.map((a) => a.targetEntityTag),
      ),
    ),
    Array.dedupe,
  )

  // Get DB targets for this source type
  const dbTargets = pipe(
    dbRelationships,
    Array.findFirst((rel) => rel.sourceEntityType === sourceType),
    Option.map((rel) => rel.targetEntityTypes),
    Option.getOrElse(() => [] as ReadonlyArray<string>),
  )

  // Merge declared first, then DB targets, dedupe
  const merged = pipe([...declaredTargetsOrdered, ...fkTargets, ...dbTargets], Array.dedupe)

  return [
    {
      sourceEntityType: sourceType,
      targetEntityTypes: merged,
    },
  ]
}

// -------------------------
// Foreign key extraction for forms
// -------------------------

export type ForeignKeyField = {
  fieldKey: string
  targetEntityTag: string
}

export const getForeignKeyFields = <T>(
  schema: SchemaType.Schema<T>,
): ReadonlyArray<ForeignKeyField> => {
  const ast = SchemaAST.isTransformation(schema.ast) ? schema.ast.from : schema.ast
  if (!SchemaAST.isTypeLiteral(ast)) {
    return []
  }
  return pipe(
    ast.propertySignatures,
    Array.filterMap((prop) =>
      pipe(
        SchemaAST.getAnnotation<{ targetEntityTag: string }>(OfForeignKey)(prop),
        Option.map((a) => ({
          fieldKey: globalThis.String(prop.name),
          targetEntityTag: a.targetEntityTag,
        })),
      ),
    ),
  )
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

// Schema Delete Hook
export class SchemaDeleteError extends Schema.TaggedError<SchemaDeleteError>()(
  'SchemaDeleteError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    operation: Schema.optional(Schema.String),
    tableName: Schema.optional(Schema.String),
    type: Schema.Literal('validation', 'operation'),
  },
) {}

const createSchemaDeleteEffect = Effect.fn('createSchemaDeleteEffect')(function* <T>(params: {
  id: string
  schema: SchemaType.Schema<T>
  z: ReturnType<typeof useZero>
  onSuccess?: (id: string) => void
  onError?: (error: SchemaDeleteError) => void
}) {
  const { id, schema, z, onSuccess, onError } = params

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
      new SchemaDeleteError({
        message: 'Table name not found - entity tag missing from schema',
        tableName: undefined,
        type: 'validation',
      }),
    )
  }

  const deleteMutator = getBaseMutator(z, tableName, 'delete')

  yield* pipe(
    Effect.tryPromise({
      catch: (cause) =>
        new SchemaDeleteError({
          cause,
          message: `Failed to delete from table ${tableName}`,
          operation: 'delete',
          tableName,
          type: 'operation',
        }),
      try: () => deleteMutator({ id } as any),
    }),
    Effect.tapError((error) =>
      Effect.gen(function* () {
        const errorMessage = pipe(error.type, (type) => {
          if (type === 'validation') {
            return `Validation error: ${error.message}`
          }
          if (type === 'operation') {
            return `Delete failed: ${error.message}`
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
        yield* Effect.sync(() => toast.success('Successfully deleted!'))

        if (onSuccess) {
          yield* Effect.sync(() => onSuccess(id))
        }

        yield* Effect.log('Schema delete successful', {
          id,
          tableName,
        })
      }),
    ),
  )
})

/**
 * Hook that provides delete functionality for a given schema using Zero mutations with Effect-RX
 */
export const useSchemaDelete = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (id: string) => void
    onError?: (error: SchemaDeleteError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const deleteRx = Rx.fn((id: string) => {
    return createSchemaDeleteEffect({
      id,
      onError,
      onSuccess,
      schema,
      z,
    })
  })

  const mutation = useRxMutation(deleteRx)

  return mutation
}

// Schema Upsert Hook
export class SchemaUpsertError extends Schema.TaggedError<SchemaUpsertError>()(
  'SchemaUpsertError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    operation: Schema.optional(Schema.String),
    tableName: Schema.optional(Schema.String),
    type: Schema.Literal('validation', 'operation'),
  },
) {}

const createSchemaUpsertEffect = Effect.fn('createSchemaUpsertEffect')(function* <T>(params: {
  data: T & { id?: string }
  schema: SchemaType.Schema<T>
  z: ReturnType<typeof useZero>
  onSuccess?: (data: T & { id: string }) => void
  onError?: (error: SchemaUpsertError) => void
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
      new SchemaUpsertError({
        message: 'Table name not found - entity tag missing from schema',
        tableName: undefined,
        type: 'validation',
      }),
    )
  }

  // Ensure we have an ID for upsert
  const dataWithId = {
    id: data.id || getEntityId(tableName),
    ...data,
  } as T & { id: string }

  const upsertMutator = getBaseMutator(z, tableName, 'upsert')

  yield* pipe(
    Effect.tryPromise({
      catch: (cause) =>
        new SchemaUpsertError({
          cause,
          message: `Failed to upsert into table ${tableName}`,
          operation: 'upsert',
          tableName,
          type: 'operation',
        }),
      try: () => upsertMutator(dataWithId as any),
    }),
    Effect.tapError((error) =>
      Effect.gen(function* () {
        const errorMessage = pipe(error.type, (type) => {
          if (type === 'validation') {
            return `Validation error: ${error.message}`
          }
          if (type === 'operation') {
            return `Upsert failed: ${error.message}`
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
        yield* Effect.sync(() => toast.success('Successfully saved!'))

        if (onSuccess) {
          yield* Effect.sync(() => onSuccess(dataWithId))
        }

        yield* Effect.log('Schema upsert successful', {
          id: dataWithId.id,
          tableName,
        })
      }),
    ),
  )
})

/**
 * Hook that provides upsert functionality for a given schema using Zero mutations with Effect-RX
 */
export const useSchemaUpsert = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (data: T & { id: string }) => void
    onError?: (error: SchemaUpsertError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const upsertRx = Rx.fn((data: T & { id?: string }) => {
    return createSchemaUpsertEffect({
      data,
      onError,
      onSuccess,
      schema,
      z,
    })
  })

  const mutation = useRxMutation(upsertRx)

  return mutation
}

/**
 * Combined mutation hook that provides all CRUD operations for a given schema
 * This is useful when you need multiple operations in the same component
 */
export const useSchemaMutation = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onInsertSuccess?: (data: T) => void
    onInsertError?: (error: SchemaInsertError) => void
    onUpdateSuccess?: (data: T & { id: string }) => void
    onUpdateError?: (error: SchemaUpdateError) => void
    onDeleteSuccess?: (id: string) => void
    onDeleteError?: (error: SchemaDeleteError) => void
    onUpsertSuccess?: (data: T & { id: string }) => void
    onUpsertError?: (error: SchemaUpsertError) => void
  } = {},
) => {
  const insert = useSchemaInsert(schema, {
    onError: options.onInsertError,
    onSuccess: options.onInsertSuccess,
  })

  const update = useSchemaUpdate(schema, {
    onError: options.onUpdateError,
    onSuccess: options.onUpdateSuccess,
  })

  const deleteEntity = useSchemaDelete(schema, {
    onError: options.onDeleteError,
    onSuccess: options.onDeleteSuccess,
  })

  const upsert = useSchemaUpsert(schema, {
    onError: options.onUpsertError,
    onSuccess: options.onUpsertSuccess,
  })

  return {
    delete: deleteEntity,
    insert,
    update,
    upsert,
  }
}

/**
 * Hook for cell-level updates (useful for table edit-in-place)
 * This provides a simpler API for updating a single field
 */
export const useSchemaCellUpdate = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (data: Partial<T> & { id: string }) => void
    onError?: (error: SchemaUpdateError) => void
    showToast?: boolean
  } = {},
) => {
  const { onSuccess, onError, showToast = false } = options
  const z = useZero()

  const updateCellRx = Rx.fn((params: { id: string; field: string; value: any }) => {
    const { id, field, value } = params
    const data = { id, [field]: value } as T & { id: string }

    return createSchemaUpdateEffect({
      data,
      onError,
      onSuccess: (updatedData) => {
        if (!showToast) {
          // Override the default toast for cell updates
          toast.dismiss()
        }
        if (onSuccess) {
          onSuccess(updatedData)
        }
      },
      schema,
      z,
    })
  })

  const mutation = useRxMutation(updateCellRx)

  return mutation
}

/*
 * Hook that provides collection data for a given schema using Zero queries with filtering support
 */
export const useSchemaCollection = <T>(params: { schema: SchemaType.Schema<T> }) => {
  const { schema } = params

  const entityTag = extractEntityTag(schema.ast)

  const filterKey = pipe(
    entityTag,
    Option.match({
      onNone: () => 'default',
      onSome: (tag) => `${pipe(tag, String.toLowerCase)}Filters`,
    }),
  )

  const queryFn = (z: ReturnType<typeof useZero>) => {
    return pipe(
      entityTag,
      Option.match({
        onNone: () => null,
        onSome: (tag) => {
          const tableName = mkZeroTableName(pipe(tag, String.capitalize))

          return getBaseEntitiesQuery(z, tableName)
        },
      }),
    )
  }

  const { info, limit, nextPage, pageSize, result } = useFilterQuery({
    filterKey,
    query: queryFn as (
      z: ReturnType<typeof useZero>,
    ) => Query<ZSchema, keyof ZSchema['tables'] & string, T>,
  })

  // Decode the collection data through the schema to get class instances with getters
  const decodedCollection = useMemo(() => {
    if (!result || info.type !== 'complete') {
      return []
    }

    const resultArray = Array.isArray(result) ? result : []

    return pipe(
      resultArray,
      Array.map((item) =>
        pipe(
          Effect.try(() =>
            Schema.decodeUnknownSync(schema)(item, { onExcessProperty: 'preserve' }),
          ),
          Effect.match({
            onFailure: () => null, // Skip items that fail to decode
            onSuccess: (entity) => entity,
          }),
          Effect.runSync,
        ),
      ),
      Array.filter((item): item is T => item !== null),
    )
  }, [result, info, schema])

  return {
    collection: decodedCollection,
    limit,
    loading: info.type !== 'complete',
    nextPage,
    pageSize,
  }
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

  return useMemo(() => {
    if (info.type !== 'complete') {
      return {
        entityOpt: Option.none(),
        error: null,
        loading: true,
      }
    }

    if (!data) {
      return {
        entityOpt: Option.none(),
        error: null,
        loading: false,
      }
    }

    // Decode the raw data through the schema to get a class instance with getters
    return pipe(
      Effect.try(() => Schema.decodeUnknownSync(schema)(data, { onExcessProperty: 'preserve' })),
      Effect.match({
        onFailure: (error) => ({
          entityOpt: Option.none(),
          error: `Schema decode error: ${error}`,
          loading: false,
        }),
        onSuccess: (entity) => ({
          entityOpt: Option.some(entity),
          error: null,
          loading: false,
        }),
      }),
      Effect.runSync,
    )
  }, [data, info, schema])
}
