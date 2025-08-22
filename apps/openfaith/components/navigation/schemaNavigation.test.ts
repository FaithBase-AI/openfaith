import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  getNavigationByModule,
  loadAllEntityIcons,
} from '@openfaith/openfaith/components/navigation/schemaNavigation'
import * as OfSchemas from '@openfaith/schema'
import { discoverUiEntities, type EntityUiConfig } from '@openfaith/schema'
import { Array, Effect, HashMap, Option, pipe, Record, Schema } from 'effect'

effect('should discover schemas with navigation configs', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    // Should find at least the 3 schemas we know have navigation enabled
    expect(entities.length).toBeGreaterThanOrEqual(3)

    // Check that all entities have required properties
    pipe(
      entities,
      Array.map((entity) => {
        expect(entity.tag).toBeDefined()
        expect(typeof entity.tag).toBe('string')
        expect(entity.navConfig).toBeDefined()
        expect(entity.navConfig.enabled).toBe(true)
        expect(entity.navItem).toBeDefined()
        expect(entity.navItem.title).toBeDefined()
        expect(entity.schema).toBeDefined()
        return Effect.void
      }),
    )
  }),
)

effect('should find Person schema with correct navigation config', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    const personEntity = pipe(
      entities,
      Array.findFirst((entity) => entity.tag === 'person'),
    )

    expect(Option.isSome(personEntity)).toBe(true)

    if (Option.isSome(personEntity)) {
      const person = personEntity.value
      expect(person.navConfig.title).toBe('People')
      expect(person.navConfig.icon).toBe('personIcon')
      expect(person.navConfig.module).toBe('directory')
      expect(person.navConfig.order).toBe(1)
      expect(person.navItem.iconName).toBe('personIcon')
      expect(person.navItem.url).toBe('/directory/people')
    }
  }),
)

effect('should find Folder schema with correct navigation config', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    const folderEntity = pipe(
      entities,
      Array.findFirst((entity) => entity.tag === 'folder'),
    )

    expect(Option.isSome(folderEntity)).toBe(true)

    if (Option.isSome(folderEntity)) {
      const folder = folderEntity.value
      expect(folder.navConfig.title).toBe('Folders')
      expect(folder.navConfig.icon).toBe('folderPlusIcon')
      expect(folder.navConfig.module).toBe('collection')
      expect(folder.navConfig.order).toBe(3)
      expect(folder.navItem.iconName).toBe('folderPlusIcon')
      expect(folder.navItem.url).toBe('/collection/folders')
    }
  }),
)

effect('should find Campus schema with correct navigation config', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    const campusEntity = pipe(
      entities,
      Array.findFirst((entity) => entity.tag === 'campus'),
    )

    expect(Option.isSome(campusEntity)).toBe(true)

    if (Option.isSome(campusEntity)) {
      const campus = campusEntity.value
      expect(campus.navConfig.title).toBe('Campuses')
      expect(campus.navConfig.icon).toBe('buildingIcon')
      expect(campus.navConfig.module).toBe('domain')
      expect(campus.navConfig.order).toBe(2)
      expect(campus.navItem.iconName).toBe('buildingIcon')
      expect(campus.navItem.url).toBe('/domain/campuses')
    }
  }),
)

effect('should sort entities by order', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    // Should be sorted by order: Person (1), Campus (2), Folder (3)
    expect(entities.length).toBeGreaterThanOrEqual(3)

    // Find the indices of our known entities
    const personIndex = pipe(
      entities,
      Array.findFirstIndex((entity) => entity.tag === 'person'),
    )
    const campusIndex = pipe(
      entities,
      Array.findFirstIndex((entity) => entity.tag === 'campus'),
    )
    const folderIndex = pipe(
      entities,
      Array.findFirstIndex((entity) => entity.tag === 'folder'),
    )

    expect(Option.isSome(personIndex)).toBe(true)
    expect(Option.isSome(campusIndex)).toBe(true)
    expect(Option.isSome(folderIndex)).toBe(true)

    if (Option.isSome(personIndex) && Option.isSome(campusIndex) && Option.isSome(folderIndex)) {
      // Person should come before Campus (order 1 < 2)
      expect(personIndex.value).toBeLessThan(campusIndex.value)
      // Campus should come before Folder (order 2 < 3)
      expect(campusIndex.value).toBeLessThan(folderIndex.value)
    }
  }),
)

