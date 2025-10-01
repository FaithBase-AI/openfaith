import { Atom, Result, useAtom as useAtomE, useAtomValue } from '@effect-atom/atom-react'
import {
  discoverUiEntities,
  type EntityUiConfig,
  extractEntityInfo,
  extractEntityTag,
  getSchemaByEntityType as getSchemaByEntityTypeBase,
  OfForeignKey,
  OfRelations,
  type RelationConfig,
} from '@openfaith/schema'
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
  HashSet,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  const entityIconsAtom = useMemo(() => Atom.make(loadAllEntityIcons(entities)), [entities])

  const result = useAtomValue(entityIconsAtom)

  // Handle Result type from @effect-atom
  const iconComponents = Result.match(result, {
    onFailure: () => HashMap.empty<string, ComponentType>(),
    onInitial: () => HashMap.empty<string, ComponentType>(),
    onSuccess: (value) => value.value,
  })

  return {
    iconComponents,
    isError: result._tag === 'Failure',
    isIdle: result._tag === 'Initial',
    isPending: result.waiting === true,
    isSuccess: result._tag === 'Success',
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

  const iconAtom = useMemo(() => Atom.make(getIconComponent(iconName)), [iconName])
  const result = useAtomValue(iconAtom)

  return {
    IconComponent: Result.match(result, {
      onFailure: () => CircleIcon,
      onInitial: () => CircleIcon,
      onSuccess: (value) => value.value,
    }),
    isError: result._tag === 'Failure',
    isSuccess: result._tag === 'Success',
    loading: result.waiting === true || result._tag === 'Initial',
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
 * Get schema for an entity type using the shared function
 */
export const getSchemaByEntityType = getSchemaByEntityTypeBase

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
    Array.map((r) => ({
      order: r.table?.order ?? 999,
      tag: r.targetEntityTag,
    })),
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

  const insertAtom = Atom.fn((data: T) => {
    return createSchemaMutationEffect({
      data,
      onError,
      onSuccess,
      operation: 'insert',
      schema,
      z,
    })
  })

  const [result, mutateAtom] = useAtomE(insertAtom)

  return {
    isPending: Result.isWaiting(result),
    mutate: mutateAtom,
  }
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

  const updateAtom = Atom.fn((data: T & { id: string }) => {
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

  const [result, mutateAtom] = useAtomE(updateAtom)

  return {
    isPending: Result.isWaiting(result),
    mutate: mutateAtom,
  }
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

  const deleteAtom = Atom.fn((id: string) => {
    return createSchemaMutationEffect({
      data: { id } as T & { id?: string },
      onError,
      onSuccess,
      operation: 'delete',
      schema,
      z,
    })
  })

  const [result, mutateAtom] = useAtomE(deleteAtom)

  return {
    isPending: Result.isWaiting(result),
    mutate: mutateAtom,
  }
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

  const upsertAtom = Atom.fn((data: T & { id?: string }) => {
    return createSchemaMutationEffect({
      data,
      onError,
      onSuccess,
      operation: 'upsert',
      schema,
      z,
    })
  })

  const [result, mutateAtom] = useAtomE(upsertAtom)

  return {
    isPending: Result.isWaiting(result),
    mutate: mutateAtom,
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
    onError?: (error: SchemaMutationError) => void
  } = {},
) => {
  const { onSuccess, onError } = options
  const z = useZero()

  const updateCellAtom = Atom.fn((params: { id: string; field: string; value: any }) => {
    return createSchemaMutationEffect({
      data: { id: params.id, [params.field]: params.value } as T & { id?: string },
      onError,
      onSuccess,
      operation: 'update',
      schema,
      showToast: false,
      z,
    })
  })

  const [result, mutateAtom] = useAtomE(updateCellAtom)

  return {
    isPending: Result.isWaiting(result),
    mutate: mutateAtom,
  }
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
export const buildSchemaCollectionQuery = <T>(
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
  context: string,
): Array<T> => {
  if (!result) {
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
    return decodeSchemaCollection(schema, result, 'useSchemaCollection')
  }, [result, schema])

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
    return decodeSchemaCollection(schema, result, 'useSchemaCollectionFull')
  }, [result, schema])

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

// Error class for listener cleanup failures
export class ListenerCleanupError extends Schema.TaggedError<ListenerCleanupError>()(
  'ListenerCleanupError',
  {
    cause: Schema.optional(Schema.Unknown),
    entityId: Schema.optional(Schema.String),
    entityType: Schema.optional(Schema.String),
    message: Schema.String,
  },
) {}

/**
 * Create a function to fetch and cache entity names
 *
 * IMPORTANT: This function returns a cleanup Effect that MUST be executed to prevent memory leaks.
 * The cleanup Effect removes all view listeners that were added during fetching.
 *
 * Usage in React:
 * ```typescript
 * useEffect(() => {
 *   const fetcher = createEntityNamesFetcher(z, cache, updateCache)
 *   const cleanupEffect = fetcher(entityType, entityIds)
 *   return () => {
 *     Effect.runSync(cleanupEffect())
 *   }
 * }, [entityType, entityIds])
 * ```
 *
 * @param z - Zero instance
 * @param entityNamesCache - HashMap of entity type to entity ID to display name
 * @param updateCache - Function to update the cache with new entity names
 * @returns A function that fetches entity names and returns a cleanup Effect
 */
export const createEntityNamesFetcher = (
  z: ReturnType<typeof useZero>,
  entityNamesCache: HashMap.HashMap<string, HashMap.HashMap<string, string>>,
  updateCache: (entityType: string, entityId: string, displayName: string) => void,
) => {
  return (entityType: string, entityIds: ReadonlyArray<string>) => {
    // Track listeners for cleanup
    const listeners: Array<{
      view: any
      listener: (result: any, resultType: string) => void
    }> = []

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

          const listener = (result: any, resultType: string) => {
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
          }

          view.addListener(listener)
          listeners.push({ listener, view })
        } catch (error) {
          Effect.logWarning(`Failed to fetch entity ${entityType}/${entityId}`, { error }).pipe(
            Effect.runSync,
          )
        }
      }),
    )

    // Return cleanup function that returns an Effect
    return () =>
      pipe(
        Effect.forEach(
          listeners,
          ({ view, listener }) =>
            Effect.try({
              catch: (cause) =>
                new ListenerCleanupError({
                  cause,
                  entityType,
                  message: 'Failed to remove listener during cleanup',
                }),
              try: () => view.removeListener(listener),
            }),
          { concurrency: 'unbounded' },
        ),
        Effect.catchAll((error) =>
          pipe(
            Effect.logWarning('Listener cleanup error (ignored)', { error }),
            Effect.map(() => []),
          ),
        ),
      )
  }
}

