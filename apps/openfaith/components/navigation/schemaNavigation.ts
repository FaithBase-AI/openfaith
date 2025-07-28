import { Rx } from '@effect-rx/rx'
import type { NavItem } from '@openfaith/openfaith/components/navigation/navShared'
import { useRxQuery } from '@openfaith/openfaith/shared/hooks/rxHooks'
import * as OfSchemas from '@openfaith/schema'
import { type FieldConfig, OfUiConfig } from '@openfaith/schema'
import { Array, Effect, HashMap, Option, Order, pipe, Record, Ref, Schema, SchemaAST } from 'effect'
import { createElement } from 'react'

// Tagged errors for icon loading
export class IconLoadError extends Schema.TaggedError<IconLoadError>()('IconLoadError', {
  cause: Schema.optional(Schema.Unknown),
  iconName: Schema.String,
}) {}

// Dynamic icon loading function using Effect.fn with proper error composition
const loadIcon = Effect.fn('loadIcon')(function* (iconName: string) {
  yield* Effect.annotateCurrentSpan('iconName', iconName)

  // Try to load the requested icon
  const loadRequestedIcon = pipe(
    Effect.tryPromise(() => import(`@openfaith/ui/icons/${iconName}`)),
    Effect.flatMap((iconModule) =>
      Effect.gen(function* () {
        // Get the default export or the named export that matches the icon name
        const moduleKeys = pipe(iconModule, Record.keys)
        const IconComponent =
          iconModule.default ||
          (iconName && (iconModule as any)[iconName]) ||
          (moduleKeys.length > 0 ? (iconModule as any)[moduleKeys[0]!] : null)

        if (!IconComponent) {
          yield* Effect.logWarning(`Icon ${iconName} not found in module`)
          return yield* Effect.fail(
            new IconLoadError({ cause: 'Icon not found in module', iconName }),
          )
        }

        return IconComponent
      }),
    ),
  )

  // Fallback to circle icon if requested icon fails
  const loadCircleIconFallback = pipe(
    Effect.logWarning(`Failed to load icon ${iconName}, using circle fallback`),
    Effect.flatMap(() => Effect.tryPromise(() => import('@openfaith/ui/icons/circleIcon'))),
    Effect.map((fallbackModule) => fallbackModule.CircleIcon),
  )

  // Ultimate fallback - return a simple div component
  const createDivFallback = pipe(
    Effect.logWarning(`Failed to load circle icon fallback, using div fallback`),
    Effect.flatMap(() =>
      Effect.succeed(() =>
        createElement('div', {
          className: 'w-4 h-4 bg-gray-400 rounded',
        }),
      ),
    ),
  )

  // Compose the effects with proper fallback chain
  return yield* pipe(
    loadRequestedIcon,
    Effect.orElse(() => loadCircleIconFallback),
    Effect.orElse(() => createDivFallback),
  )
})

// Icon cache to avoid re-importing - using Ref for mutable HashMap
const iconCacheRef = Ref.unsafeMake(HashMap.empty<string, React.ComponentType>())

// Get icon component (with caching) using Effect.fn
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

// Synchronous discovery that returns icon names instead of components
export const discoverEntityNavigation = (): Array<EntityNavConfig> => {
  return pipe(
    OfSchemas,
    Record.values,
    Array.filterMap((schema: unknown) => {
      // Skip if not a schema object
      if (!schema || typeof schema !== 'object' || !('ast' in schema) || !schema.ast) {
        return Option.none()
      }

      const schemaObj = schema as { ast: SchemaAST.AST }

      // Only process schemas with navigation config
      const uiConfig = SchemaAST.getAnnotation<FieldConfig>(OfUiConfig)(schemaObj.ast)
      const navConfig = Option.getOrUndefined(uiConfig)?.navigation

      if (!navConfig?.enabled) return Option.none()

      // Extract entity tag
      const tagOpt = extractEntityTagOpt(schemaObj)
      if (Option.isNone(tagOpt)) return Option.none()

      const tag = tagOpt.value

      // Generate nav item with icon name instead of component
      const navItem = {
        iconName: navConfig.icon,
        title: navConfig.title,
        url: navConfig.url || `/${tag.toLowerCase()}s`,
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

// Effect-based icon loading for all entities using Effect.fn
const loadAllEntityIcons = Effect.fn('loadAllEntityIcons')(function* (
  entities: Array<EntityNavConfig>,
) {
  yield* Effect.annotateCurrentSpan('entityCount', entities.length)

  const iconPairs = yield* pipe(
    entities,
    Array.map((entity) =>
      pipe(
        getIconComponent(entity.navItem.iconName),
        Effect.map((IconComponent) => [entity.tag, IconComponent] as const),
      ),
    ),
    Effect.all,
  )

  return HashMap.fromIterable(iconPairs)
})

// Create an Rx for loading entity icons
const entityIconsRx = Rx.family((entities: Array<EntityNavConfig>) =>
  Rx.fn(() => loadAllEntityIcons(entities)),
)

// Hook for loading icons dynamically using Effect-RX
export const useEntityIcons = (entities: Array<EntityNavConfig>) => {
  const query = useRxQuery(entityIconsRx(entities))

  return {
    iconComponents: pipe(
      query.dataOpt,
      Option.getOrElse(() => HashMap.empty<string, React.ComponentType>()),
    ),
    loading: query.isPending,
  }
}

// Group by CDM modules for organized navigation
export const getNavigationByModule = () => {
  const entities = discoverEntityNavigation()

  return pipe(
    entities,
    Array.groupBy((entity) => entity.navConfig.module),
  )
}

const extractEntityTagOpt = (schema: unknown): Option.Option<string> => {
  // Type guard to check if schema has the expected structure
  if (schema && typeof schema === 'object' && schema !== null) {
    const schemaObj = schema as Record<string, unknown>

    // Handle regular Struct with _tag field
    if (schemaObj.fields && typeof schemaObj.fields === 'object' && schemaObj.fields !== null) {
      const fields = schemaObj.fields as Record<string, unknown>
      if (fields._tag && typeof fields._tag === 'object' && fields._tag !== null) {
        const tagField = fields._tag as Record<string, unknown>
        if (Array.isArray(tagField.literals) && tagField.literals.length > 0) {
          const firstLiteral = tagField.literals[0]
          return typeof firstLiteral === 'string' ? Option.some(firstLiteral) : Option.none()
        }
      }
    }

    // Handle TaggedStruct
    if (typeof schemaObj.tag === 'string') {
      return Option.some(schemaObj.tag)
    }
  }

  return Option.none()
}
