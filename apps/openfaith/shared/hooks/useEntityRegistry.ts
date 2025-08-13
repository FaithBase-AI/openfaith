import { discoverUiEntities, type EntityUiConfig } from '@openfaith/schema'
import { pluralize, singularize } from '@openfaith/shared'
import {
  CircleIcon,
  entityIconComponentsAtom,
  entityUiCacheAtom,
  isEntityUiCacheValid,
  useStableMemo,
} from '@openfaith/ui'
import { Array, Equivalence, HashMap, Option, pipe, String } from 'effect'
import { useAtom } from 'jotai'
import type { ComponentType } from 'react'
import { useMemo } from 'react'

/**
 * Unified entity registry that provides cached access to all entity-related data
 * Used by navigation, quick actions, forms, tables, and any other entity lookups
 */
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

  // Create quick action configs
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
  const { getEntityByUrlParam, getEntityIcon } = useEntityRegistry()

  const entityOpt = useMemo(
    () => getEntityByUrlParam(module, entityParam),
    [module, entityParam, getEntityByUrlParam],
  )

  const iconOpt = useStableMemo(
    () =>
      pipe(
        entityOpt,
        Option.map((e) => getEntityIcon(e.tag)),
        Option.getOrElse(() => CircleIcon),
      ),
    [entityOpt, getEntityIcon],
    Equivalence.tuple(
      Option.getEquivalence(
        Equivalence.struct({
          tag: Equivalence.string,
        }),
      ),
      Equivalence.strict(),
    ),
  )

  return { entity: entityOpt, icon: iconOpt }
}

/**
 * Hook to get schema for an entity type with caching
 */
export const useCachedEntitySchema = (entityType: string) => {
  const { getEntitySchema } = useEntityRegistry()
  return useMemo(() => getEntitySchema(entityType), [entityType, getEntitySchema])
}