/**
 * Hook that manages entity name fetching with automatic cleanup
 * This hook encapsulates all the complexity of fetching entity names,
 * managing listeners, and cleaning them up properly.
 */
export const useEntityNamesFetcher = () => {
  const z = useZero()

  // State to store entity names cache using HashMap for better performance
  const [entityNamesCache, setEntityNamesCache] = useState<
    HashMap.HashMap<string, HashMap.HashMap<string, string>>
  >(HashMap.empty())

  // Helper to update the cache
  const updateCache = useCallback((entityType: string, entityId: string, displayName: string) => {
    setEntityNamesCache((prev) => {
      const existingType = pipe(prev, HashMap.get(entityType))

      return pipe(
        existingType,
        Option.match({
          onNone: () => pipe(prev, HashMap.set(entityType, HashMap.make([entityId, displayName]))),
          onSome: (existing) =>
            pipe(prev, HashMap.set(entityType, pipe(existing, HashMap.set(entityId, displayName)))),
        }),
      )
    })
  }, [])

  // Track cleanup functions for entity name fetchers using HashMap
  const cleanupFunctionsRef = useRef<
    HashMap.HashMap<string, () => Effect.Effect<any, never, never>>
  >(HashMap.empty())

  // Track which entity types and IDs we've already fetched to avoid duplicates using HashSet
  const fetchedEntitiesRef = useRef<HashSet.HashSet<string>>(HashSet.empty())

  // Create the entity names fetcher
  const fetcher = useMemo(
    () => createEntityNamesFetcher(z, entityNamesCache, updateCache),
    [z, entityNamesCache, updateCache],
  )

  // Function to fetch entity names with automatic cleanup management
  const fetchEntityNames = useCallback(
    (entityType: string, entityIds: ReadonlyArray<string>) => {
      if (entityIds.length === 0) {
        return
      }

      // Create a unique key for this fetch operation
      const fetchKey = `${entityType}:${pipe(entityIds, Array.join(','))}`

      // Only fetch if we haven't already fetched these specific entities
      const hasFetched = pipe(fetchedEntitiesRef.current, HashSet.has(fetchKey))
      if (!hasFetched) {
        // Mark as fetched
        fetchedEntitiesRef.current = pipe(fetchedEntitiesRef.current, HashSet.add(fetchKey))

        // Call the fetcher and store the cleanup function
        const cleanupEffect = fetcher(entityType, entityIds)

        // If there's an existing cleanup for this key, call it first
        const existingCleanupOpt = pipe(cleanupFunctionsRef.current, HashMap.get(fetchKey))
        if (Option.isSome(existingCleanupOpt)) {
          existingCleanupOpt.value().pipe(Effect.runSync)
        }

        // Store the new cleanup function
        cleanupFunctionsRef.current = pipe(
          cleanupFunctionsRef.current,
          HashMap.set(fetchKey, cleanupEffect),
        )
      }
    },
    [fetcher],
  )

  // Get entity names from cache for a specific type
  const getEntityNames = useCallback(
    (entityType: string): Record<string, string> => {
      return pipe(
        entityNamesCache,
        HashMap.get(entityType),
        Option.map((typeCache) => {
          // Convert HashMap to plain object
          const names: Record<string, string> = {}
          pipe(
            typeCache,
            HashMap.forEach((value, key) => {
              names[key] = value
            }),
          )
          return names
        }),
        Option.getOrElse(() => ({}) as Record<string, string>),
      )
    },
    [entityNamesCache],
  )

  // Cleanup all listeners on unmount
  useEffect(() => {
    return () => {
      // Run all cleanup effects in parallel
      Effect.forEach(
        pipe(cleanupFunctionsRef.current, HashMap.values, Array.fromIterable),
        (cleanup) => cleanup(),
        { concurrency: 'unbounded', discard: true },
      ).pipe(Effect.runSync)

      cleanupFunctionsRef.current = HashMap.empty()
      fetchedEntitiesRef.current = HashSet.empty()
    }
  }, [])

  // Clear fetched set when cache changes (for refresh scenarios)
  const clearFetchedCache = useCallback(() => {
    fetchedEntitiesRef.current = HashSet.empty()
  }, [])

  return {
    clearFetchedCache,
    entityNamesCache,
    fetchEntityNames,
    getEntityNames,
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
