import { Rx } from '@effect-rx/rx-react'
import { useRxMutation, useRxQuery } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { discoverUiEntities, type EntityUiConfig } from '@openfaith/schema/shared/entityDiscovery'
import { extractEntityInfo, extractEntityTag } from '@openfaith/schema/shared/introspection'
import { OfForeignKey, OfRelations, type RelationConfig } from '@openfaith/schema/shared/schema'
import { getEntityId, mkZeroTableName, nullOp, pluralize, singularize } from '@openfaith/shared'
import { toast } from '@openfaith/ui/components/ui/sonner'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { useFilterQuery } from '@openfaith/ui/shared/hooks/useFilterQuery'
import { getIconComponent } from '@openfaith/ui/shared/iconLoader'
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
  Clock,
  Effect,
  HashMap,
  Option,
  Order,
  pipe,
  Schema,
  SchemaAST,
  type Schema as SchemaType,
  String,
} from 'effect'
import type { Option as OptionType } from 'effect/Option'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { ComponentType } from 'react'
import { useEffect, useMemo } from 'react'

export type CachedEntityConfig = {
  tag: string
  module: string
  title: string
  url: string
  iconName: string
  enabled: boolean
}

export type EntityUiCache = {
  entities: Array<CachedEntityConfig>
  timestamp: number
}

export const ENTITY_UI_CACHE_TTL = 24 * 60 * 60 * 1000

export const isEntityUiCacheValid = (cache: EntityUiCache | null): boolean => {
  if (!cache) {
    return false
  }
  return Date.now() - cache.timestamp < ENTITY_UI_CACHE_TTL
}

export const entityUiCacheAtom = atomWithStorage<EntityUiCache | null>('entityUiCache', null)

export const entityIconComponentsAtom = atom<HashMap.HashMap<string, ComponentType>>(
  HashMap.empty<string, ComponentType>(),
)

export const loadAllEntityIcons = Effect.fn('loadAllEntityIcons')(function* (
  entities: Array<EntityUiConfig>,
) {
  yield* Effect.annotateCurrentSpan('entityCount', entities.length)

  const iconPairs = yield* pipe(
    entities,
    Array.map((entity) =>
      pipe(
        getIconComponent(entity.navItem.iconName),
        Effect.map((IconComponent) => {
          return [entity.tag, IconComponent] as const
        }),
      ),
    ),
    Effect.all,
  )

  return HashMap.fromIterable(iconPairs)
})

export const useEntityIcons = (entities: Array<EntityUiConfig>) => {
  const entityIconsRx = useMemo(() => Rx.make(() => loadAllEntityIcons(entities)), [entities])

  const query = useRxQuery(entityIconsRx)

  return {
    iconComponents: pipe(
      query.dataOpt,
      Option.getOrElse(() => HashMap.empty<string, ComponentType>()),
    ),
    isError: query.isError,
    isSuccess: query.isSuccess,
    loading: query.isPending || query.isIdle,
  }
}

export const useEntityIcon = (entityType: string) => {
  const entities = discoverUiEntities()

  const entityConfigOpt = useMemo(
    () =>
      pipe(
        entities,
        Array.findFirst((entity) => entity.tag === entityType),
      ),
    [entities, entityType],
  )

  const iconName = pipe(
    entityConfigOpt,
    Option.map((entity) => entity.navItem.iconName),
    Option.getOrElse(() => 'circleIcon'),
  )

  const iconRx = useMemo(() => Rx.make(() => getIconComponent(iconName)), [iconName])
  const query = useRxQuery(iconRx)

  return {
    IconComponent: pipe(
      query.dataOpt,
      Option.getOrElse(() => CircleIcon),
    ),
    isError: query.isError,
    isSuccess: query.isSuccess,
    loading: query.isPending || query.isIdle,
  }
}

export const useIconFromMap = (
  iconComponents: HashMap.HashMap<string, ComponentType>,
  entityType: string,
) => {
  return useMemo(
    () =>
      pipe(
        iconComponents,
        HashMap.get(entityType),
        Option.getOrElse(() => CircleIcon),
      ),
    [iconComponents, entityType],
  )
}

