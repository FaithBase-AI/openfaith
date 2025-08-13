import { describe, expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { assertNone, assertSome } from '@openfaith/bun-test/assert'
import type { EntityUiConfig } from '@openfaith/schema'
import { pluralize, singularize } from '@openfaith/shared'
import { CircleIcon } from '@openfaith/ui/icons/circleIcon'
import { PersonIcon } from '@openfaith/ui/icons/personIcon'
import {
  type CachedEntityConfig,
  ENTITY_UI_CACHE_TTL,
  type EntityUiCache,
  isEntityUiCacheValid,
} from '@openfaith/ui/shared/globalState'
import { Array, Effect, HashMap, Option, pipe, Schema, String } from 'effect'
import type { ComponentType } from 'react'

// Create test schemas
const PersonTestSchema = Schema.Struct({
  firstName: Schema.String,
  id: Schema.String,
  lastName: Schema.String,
})

const GroupTestSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
})

// Mock entities for testing
const mockEntities: Array<EntityUiConfig> = [
  {
    navConfig: {
      enabled: true,
      module: 'directory',
      title: 'Directory',
    },
    navItem: {
      iconName: 'personIcon',
      title: 'People',
      url: '/app/directory/people',
    },
    schema: PersonTestSchema,
    tag: 'Person',
  },
  {
    navConfig: {
      enabled: true,
      module: 'directory',
      title: 'Directory',
    },
    navItem: {
      iconName: 'groupIcon',
      title: 'Groups',
      url: '/app/directory/groups',
    },
    schema: GroupTestSchema,
    tag: 'Group',
  },
  {
    navConfig: {
      enabled: false,
      module: 'system',
      title: 'System',
    },
    navItem: {
      iconName: 'circleIcon',
      title: 'Hidden',
      url: '/app/system/hidden',
    },
    schema: Schema.Struct({ id: Schema.String }),
    tag: 'HiddenEntity',
  },
  {
    navConfig: {
      enabled: true,
      module: 'schedule',
      title: 'Schedule',
    },
    navItem: {
      iconName: 'calendarIcon',
      title: 'Events',
      url: '/app/schedule/events',
    },
    schema: Schema.Struct({ id: Schema.String }),
    tag: 'Event',
  },
]

// Helper to create a valid cache
const createValidCache = (entities: Array<CachedEntityConfig>, ageMs = 0): EntityUiCache => ({
  entities,
  timestamp: Date.now() - ageMs,
})

// Helper to create cached entity config from EntityUiConfig
const toCachedConfig = (entity: EntityUiConfig): CachedEntityConfig => ({
  enabled: entity.navConfig.enabled,
  iconName: entity.navItem.iconName || 'circleIcon',
  module: entity.navConfig.module,
  tag: entity.tag,
  title: entity.navItem.title,
  url: entity.navItem.url,
})