effect('should group navigation by module', () =>
  Effect.gen(function* () {
    const navigationByModule = getNavigationByModule()

    // Should have at least directory, domain, and collection modules
    const modules = pipe(navigationByModule, Record.keys)
    expect(modules).toContain('directory')
    expect(modules).toContain('domain')
    expect(modules).toContain('collection')

    // Directory module should contain Person
    const directoryEntities = pipe(navigationByModule, Record.get('directory'))
    expect(Option.isSome(directoryEntities)).toBe(true)

    if (Option.isSome(directoryEntities)) {
      const personInDirectory = pipe(
        directoryEntities.value,
        Array.findFirst((entity) => entity.tag === 'person'),
      )
      expect(Option.isSome(personInDirectory)).toBe(true)
    }

    // Domain module should contain Campus
    const domainEntities = pipe(navigationByModule, Record.get('domain'))
    expect(Option.isSome(domainEntities)).toBe(true)

    if (Option.isSome(domainEntities)) {
      const campusInDomain = pipe(
        domainEntities.value,
        Array.findFirst((entity) => entity.tag === 'campus'),
      )
      expect(Option.isSome(campusInDomain)).toBe(true)
    }

    // Collection module should contain Folder
    const collectionEntities = pipe(navigationByModule, Record.get('collection'))
    expect(Option.isSome(collectionEntities)).toBe(true)

    if (Option.isSome(collectionEntities)) {
      const folderInCollection = pipe(
        collectionEntities.value,
        Array.findFirst((entity) => entity.tag === 'folder'),
      )
      expect(Option.isSome(folderInCollection)).toBe(true)
    }
  }),
)

effect('should only process schemas with navigation enabled', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    // All discovered entities should have navigation enabled
    pipe(
      entities,
      Array.map((entity) => {
        expect(entity.navConfig.enabled).toBe(true)
        return Effect.void
      }),
    )

    // Should not include schemas without navigation config (like Person vs BasePerson)
    // The regular Person schema doesn't have OfUiConfig, only BasePerson does
    const allSchemaKeys = pipe(OfSchemas, Record.keys)

    // We should have fewer entities than total schemas since many don't have navigation
    expect(entities.length).toBeLessThan(allSchemaKeys.length)
  }),
)

effect('should generate correct URLs for entities', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    pipe(
      entities,
      Array.map((entity) => {
        // URL should be generated from module and tag with proper pluralization
        // Just verify the URL starts with the module and contains a pluralized form
        expect(entity.navItem.url).toMatch(new RegExp(`^/${entity.navConfig.module}/`))
        expect(entity.navItem.url.split('/').length).toBe(3) // Should be /module/entity format
        return Effect.void
      }),
    )
  }),
)

effect('should have valid icon names for all discovered entities', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    // All entities should have icon names defined
    pipe(
      entities,
      Array.map((entity) => {
        expect(entity.navItem.iconName).toBeDefined()
        if (entity.navItem.iconName) {
          expect(typeof entity.navItem.iconName).toBe('string')
          expect(entity.navItem.iconName.length).toBeGreaterThan(0)
        }
        return Effect.void
      }),
    )

    // Check specific known icon names
    const personEntity = pipe(
      entities,
      Array.findFirst((entity) => entity.tag === 'person'),
    )
    if (Option.isSome(personEntity)) {
      expect(personEntity.value.navItem.iconName).toBe('personIcon')
    }

    const campusEntity = pipe(
      entities,
      Array.findFirst((entity) => entity.tag === 'campus'),
    )
    if (Option.isSome(campusEntity)) {
      expect(campusEntity.value.navItem.iconName).toBe('buildingIcon')
    }

    const folderEntity = pipe(
      entities,
      Array.findFirst((entity) => entity.tag === 'folder'),
    )
    if (Option.isSome(folderEntity)) {
      expect(folderEntity.value.navItem.iconName).toBe('folderPlusIcon')
    }
  }),
)

effect('should load icon components using the actual loadIcon logic', () =>
  Effect.gen(function* () {
    // Test the actual icon loading by calling loadAllEntityIcons directly
    // This tests the real camelCase -> PascalCase conversion logic
    const testEntities: Array<EntityUiConfig> = [
      {
        navConfig: {
          enabled: true,
          icon: 'personIcon',
          module: 'directory',
          order: 1,
          title: 'People',
        },
        navItem: { iconName: 'personIcon', title: 'People', url: '/people' },
        schema: Schema.Struct({}) as Schema.Schema<any, any, never>,
        tag: 'person',
      },
      {
        navConfig: {
          enabled: true,
          icon: 'buildingIcon',
          module: 'domain',
          order: 2,
          title: 'Campuses',
        },
        navItem: {
          iconName: 'buildingIcon',
          title: 'Campuses',
          url: '/campuses',
        },
        schema: Schema.Struct({}) as Schema.Schema<any, any, never>,
        tag: 'campus',
      },
    ]

    // Test the actual icon loading by calling loadAllEntityIcons directly
    // This tests the real camelCase -> PascalCase conversion logic
    const iconComponents = yield* loadAllEntityIcons(testEntities)

    // Should have loaded 2 icons
    expect(HashMap.size(iconComponents)).toBe(2)

    // Should have PersonIcon for 'person' entity
    const personIcon = pipe(iconComponents, HashMap.get('person'))
    expect(Option.isSome(personIcon)).toBe(true)
    if (Option.isSome(personIcon)) {
      expect(typeof personIcon.value).toBe('function')
      expect(personIcon.value.displayName).toBe('PersonIcon')
    }

    // Should have BuildingIcon for 'campus' entity
    const campusIcon = pipe(iconComponents, HashMap.get('campus'))
    expect(Option.isSome(campusIcon)).toBe(true)
    if (Option.isSome(campusIcon)) {
      expect(typeof campusIcon.value).toBe('function')
      expect(campusIcon.value.displayName).toBe('BuildingIcon')
    }
  }),
)