export const useEntityRegistry = () => {
  const [cache] = useAtom(entityUiCacheAtom)
  const [iconComponents] = useAtom(entityIconComponentsAtom)

  const discoveredEntities = useMemo(() => discoverUiEntities(), [])

  const entities = useMemo(() => {
    if (cache && isEntityUiCacheValid(cache) && cache.entities.length > 0) {
      return pipe(
        cache.entities,
        Array.filterMap((cached) =>
          pipe(
            discoveredEntities,
            Array.findFirst((e) => e.tag === cached.tag),
          ),
        ),
      )
    }
    return discoveredEntities
  }, [cache, discoveredEntities])

  const entitiesByModule = useMemo(
    () =>
      pipe(
        entities,
        Array.filter((entity) => entity.navConfig.enabled),
        Array.groupBy((entity) => entity.navConfig.module),
      ),
    [entities],
  )

  const quickActions = useMemo(
    () =>
      pipe(
        entities,
        Array.filterMap((entity) => {
          if (!entity.navConfig.enabled) {
            return Option.none()
          }

          const quickActionKey = `create${pipe(entity.tag, String.capitalize)}`
          const title = typeof entity.navItem.title === 'string' ? entity.navItem.title : 'Item'
          const createTitle = `Create ${singularize(title)}`

          return Option.some({
            ...entity,
            createTitle,
            quickActionKey,
          })
        }),
      ),
    [entities],
  )

  const entityByTag = useMemo(
    () =>
      pipe(
        entities,
        Array.map((e) => [e.tag, e] as const),
        HashMap.fromIterable,
      ),
    [entities],
  )

  const entityByUrlParam = useMemo(
    () =>
      pipe(
        entities,
        Array.map((e) => {
          const urlParam = pipe(e.tag, String.toLowerCase, pluralize)
          return [urlParam, e] as const
        }),
        HashMap.fromIterable,
      ),
    [entities],
  )

  const getEntityByTag = (tag: string): Option.Option<EntityUiConfig> =>
    pipe(entityByTag, HashMap.get(tag))

  const getEntityByUrlParam = (
    module: string,
    entityParam: string,
  ): Option.Option<EntityUiConfig> =>
    pipe(
      entityByUrlParam,
      HashMap.get(entityParam),
      Option.filter((e) => e.navConfig.module === module),
    )

  const getEntitySchema = (tag: string) =>
    pipe(
      entityByTag,
      HashMap.get(tag),
      Option.map((e) => e.schema),
    )

  const getEntityIcon = (tag: string): ComponentType =>
    pipe(
      iconComponents,
      HashMap.get(tag),
      Option.getOrElse(() => CircleIcon),
    )

  const getQuickAction = (quickActionKey: string) =>
    pipe(
      quickActions,
      Array.findFirst((qa) => qa.quickActionKey === quickActionKey),
    )

  return {
    entities,
    entitiesByModule,
    entityByTag,
    entityByUrlParam,
    getEntityByTag,
    getEntityByUrlParam,
    getEntityIcon,
    getEntitySchema,
    getQuickAction,
    iconComponents,
    quickActions,
  }
}

/**
 * Hook to get a specific entity by URL parameters (module + entity plural)
 */
export const useCachedEntityByUrl = (module: string, entityParam: string) => {
  const { getEntityByUrlParam } = useEntityRegistry()

  return useMemo(
    () => getEntityByUrlParam(module, entityParam),
    [module, entityParam, getEntityByUrlParam],
  )
}

// ===== Cache Initialization =====

/**
 * Helper to create cache entity config from EntityUiConfig
 */
const createCacheEntityConfig = (entity: EntityUiConfig): CachedEntityConfig => ({
  enabled: entity.navConfig.enabled,
  iconName: entity.navItem.iconName || 'circleIcon',
  module: entity.navConfig.module,
  tag: entity.tag,
  title: entity.navItem.title,
  url: entity.navItem.url,
})

/**
 * Hook that initializes the entity UI cache and loads all entity icons
 */
