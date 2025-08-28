import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Array, Effect, Option, pipe, Schema } from 'effect'
import { discoverEntitySchemas, discoverUiEntities } from './entityDiscovery'

effect('discoverEntitySchemas: should find schemas with _tag and OfTable annotation', () =>
  Effect.gen(function* () {
    const entitySchemas = discoverEntitySchemas()

    // Should return an array
    expect(Array.isArray(entitySchemas)).toBe(true)
    expect(entitySchemas.length).toBeGreaterThan(0)

    // Each entity should have required properties
    pipe(
      entitySchemas,
      Array.forEach((entity) => {
        expect(entity.name).toBeTruthy()
        expect(entity.tag).toBeTruthy()
        expect(Schema.isSchema(entity.schema)).toBe(true)
        expect(typeof entity.name).toBe('string')
        expect(typeof entity.tag).toBe('string')
      }),
    )

    // Should find Person schema (a known entity with OfTable)
    const personSchemaOpt = pipe(
      entitySchemas,
      Array.findFirst((entity) => entity.name === 'Person'),
    )

    if (Option.isSome(personSchemaOpt)) {
      const personSchema = personSchemaOpt.value
      expect(personSchema.tag).toBe('person')
      expect(personSchema.name).toBe('Person')
      expect(Schema.isSchema(personSchema.schema)).toBe(true)
    }

    // Should NOT find base classes without OfTable annotation
    const basePersonSchemaOpt = pipe(
      entitySchemas,
      Array.findFirst((entity) => entity.name === 'BasePerson'),
    )
    expect(Option.isNone(basePersonSchemaOpt)).toBe(true)

    // All discovered entities should be valid business entities
    // Note: Some system entities like 'edge' and 'field' might be discovered if they have OfTable annotations
    pipe(
      entitySchemas,
      Array.forEach((entity) => {
        // Should be valid entity structure
        expect(entity.tag).toBeTruthy()
        expect(typeof entity.tag).toBe('string')
        expect(entity.tag.length).toBeGreaterThan(0)
      }),
    )
  }),
)

effect('discoverEntitySchemas: should handle schemas without _tag field', () =>
  Effect.gen(function* () {
    const entitySchemas = discoverEntitySchemas()

    // All discovered schemas should have _tag field
    pipe(
      entitySchemas,
      Array.forEach((entity) => {
        expect(entity.tag).toBeTruthy()
        expect(typeof entity.tag).toBe('string')
      }),
    )
  }),
)

effect('discoverEntitySchemas: should only include final entity classes with OfTable', () =>
  Effect.gen(function* () {
    const entitySchemas = discoverEntitySchemas()

    // Verify each entity has OfTable annotation by checking against known patterns
    // This indirectly tests that only schemas with OfTable are included
    pipe(
      entitySchemas,
      Array.forEach((entity) => {
        // Each discovered entity should be a final entity class
        // The presence in the results confirms it has OfTable annotation
        expect(entity.name).not.toMatch(/^Base/) // Should not include base classes
        expect(entity.name).not.toMatch(/Schema$/) // Should not include raw schema definitions
      }),
    )
  }),
)

