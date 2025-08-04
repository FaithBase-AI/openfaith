import { Rx } from '@effect-rx/rx-react'
import { useRxQuery } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { discoverUiEntities, type EntityUiConfig } from '@openfaith/schema'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { getIconComponent } from '@openfaith/ui/shared/iconLoader'
import { Array, Effect, HashMap, Option, pipe } from 'effect'
import type { ComponentType } from 'react'
import { useMemo } from 'react'

// Effect function to load all entity icons
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

// Hook for loading multiple entity icons (used by navigation)
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

// Hook for loading a single entity icon (used by entity details)
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

// Convenience hook to get icon component for a specific entity type from a loaded icon map
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