export const useEntityCacheInitializer = () => {
  const [, setCache] = useAtom(entityUiCacheAtom)
  const [, setIconComponents] = useAtom(entityIconComponentsAtom)

  // Discover entities (live values)
  const entities = useMemo(() => discoverUiEntities(), [])

  useEffect(() => {
    // Create Effect program for loading icons and updating cache
    const program = pipe(
      loadAllEntityIcons(entities),
      Effect.tap((iconMap) =>
        Effect.sync(() => {
          // Only update if we have icons loaded
          if (HashMap.size(iconMap) > 0) {
            setIconComponents(iconMap)
          }
        }),
      ),
      Effect.flatMap(() => Clock.currentTimeMillis),
      Effect.flatMap((timestamp) =>
        Effect.sync(() => {
          const cacheData: EntityUiCache = {
            entities: pipe(entities, Array.map(createCacheEntityConfig)),
            timestamp,
          }
          setCache(cacheData)
        }),
      ),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* Effect.logError('Failed to load entity icons', { error })
          // Still update cache with entity data even if icons fail
          const timestamp = yield* Clock.currentTimeMillis
          const cacheData: EntityUiCache = {
            entities: pipe(entities, Array.map(createCacheEntityConfig)),
            timestamp,
          }
          setCache(cacheData)
        }),
      ),
    )

    // Run the Effect program
    Effect.runPromise(program)
  }, [entities, setCache, setIconComponents])
}

// ===== Schema Lookups (Updated to use Registry) =====

/**
 * Get schema for an entity type using the entity registry
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
  const { getEntitySchema } = useEntityRegistry()

  return useMemo(() => {
    return getEntitySchema(entityType)
  }, [entityType, getEntitySchema])
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

// ===== Schema CRUD Operations =====

// Generic mutation error class for all CRUD operations
export class SchemaMutationError extends Schema.TaggedError<SchemaMutationError>()(
  'SchemaMutationError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    operation: Schema.Literal('insert', 'update', 'delete', 'upsert'),
    tableName: Schema.optional(Schema.String),
    type: Schema.Literal('validation', 'operation'),
  },
) {}

// Legacy error classes for backward compatibility - kept as separate tagged errors
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

/**
 * Utility to extract table name from schema
 */
const getTableNameFromSchema = <T>(schema: SchemaType.Schema<T>): Option.Option<string> => {
  const entityTag = extractEntityTag(schema.ast)
  return pipe(
    entityTag,
    Option.map((tag) => mkZeroTableName(tag)),
  )
}

/**
 * Format error message based on error type and operation
 */
const formatMutationErrorMessage = (error: SchemaMutationError): string => {
  if (error.type === 'validation') {
    return `Validation error: ${error.message}`
  }
  if (error.type === 'operation') {
    const operationText =
      error.operation === 'insert'
        ? 'Insert'
        : error.operation === 'update'
          ? 'Update'
          : error.operation === 'delete'
            ? 'Delete'
            : 'Upsert'
    return `${operationText} failed: ${error.message}`
  }
  return 'Unknown error occurred'
}

/**
 * Generic schema mutation effect
 */