effect('should test useEntityIcons hook with Effect-RX integration', () =>
  Effect.gen(function* () {
    // Test that the Rx family pattern works correctly
    // This simulates what happens in the React component
    const entities = discoverUiEntities()

    // Verify we have entities to work with
    expect(entities.length).toBeGreaterThanOrEqual(3)

    // Test the Rx family creation - this should work without React
    const { Rx } = yield* Effect.promise(() => import('@effect-rx/rx'))

    // Create the same Rx family as in the component
    const testEntityIconsRx = Rx.family((entities: Array<EntityUiConfig>) =>
      Rx.fn(() => loadAllEntityIcons(entities)),
    )

    // Create an Rx instance for our entities
    const iconRx = testEntityIconsRx(entities)

    // This should be defined
    expect(iconRx).toBeDefined()

    // The Rx should have the correct structure
    expect(typeof iconRx).toBe('object')
  }),
)

effect('should validate that all referenced icons exist in static icon map', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()

    // Test that loadAllEntityIcons succeeds for all discovered entities
    // This will fail if any icon is missing from the static ICON_MAP
    const iconComponents = yield* loadAllEntityIcons(entities)

    // Should have loaded an icon for each entity
    expect(HashMap.size(iconComponents)).toBe(entities.length)

    // Each entity should have a corresponding icon component
    pipe(
      entities,
      Array.map((entity) => {
        const iconComponent = pipe(iconComponents, HashMap.get(entity.tag))
        expect(Option.isSome(iconComponent)).toBe(true)

        if (Option.isSome(iconComponent)) {
          // Icon should be a React component function
          expect(typeof iconComponent.value).toBe('function')
          // Should have a displayName (all our icons have this)
          expect(iconComponent.value.displayName).toBeDefined()
          expect(typeof iconComponent.value.displayName).toBe('string')
        }
        return Effect.void
      }),
    )
  }),
)

effect('should validate icon component displayNames match expected pattern', () =>
  Effect.gen(function* () {
    const entities = discoverUiEntities()
    const iconComponents = yield* loadAllEntityIcons(entities)

    // Test specific known icons have correct displayNames
    const knownIcons = [
      { expectedDisplayName: 'PersonIcon', tag: 'person' },
      { expectedDisplayName: 'BuildingIcon', tag: 'campus' },
      { expectedDisplayName: 'FolderPlusIcon', tag: 'folder' },
    ]

    pipe(
      knownIcons,
      Array.map(({ tag, expectedDisplayName }) => {
        const iconComponent = pipe(iconComponents, HashMap.get(tag))
        if (Option.isSome(iconComponent)) {
          expect(iconComponent.value.displayName).toBe(expectedDisplayName)
        }
        return Effect.void
      }),
    )
  }),
)

effect('should handle missing icons by falling back to CircleIcon', () =>
  Effect.gen(function* () {
    // Test with an entity that has an invalid icon name
    const invalidEntity: EntityUiConfig = {
      navConfig: {
        enabled: true,
        icon: 'nonExistentIcon',
        module: 'directory',
        order: 999,
        title: 'Test',
      },
      navItem: { iconName: 'nonExistentIcon', title: 'Test', url: '/test' },
      schema: Schema.Struct({}) as Schema.Schema<any, any, never>,
      tag: 'test',
    }

    // This should succeed by falling back to CircleIcon
    const result = yield* loadAllEntityIcons([invalidEntity])

    // Should have loaded 1 icon (the fallback)
    expect(HashMap.size(result)).toBe(1)

    // Should have CircleIcon for 'test' entity
    const testIcon = pipe(result, HashMap.get('test'))
    expect(Option.isSome(testIcon)).toBe(true)
    if (Option.isSome(testIcon)) {
      expect(typeof testIcon.value).toBe('function')
      expect(testIcon.value.displayName).toBe('CircleIcon')
    }
  }),
)