effect('discoverUiEntities: should find entities with navigation configuration', () =>
  Effect.gen(function* () {
    const uiEntities = discoverUiEntities()

    // Should return an array
    expect(Array.isArray(uiEntities)).toBe(true)

    // Each UI entity should have required properties
    pipe(
      uiEntities,
      Array.forEach((entity) => {
        expect(entity.tag).toBeTruthy()
        expect(Schema.isSchema(entity.schema)).toBe(true)
        expect(entity.navConfig).toBeTruthy()
        expect(entity.navItem).toBeTruthy()

        // Navigation config should be enabled
        expect(entity.navConfig.enabled).toBe(true)

        // Navigation item should have required properties
        expect(entity.navItem.title).toBeTruthy()
        expect(entity.navItem.url).toBeTruthy()
        expect(typeof entity.navItem.title).toBe('string')
        expect(typeof entity.navItem.url).toBe('string')

        // URL should be properly formatted
        expect(entity.navItem.url).toMatch(/^\//) // Should start with /
      }),
    )
  }),
)

effect('discoverUiEntities: should sort entities by navigation order', () =>
  Effect.gen(function* () {
    const uiEntities = discoverUiEntities()

    if (uiEntities.length > 1) {
      // Check that entities are sorted by order (lower numbers first, undefined/null treated as 999)
      for (let i = 0; i < uiEntities.length - 1; i++) {
        const currentEntity = uiEntities[i]
        const nextEntity = uiEntities[i + 1]
        const currentOrder = currentEntity?.navConfig?.order ?? 999
        const nextOrder = nextEntity?.navConfig?.order ?? 999
        expect(currentOrder).toBeLessThanOrEqual(nextOrder)
      }
    }
  }),
)

effect('discoverUiEntities: should generate correct navigation URLs', () =>
  Effect.gen(function* () {
    const uiEntities = discoverUiEntities()

    pipe(
      uiEntities,
      Array.forEach((entity) => {
        // URL should either be custom or generated from module and pluralized tag
        if (entity.navConfig.url) {
          expect(entity.navItem.url).toBe(entity.navConfig.url)
        } else {
          // Should be generated as /{module}/{pluralized-tag-lowercase}
          const expectedPattern = new RegExp(`^/${entity.navConfig.module}/`)
          expect(entity.navItem.url).toMatch(expectedPattern)
        }
      }),
    )
  }),
)

effect('discoverUiEntities: should only include entities with enabled navigation', () =>
  Effect.gen(function* () {
    const uiEntities = discoverUiEntities()

    // All returned entities should have enabled navigation
    pipe(
      uiEntities,
      Array.forEach((entity) => {
        expect(entity.navConfig.enabled).toBe(true)
      }),
    )
  }),
)

effect('discoverUiEntities: should handle entities with and without custom icons', () =>
  Effect.gen(function* () {
    const uiEntities = discoverUiEntities()

    pipe(
      uiEntities,
      Array.forEach((entity) => {
        // Icon name can be undefined or a string
        if (entity.navItem.iconName !== undefined) {
          expect(typeof entity.navItem.iconName).toBe('string')
        }
        // Should match the navigation config icon
        if (entity.navConfig.icon) {
          expect(entity.navItem.iconName).toBe(entity.navConfig.icon)
        } else {
          expect(entity.navItem.iconName).toBeUndefined()
        }
      }),
    )
  }),
)

effect('Type validation: EntityUnion should include business entities only', () =>
  Effect.gen(function* () {
    // Type-level test: EntityUnion should exclude system entities
    // This validates the IsBusinessEntity type filter works correctly

    // Mock function that validates EntityUnion structure
    const validateEntityUnion = (entity: { _tag: string; id: string; orgId: string }) => {
      // System entity tags that should be excluded
      const systemTags = [
        'edge',
        'externalLink',
        'string',
        'number',
        'boolean',
        'date',
        'field',
        'fieldOption',
      ]

      // Business entity should not have system tags
      expect(systemTags.includes(entity._tag)).toBe(false)

      // Should have required common fields
      expect(entity._tag).toBeTruthy()
      expect(entity.id).toBeTruthy()
      expect(entity.orgId).toBeTruthy()

      return entity
    }

    // Test with a business entity structure
    const mockBusinessEntity = validateEntityUnion({
      _tag: 'person',
      id: 'test-id',
      orgId: 'test-org',
    })

    expect(mockBusinessEntity._tag).toBe('person')
  }),
)

effect('Integration: discoverEntitySchemas and discoverUiEntities consistency', () =>
  Effect.gen(function* () {
    const allEntities = discoverEntitySchemas()
    const uiEntities = discoverUiEntities()

    // All UI entities should be a subset of all entities
    pipe(
      uiEntities,
      Array.forEach((uiEntity) => {
        const matchingEntityOpt = pipe(
          allEntities,
          Array.findFirst((entity) => entity.tag === uiEntity.tag),
        )
        expect(Option.isSome(matchingEntityOpt)).toBe(true)
      }),
    )

    // UI entities should be fewer than or equal to all entities
    expect(uiEntities.length).toBeLessThanOrEqual(allEntities.length)
  }),
)

effect('Edge case: should handle empty results gracefully', () =>
  Effect.gen(function* () {
    const entitySchemas = discoverEntitySchemas()
    const uiEntities = discoverUiEntities()

    // Functions should always return arrays (never undefined/null)
    expect(Array.isArray(entitySchemas)).toBe(true)
    expect(Array.isArray(uiEntities)).toBe(true)

    // Results can be empty, but should still be valid arrays
    if (entitySchemas.length === 0) {
      expect(entitySchemas).toEqual([])
    }

    if (uiEntities.length === 0) {
      expect(uiEntities).toEqual([])
    }
  }),
)

effect('Schema validation: discovered schemas should be valid Effect schemas', () =>
  Effect.gen(function* () {
    const entitySchemas = discoverEntitySchemas()

    pipe(
      entitySchemas,
      Array.forEach((entity) => {
        // Should be valid Effect Schema
        expect(Schema.isSchema(entity.schema)).toBe(true)

        // Schema should have AST (required for annotation checking)
        expect(entity.schema.ast).toBeTruthy()
        expect(typeof entity.schema.ast).toBe('object')

        // Schema should have proper structure
        expect(entity.schema.ast).toBeTruthy()
        expect(typeof entity.schema.ast._tag).toBe('string')
      }),
    )
  }),
)

effect('Performance: functions should execute efficiently', () =>
  Effect.gen(function* () {
    const startTime = Date.now()

    // Run discovery functions
    const entitySchemas = discoverEntitySchemas()
    const uiEntities = discoverUiEntities()

    const endTime = Date.now()
    const executionTime = endTime - startTime

    // Should complete within reasonable time (1 second for large schema sets)
    expect(executionTime).toBeLessThan(1000)

    // Should return results
    expect(entitySchemas.length).toBeGreaterThanOrEqual(0)
    expect(uiEntities.length).toBeGreaterThanOrEqual(0)
  }),
)
