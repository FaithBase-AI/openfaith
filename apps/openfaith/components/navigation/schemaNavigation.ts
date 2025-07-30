import { Rx } from '@effect-rx/rx-react'
import { useRxQuery } from '@openfaith/openfaith/shared/hooks/rxHooks'
import { discoverUiEntities, type EntityUiConfig } from '@openfaith/schema'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { Array, Effect, HashMap, Option, pipe, Ref, Schema, String } from 'effect'
import type { ComponentType } from 'react'
import { useMemo } from 'react'

export class IconLoadError extends Schema.TaggedError<IconLoadError>()('IconLoadError', {
  cause: Schema.optional(Schema.Unknown),
  iconName: Schema.String,
}) {}

const loadIcon = Effect.fn('loadIcon')(function* (iconName: string) {
  yield* Effect.annotateCurrentSpan('iconName', iconName)

  return yield* pipe(
    Effect.tryPromise({
      catch: (cause) => new IconLoadError({ cause, iconName }),
      try: () => import('@openfaith/ui'),
    }),
    Effect.flatMap((uiModule) =>
      Effect.gen(function* () {
        // Convert camelCase iconName to PascalCase using Effect's String utilities
        // Schema defines icons as: 'personIcon', 'folderPlusIcon', 'buildingIcon'
        // UI exports them as: 'PersonIcon', 'FolderPlusIcon', 'BuildingIcon'
        const pascalCaseIconName = pipe(iconName, String.capitalize)

        // Try different naming conventions
        const possibleNames = [
          iconName, // exact match (camelCase from schema)
          pascalCaseIconName, // PascalCase (e.g., personIcon -> PersonIcon)
        ]

        // Try to find the icon component using Effect's Array utilities
        for (const name of possibleNames) {
          const IconComponent = (uiModule as any)[name]
          if (IconComponent && typeof IconComponent === 'function') {
            return yield* Effect.succeed(IconComponent as ComponentType)
          }
        }

        // If no icon found, return CircleIcon as fallback
        return yield* Effect.succeed(CircleIcon as ComponentType)
      }),
    ),
    Effect.orElse(() => Effect.succeed(CircleIcon as ComponentType)),
  )
})

const iconCacheRef = Ref.unsafeMake(HashMap.empty<string, ComponentType>())

const getIconComponent = Effect.fn('getIconComponent')(function* (iconName?: string) {
  const effectiveIconName = iconName || 'circleIcon'
  yield* Effect.annotateCurrentSpan('effectiveIconName', effectiveIconName)

  const currentCache = yield* Ref.get(iconCacheRef)
  const cachedIcon = pipe(currentCache, HashMap.get(effectiveIconName))

  return yield* pipe(
    cachedIcon,
    Option.match({
      onNone: () =>
        Effect.gen(function* () {
          const IconComponent = yield* loadIcon(effectiveIconName)
          yield* Ref.update(iconCacheRef, (cache) =>
            pipe(cache, HashMap.set(effectiveIconName, IconComponent)),
          )
          return IconComponent
        }),
      onSome: (IconComponent) => Effect.succeed(IconComponent),
    }),
  )
})

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

export const getNavigationByModule = () => {
  const entities = discoverUiEntities()

  return pipe(
    entities,
    Array.groupBy((entity) => entity.navConfig.module),
  )
}
