import { Rx } from '@effect-rx/rx-react'
import type { NavItem } from '@openfaith/openfaith/components/navigation/navShared'
import { useRxQuery } from '@openfaith/openfaith/shared/hooks/rxHooks'
import * as OfSchemas from '@openfaith/schema'
import { type FieldConfig, OfUiConfig } from '@openfaith/schema'
import { pluralize } from '@openfaith/shared'
import { BuildingIcon } from '@openfaith/ui/icons/buildingIcon'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { FolderPlusIcon } from '@openfaith/ui/icons/folderPlusIcon'
import { PersonIcon } from '@openfaith/ui/icons/personIcon'
import { Array, Effect, HashMap, Option, Order, pipe, Record, Ref, Schema, SchemaAST } from 'effect'
import { useMemo } from 'react'

export class IconLoadError extends Schema.TaggedError<IconLoadError>()('IconLoadError', {
  cause: Schema.optional(Schema.Unknown),
  iconName: Schema.String,
}) {}

const ICON_MAP = HashMap.fromIterable([
  ['personIcon', PersonIcon as React.ComponentType],
  ['buildingIcon', BuildingIcon as React.ComponentType],
  ['folderPlusIcon', FolderPlusIcon as React.ComponentType],
  ['circleIcon', CircleIcon as React.ComponentType],
])

const loadIcon = Effect.fn('loadIcon')(function* (iconName: string) {
  yield* Effect.annotateCurrentSpan('iconName', iconName)
  const iconFromMap = pipe(ICON_MAP, HashMap.get(iconName))

  return yield* pipe(
    iconFromMap,
    Option.match({
      onNone: () => {
        return Effect.succeed(CircleIcon)
      },
      onSome: (IconComponent) => {
        return Effect.succeed(IconComponent)
      },
    }),
  )
})

const iconCacheRef = Ref.unsafeMake(HashMap.empty<string, React.ComponentType>())

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

export interface EntityNavConfig {
  schema: { ast: SchemaAST.AST }
  tag: string
  navConfig: NonNullable<FieldConfig['navigation']>
  navItem: Omit<NavItem, 'icon'> & { iconName?: string }
}

export const discoverEntityNavigation = (): Array<EntityNavConfig> => {
  return pipe(
    OfSchemas,
    Record.toEntries,
    Array.filterMap(([, schema]) => {
      if (!Schema.isSchema(schema)) {
        return Option.none()
      }

      const schemaObj = schema

      const uiConfig = SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(schemaObj.ast)
      const navConfig = Option.getOrUndefined(uiConfig)?.navigation

      if (!navConfig?.enabled) return Option.none()

      const tagOpt = extractEntityTagOpt(schemaObj)
      if (Option.isNone(tagOpt)) return Option.none()

      const tag = tagOpt.value

      const navItem = {
        iconName: navConfig.icon,
        title: navConfig.title,
        url: navConfig.url || `/${pluralize(tag.toLowerCase())}`,
      }

      return Option.some({
        navConfig,
        navItem,
        schema: schemaObj,
        tag,
      })
    }),
    Array.sort(
      Order.mapInput(Order.number, (item: EntityNavConfig) => item.navConfig.order ?? 999),
    ),
  )
}

export const loadAllEntityIcons = Effect.fn('loadAllEntityIcons')(function* (
  entities: Array<EntityNavConfig>,
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

export const useEntityIcons = (entities: Array<EntityNavConfig>) => {
  const entityIconsRx = useMemo(() => Rx.make(() => loadAllEntityIcons(entities)), [entities])

  const query = useRxQuery(entityIconsRx)

  return {
    iconComponents: pipe(
      query.dataOpt,
      Option.getOrElse(() => HashMap.empty<string, React.ComponentType>()),
    ),
    isError: query.isError,
    isSuccess: query.isSuccess,
    loading: query.isPending || query.isIdle,
  }
}

export const getNavigationByModule = () => {
  const entities = discoverEntityNavigation()

  return pipe(
    entities,
    Array.groupBy((entity) => entity.navConfig.module),
  )
}

const extractEntityTagOpt = (schema: { ast: SchemaAST.AST }): Option.Option<string> => {
  if (SchemaAST.isTypeLiteral(schema.ast)) {
    const propertySignatures = schema.ast.propertySignatures
    const tagProperty = pipe(
      propertySignatures,
      Array.findFirst((prop) => prop.name === '_tag'),
    )

    if (Option.isSome(tagProperty)) {
      const tagAST = tagProperty.value.type
      if (SchemaAST.isLiteral(tagAST) && typeof tagAST.literal === 'string') {
        return Option.some(tagAST.literal)
      }
    }
  }

  return Option.none()
}