describe('Entity Registry Core Logic', () => {
  effect('entity filtering and transformation', () =>
    Effect.gen(function* () {
      // Test cache discovery logic
      const cache = createValidCache(
        pipe(mockEntities, Array.take(2), Array.map(toCachedConfig)),
        1000,
      )

      // Validate cache is valid
      expect(isEntityUiCacheValid(cache)).toBe(true)

      // Map cached entities back to full entities
      const mappedEntities = pipe(
        cache.entities,
        Array.filterMap((cached) =>
          pipe(
            mockEntities,
            Array.findFirst((e) => e.tag === cached.tag),
          ),
        ),
      )

      expect(mappedEntities).toHaveLength(2)
      const tags = pipe(
        mappedEntities,
        Array.map((e) => e.tag),
      )
      expect(tags).toEqual(['Person', 'Group'])
    }),
  )

  effect('expired cache handling', () =>
    Effect.gen(function* () {
      const expiredCache = createValidCache([], ENTITY_UI_CACHE_TTL + 1000)
      expect(isEntityUiCacheValid(expiredCache)).toBe(false)

      const nullCache = null
      expect(isEntityUiCacheValid(nullCache)).toBe(false)

      const recentCache = createValidCache([], 500)
      expect(isEntityUiCacheValid(recentCache)).toBe(true)
    }),
  )

  effect('entity lookup by tag', () =>
    Effect.gen(function* () {
      const entityByTag = pipe(
        mockEntities,
        Array.map((e) => [e.tag, e] as const),
        HashMap.fromIterable,
      )

      const personOpt = pipe(entityByTag, HashMap.get('Person'))
      assertSome(personOpt, mockEntities[0])

      const nonExistentOpt = pipe(entityByTag, HashMap.get('NonExistent'))
      assertNone(nonExistentOpt)
    }),
  )

  effect('entity lookup by URL param', () =>
    Effect.gen(function* () {
      const entityByUrlParam = pipe(
        mockEntities,
        Array.map((e) => {
          const urlParam = pipe(e.tag, String.toLowerCase, pluralize)
          return [urlParam, e] as const
        }),
        HashMap.fromIterable,
      )

      // Test finding Person by 'people'
      const peopleOpt = pipe(entityByUrlParam, HashMap.get('people'))
      assertSome(peopleOpt, mockEntities[0])

      // Test finding Group by 'groups'
      const groupsOpt = pipe(entityByUrlParam, HashMap.get('groups'))
      assertSome(groupsOpt, mockEntities[1])

      // Test non-existent
      const nonExistentOpt = pipe(entityByUrlParam, HashMap.get('nonexistent'))
      assertNone(nonExistentOpt)

      // Filter by module
      const personOpt = pipe(
        entityByUrlParam,
        HashMap.get('people'),
        Option.filter((e) => e.navConfig.module === 'directory'),
      )
      assertSome(personOpt, mockEntities[0])

      const wrongModuleOpt = pipe(
        entityByUrlParam,
        HashMap.get('people'),
        Option.filter((e) => e.navConfig.module === 'schedule'),
      )
      assertNone(wrongModuleOpt)
    }),
  )

  effect('entities by module grouping', () =>
    Effect.gen(function* () {
      const enabledEntities = pipe(
        mockEntities,
        Array.filter((entity) => entity.navConfig.enabled),
      )

      const entitiesByModule = pipe(
        enabledEntities,
        Array.groupBy((entity) => entity.navConfig.module),
      )

      // Check directory module
      const directoryEntities = entitiesByModule.directory
      expect(directoryEntities).toBeDefined()
      if (directoryEntities) {
        expect(directoryEntities).toHaveLength(2)
        const tags = pipe(
          directoryEntities,
          Array.map((e) => e.tag),
        )
        expect(tags).toEqual(['Person', 'Group'])
      }

      // Check schedule module
      const scheduleEntities = entitiesByModule.schedule
      expect(scheduleEntities).toBeDefined()
      if (scheduleEntities) {
        expect(scheduleEntities).toHaveLength(1)
        const tags = pipe(
          scheduleEntities,
          Array.map((e) => e.tag),
        )
        expect(tags).toEqual(['Event'])
      }

      // System module should not exist (HiddenEntity is disabled)
      const systemEntities = entitiesByModule.system
      expect(systemEntities).toBeUndefined()
    }),
  )

  effect('quick actions generation', () =>
    Effect.gen(function* () {
      const quickActions = pipe(
        mockEntities,
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
      )

      expect(quickActions).toHaveLength(3)

      // Check quick action keys
      const keys = pipe(
        quickActions,
        Array.map((qa) => qa.quickActionKey),
      )
      expect(keys).toEqual(['createPerson', 'createGroup', 'createEvent'])

      // Check create titles
      const titles = pipe(
        quickActions,
        Array.map((qa) => qa.createTitle),
      )
      expect(titles).toEqual(['Create Person', 'Create Group', 'Create Event'])

      // Find specific quick action
      const personAction = pipe(
        quickActions,
        Array.findFirst((qa) => qa.quickActionKey === 'createPerson'),
      )
      expect(Option.isSome(personAction)).toBe(true)
      if (Option.isSome(personAction)) {
        expect(personAction.value.tag).toBe('Person')
        expect(personAction.value.createTitle).toBe('Create Person')
      }
    }),
  )

  effect('icon component handling', () =>
    Effect.gen(function* () {
      const iconComponents = HashMap.fromIterable([
        ['Person', PersonIcon as ComponentType],
        ['Group', CircleIcon as ComponentType],
      ])

      // Get icon for existing entity
      const personIcon = pipe(
        iconComponents,
        HashMap.get('Person'),
        Option.getOrElse(() => CircleIcon as ComponentType),
      )
      expect(personIcon).toBe(PersonIcon)

      // Get icon with fallback
      const unknownIcon = pipe(
        iconComponents,
        HashMap.get('Unknown'),
        Option.getOrElse(() => CircleIcon as ComponentType),
      )
      expect(unknownIcon).toBe(CircleIcon)
    }),
  )

  effect('schema retrieval', () =>
    Effect.gen(function* () {
      const entityByTag = pipe(
        mockEntities,
        Array.map((e) => [e.tag, e] as const),
        HashMap.fromIterable,
      )

      const getEntitySchema = (tag: string) =>
        pipe(
          entityByTag,
          HashMap.get(tag),
          Option.map((e) => e.schema),
        )

      const personSchemaOpt = getEntitySchema('Person')
      expect(Option.isSome(personSchemaOpt)).toBe(true)
      if (Option.isSome(personSchemaOpt)) {
        expect(personSchemaOpt.value).toBe(PersonTestSchema)
      }

      const groupSchemaOpt = getEntitySchema('Group')
      expect(Option.isSome(groupSchemaOpt)).toBe(true)
      if (Option.isSome(groupSchemaOpt)) {
        expect(groupSchemaOpt.value).toBe(GroupTestSchema)
      }

      const nonExistentOpt = getEntitySchema('NonExistent')
      assertNone(nonExistentOpt)
    }),
  )
})