const createSchemaMutationEffect = Effect.fn('createSchemaMutationEffect')(function* <T>(params: {
  data?: T | (T & { id?: string })
  id?: string
  operation: 'insert' | 'update' | 'delete' | 'upsert'
  schema: SchemaType.Schema<T>
  z: ReturnType<typeof useZero>
  onSuccess?: (result: any) => void
  onError?: (error: SchemaMutationError) => void
  showToast?: boolean
}) {
  const { data, id, operation, schema, z, onSuccess, onError, showToast = true } = params

  const tableNameOpt = getTableNameFromSchema(schema)

  if (Option.isNone(tableNameOpt)) {
    return yield* Effect.fail(
      new SchemaMutationError({
        message: 'Table name not found - entity tag missing from schema',
        operation,
        tableName: undefined,
        type: 'validation',
      }),
    )
  }

  const tableName = tableNameOpt.value

  // Prepare data based on operation
  let mutationData: any
  if (operation === 'delete') {
    mutationData = { id }
  } else if (operation === 'insert' || operation === 'upsert') {
    mutationData = {
      id: (data as any)?.id || getEntityId(tableName),
      ...data,
    }
  } else {
    mutationData = data
  }

  const mutator = getBaseMutator(z, tableName, operation)

  yield* pipe(
    Effect.tryPromise({
      catch: (cause) =>
        new SchemaMutationError({
          cause,
          message: `Failed to ${operation} in table ${tableName}`,
          operation,
          tableName,
          type: 'operation',
        }),
      try: () => mutator(mutationData),
    }),
    Effect.tapError((error) =>
      Effect.gen(function* () {
        const errorMessage = formatMutationErrorMessage(error)
        yield* Effect.sync(() => toast.error(errorMessage))

        if (onError) {
          yield* Effect.sync(() => onError(error))
        }
      }),
    ),
    Effect.tap(() =>
      Effect.gen(function* () {
        if (showToast) {
          const successMessage =
            operation === 'insert'
              ? 'Successfully created!'
              : operation === 'update'
                ? 'Successfully updated!'
                : operation === 'delete'
                  ? 'Successfully deleted!'
                  : 'Successfully saved!'
          yield* Effect.sync(() => toast.success(successMessage))
        }

        if (onSuccess) {
          const result = operation === 'delete' ? id : mutationData
          yield* Effect.sync(() => onSuccess(result))
        }

        yield* Effect.log(`Schema ${operation} successful`, {
          id: operation === 'delete' ? id : mutationData.id,
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
    onError?: (error: SchemaMutationError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const insertRx = Rx.fn((data: T) => {
    return createSchemaMutationEffect({
      data,
      onError,
      onSuccess,
      operation: 'insert',
      schema,
      z,
    })
  })

  const mutation = useRxMutation(insertRx)

  return mutation
}

/**
 * Hook that provides update functionality for a given schema using Zero mutations with Effect-RX
 */
export const useSchemaUpdate = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (data: T & { id: string }) => void
    onError?: (error: SchemaMutationError) => void
    showToast?: boolean
  } = {},
) => {
  const { onSuccess, onError, showToast = true } = options
  const z = useZero()

  const updateRx = Rx.fn((data: T & { id: string }) => {
    return createSchemaMutationEffect({
      data: data as T & { id?: string },
      onError,
      onSuccess,
      operation: 'update',
      schema,
      showToast,
      z,
    })
  })

  const mutation = useRxMutation(updateRx)

  return mutation
}

/**
 * Hook that provides delete functionality for a given schema using Zero mutations with Effect-RX
 */
export const useSchemaDelete = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (id: string) => void
    onError?: (error: SchemaMutationError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const deleteRx = Rx.fn((id: string) => {
    return createSchemaMutationEffect({
      id,
      onError,
      onSuccess,
      operation: 'delete',
      schema,
      z,
    })
  })

  const mutation = useRxMutation(deleteRx)

  return mutation
}

/**
 * Hook that provides upsert functionality for a given schema using Zero mutations with Effect-RX
 */
export const useSchemaUpsert = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (data: T & { id: string }) => void
    onError?: (error: SchemaMutationError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const upsertRx = Rx.fn((data: T & { id?: string }) => {
    return createSchemaMutationEffect({
      data,
      onError,
      onSuccess,
      operation: 'upsert',
      schema,
      z,
    })
  })

  const mutation = useRxMutation(upsertRx)

  return mutation
}

/**
 * Hook for cell-level updates (useful for table edit-in-place)
 * This provides a simpler API for updating a single field
 */
export const useSchemaCellUpdate = <T>(
  schema: SchemaType.Schema<T>,
  options: {
    onSuccess?: (data: Partial<T> & { id: string }) => void
    onError?: (error: SchemaMutationError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const updateCellRx = Rx.fn((params: { id: string; field: string; value: any }) => {
    const { id, field, value } = params
    const data = { id, [field]: value } as T & { id: string }

    return createSchemaMutationEffect({
      data: data as T & { id?: string },
      onError,
      onSuccess,
      operation: 'update',
      schema,
      showToast: false, // Suppress toast for cell updates
      z,
    })
  })

  const mutation = useRxMutation(updateCellRx)

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
    onInsertError?: (error: SchemaMutationError) => void
    onUpdateSuccess?: (data: T & { id: string }) => void
    onUpdateError?: (error: SchemaMutationError) => void
    onDeleteSuccess?: (id: string) => void
    onDeleteError?: (error: SchemaMutationError) => void
    onUpsertSuccess?: (data: T & { id: string }) => void
    onUpsertError?: (error: SchemaMutationError) => void
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
 * Common schema collection query builder
 */
const buildSchemaCollectionQuery = <T>(
  schema: SchemaType.Schema<T>,
  z: ReturnType<typeof useZero>,
  limit?: number,
) => {
  const entityTag = extractEntityTag(schema.ast)

  return pipe(
    entityTag,
    Option.match({
      onNone: nullOp,
      onSome: (tag) => {
        const tableName = mkZeroTableName(pipe(tag, String.capitalize))
        const baseQuery = getBaseEntitiesQuery(z, tableName)
        return limit ? baseQuery.limit(limit) : baseQuery
      },
    }),
  )
}

/**
 * Common schema collection decoder
 */
const decodeSchemaCollection = <T>(
  schema: SchemaType.Schema<T>,
  result: unknown,
  info: { type: string },
  context: string,
): Array<T> => {
  if (!result || info.type !== 'complete') {
    return []
  }

  // Check if result is array-like without using native Array.isArray
  const resultArray =
    result && typeof result === 'object' && 'length' in result ? (result as Array<unknown>) : []

  return pipe(
    resultArray,
    Array.map((item) =>
      pipe(
        Schema.decodeUnknown(schema)(item, { onExcessProperty: 'preserve' }),
        Effect.match({
          onFailure: (error) => {
            Effect.logError(`Failed to decode entity in ${context}`, {
              error,
              item,
              schema: schema.ast._tag,
            }).pipe(Effect.runSync)
            return null // Skip items that fail to decode
          },
          onSuccess: (entity) => entity,
        }),
        Effect.runSync,
      ),
    ),
    Array.filter((item): item is T => item !== null),
  )
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
    return buildSchemaCollectionQuery(schema, z)
  }

  const { info, limit, nextPage, pageSize, result } = useFilterQuery({
    filterKey,
    query: queryFn as (
      z: ReturnType<typeof useZero>,
    ) => Query<ZSchema, keyof ZSchema['tables'] & string, T>,
  })

  // Decode the collection data through the schema to get class instances with getters
  const decodedCollection = useMemo(() => {
    return decodeSchemaCollection(schema, result, info, 'useSchemaCollection')
  }, [result, info, schema])

  return {
    collection: decodedCollection,
    limit,
    loading: info.type !== 'complete',
    nextPage,
    pageSize,
  }
}

/**
 * Hook that provides collection data for a given schema using Zero queries WITHOUT filtering
 * This is useful for components that need the full collection like select inputs
 */
export const useSchemaCollectionFull = <T>(params: {
  schema: SchemaType.Schema<T>
  limit?: number
}) => {
  const { schema, limit = 100 } = params
  const z = useZero()

  const query = useMemo(() => {
    return buildSchemaCollectionQuery(schema, z, limit)
  }, [z, schema, limit])

  const [result, info] = useQuery(query as Parameters<typeof useQuery>[0])

  // Decode the collection data through the schema to get class instances with getters
  const decodedCollection = useMemo(() => {
    return decodeSchemaCollection(schema, result, info, 'useSchemaCollectionFull')
  }, [result, info, schema])

  return {
    collection: decodedCollection,
    loading: info.type !== 'complete',
  }
}

// Schema Entity Hook
export interface SchemaEntityResult<T> {
  entityOpt: OptionType<T>
  loading: boolean
  error: string | null
}

/**
 * Decode entity data through its schema to get proper class instance with getters
 */
export const decodeEntityThroughSchema = <T>(
  schema: SchemaType.Schema<T>,
  data: unknown,
): OptionType<T> => {
  return pipe(
    Schema.decodeUnknown(schema)(data, { onExcessProperty: 'preserve' }),
    Effect.match({
      onFailure: (error) => {
        Effect.logError('Failed to decode entity', { data, error }).pipe(Effect.runSync)
        return Option.none()
      },
      onSuccess: (entity) => Option.some(entity),
    }),
    Effect.runSync,
  )
}

/**
 * Extract display name from entity, with fallbacks for common patterns
 */
export const extractEntityDisplayName = (
  entity: any,
  entityType: string,
  entityId: string,
): string => {
  // First try the displayName getter if it exists
  if ('displayName' in entity && typeof entity.displayName === 'string') {
    return entity.displayName
  }

  // Try common fields
  if (entity.name) return entity.name
  if (entity.firstName || entity.lastName) {
    return `${entity.firstName || ''} ${entity.lastName || ''}`.trim()
  }

  // Entity-specific fallbacks
  if (entityType === 'address') {
    const streetLine1 = entity.streetLine1 || ''
    const city = entity.city || ''
    if (streetLine1 && city) {
      return `${streetLine1}, ${city}`
    }
    if (streetLine1) return streetLine1
    if (city) return city
  }

  if (entityType === 'phoneNumber') {
    const number = entity.number || ''
    const location = entity.location || ''
    if (number) {
      return location ? `${location}: ${number}` : number
    }
  }

  // Default to ID if no display name can be constructed
  return entityId
}

/**
 * Create a function to fetch and cache entity names
 * @param z - Zero instance
 * @param entityNamesCache - HashMap of entity type to entity ID to display name
 * @param updateCache - Function to update the cache with new entity names
 */
export const createEntityNamesFetcher = (
  z: ReturnType<typeof useZero>,
  entityNamesCache: HashMap.HashMap<string, HashMap.HashMap<string, string>>,
  updateCache: (entityType: string, entityId: string, displayName: string) => void,
) => {
  return (entityType: string, entityIds: ReadonlyArray<string>) => {
    // Get cached names for this entity type
    const cached = pipe(
      entityNamesCache,
      HashMap.get(entityType),
      Option.getOrElse(() => HashMap.empty<string, string>()),
    )

    // Find missing IDs
    const missingIds = pipe(
      entityIds,
      Array.filter((id) => pipe(cached, HashMap.has(id), (has) => !has)),
    )

    if (Array.isEmptyArray(missingIds)) return

    // Convert entity type to table name
    const tableName = mkZeroTableName(pipe(entityType, String.capitalize))

    // Fetch each missing entity
    pipe(
      missingIds,
      Array.forEach((entityId) => {
        try {
          // Create query for this entity
          const query = getBaseEntityQuery(z, tableName, entityId)
          const view = query.materialize()

          view.addListener((result: any, resultType: string) => {
            if (resultType === 'complete' && result) {
              // Get the schema for this entity type
              const entitySchemaOpt = getSchemaByEntityType(entityType)

              let displayName = entityId // Default to ID

              if (Option.isSome(entitySchemaOpt)) {
                // Decode through schema to get class instance
                const decodedEntityOpt = decodeEntityThroughSchema(entitySchemaOpt.value, result)

                if (Option.isSome(decodedEntityOpt)) {
                  displayName = extractEntityDisplayName(
                    decodedEntityOpt.value,
                    entityType,
                    entityId,
                  )
                }
              } else {
                // No schema found, try basic patterns directly on raw result
                displayName = extractEntityDisplayName(result, entityType, entityId)
              }

              // Update the cache
              updateCache(entityType, entityId, displayName)
            }
          })
        } catch (error) {
          Effect.logWarning(`Failed to fetch entity ${entityType}/${entityId}`, { error }).pipe(
            Effect.runSync,
          )
        }
      }),
    )
  }
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
        onNone: nullOp,
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
    const entityOpt = decodeEntityThroughSchema(schema, data)

    return pipe(
      entityOpt,
      Option.match({
        onNone: () => ({
          entityOpt: Option.none(),
          error: 'Failed to decode entity through schema',
          loading: false,
        }),
        onSome: (entity) => ({
          entityOpt: Option.some(entity),
          error: null,
          loading: false,
        }),
      }),
    )
  }, [data, info, schema])
}