// Type-level validation tests
describe('Type validation', () => {
  effect('EntityUiConfig structure is correct', () =>
    Effect.gen(function* () {
      // This function validates the type structure at compile time
      const validateEntityConfig = (config: EntityUiConfig) => {
        const { tag, navConfig, navItem, schema } = config

        // Type checks - these would fail compilation if types were wrong
        expect(typeof tag).toBe('string')
        expect(typeof navConfig.module).toBe('string')
        expect(typeof navConfig.enabled).toBe('boolean')
        expect(typeof navItem.title).toBe('string')
        expect(typeof navItem.url).toBe('string')
        expect(schema).toBeDefined()

        return true
      }

      // Test with each mock entity
      pipe(
        mockEntities,
        Array.forEach((entity) => {
          expect(validateEntityConfig(entity)).toBe(true)
        }),
      )
    }),
  )

  effect('CachedEntityConfig matches expected structure', () =>
    Effect.gen(function* () {
      const validateCachedConfig = (config: CachedEntityConfig) => {
        const { tag, module, title, url, iconName, enabled } = config

        // Type validation
        expect(typeof tag).toBe('string')
        expect(typeof module).toBe('string')
        expect(typeof title).toBe('string')
        expect(typeof url).toBe('string')
        expect(typeof iconName).toBe('string')
        expect(typeof enabled).toBe('boolean')

        return true
      }

      const cachedConfigs = pipe(mockEntities, Array.map(toCachedConfig))

      pipe(
        cachedConfigs,
        Array.forEach((config) => {
          expect(validateCachedConfig(config)).toBe(true)
        }),
      )
    }),
  )

  effect('Registry type interfaces match expected structure', () =>
    Effect.gen(function* () {
      // Validate that the registry would return the expected types
      type ExpectedTypes = {
        entities: Array<EntityUiConfig>
        entitiesByModule: Record<string, Array<EntityUiConfig>>
        entityByTag: HashMap.HashMap<string, EntityUiConfig>
        entityByUrlParam: HashMap.HashMap<string, EntityUiConfig>
        getEntityByTag: (tag: string) => Option.Option<EntityUiConfig>
        getEntityByUrlParam: (module: string, entityParam: string) => Option.Option<EntityUiConfig>
        getEntityIcon: (tag: string) => ComponentType
        getEntitySchema: (tag: string) => Option.Option<Schema.Schema.Any>
        getQuickAction: (quickActionKey: string) => Option.Option<any>
        iconComponents: HashMap.HashMap<string, ComponentType>
        quickActions: Array<any>
      }

      // This function validates type compatibility at compile time
      const validateTypes = (_types: ExpectedTypes) => true

      // Create mock implementations to verify type structure
      const mockRegistry: ExpectedTypes = {
        entities: mockEntities,
        entitiesByModule: {
          directory: [mockEntities[0]!, mockEntities[1]!],
          schedule: [mockEntities[3]!],
        },
        entityByTag: HashMap.fromIterable(
          pipe(
            mockEntities,
            Array.map((e) => [e.tag, e] as const),
          ),
        ),
        entityByUrlParam: HashMap.empty(),
        getEntityByTag: () => Option.none(),
        getEntityByUrlParam: () => Option.none(),
        getEntityIcon: () => CircleIcon,
        getEntitySchema: () => Option.none(),
        getQuickAction: () => Option.none(),
        iconComponents: HashMap.empty(),
        quickActions: [],
      }

      expect(validateTypes(mockRegistry)).toBe(true)
    }),
  )
})
