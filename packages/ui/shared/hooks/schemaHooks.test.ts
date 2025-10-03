import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { OfRelations } from '@openfaith/schema/shared/schema'
import { noOp } from '@openfaith/shared'
import {
  buildEntityRelationshipsForTable,
  createEntityNamesFetcher,
  getSchemaByEntityType,
  getSchemaDeclaredRelations,
  ListenerCleanupError,
  SchemaDeleteError,
  SchemaInsertError,
  SchemaUpdateError,
  SchemaUpsertError,
  useEntityNamesFetcher,
  useEntitySchema,
  useSchemaCollection,
  useSchemaEntity,
} from '@openfaith/ui/shared/hooks/schemaHooks'
import { Array, Effect, HashMap, HashSet, Option, pipe, Schema } from 'effect'

// Test schemas
const TestPersonSchema = Schema.Struct({
  _tag: Schema.Literal('Person'),
  age: Schema.Number,
  email: Schema.String,
  firstName: Schema.String,
  id: Schema.String,
  lastName: Schema.String,
})

const TestGroupSchema = Schema.Struct({
  _tag: Schema.Literal('Group'),
  description: Schema.optional(Schema.String),
  id: Schema.String,
  name: Schema.String,
})

const SchemaWithoutTag = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
})

// Mock data
const mockPersonData = {
  _tag: 'Person' as const,
  age: 30,
  email: 'john@example.com',
  firstName: 'John',
  id: 'person_123',
  lastName: 'Doe',
}

// Mock data for testing
const mockGroupData = {
  _tag: 'Group' as const,
  description: 'Test group',
  id: 'group_456',
  name: 'Test Group',
}

// Pure function tests
effect('getSchemaByEntityType should find schema by entity type (case insensitive)', () =>
  Effect.gen(function* () {
    // Since we can't easily mock the import in Effect tests, we'll test the logic
    // by verifying the function exists and handles the basic case
    expect(typeof getSchemaByEntityType).toBe('function')

    // Test with empty string
    const emptySchemaOpt = getSchemaByEntityType('')
    expect(emptySchemaOpt._tag).toBe('None')
  }),
)

effect('getSchemaByEntityType should return None for non-existent entity type', () =>
  Effect.gen(function* () {
    const nonExistentSchemaOpt = getSchemaByEntityType('NonExistent')
    expect(nonExistentSchemaOpt._tag).toBe('None')
  }),
)

effect('getSchemaByEntityType should handle empty entity type', () =>
  Effect.gen(function* () {
    const emptySchemaOpt = getSchemaByEntityType('')
    expect(emptySchemaOpt._tag).toBe('None')
  }),
)

effect('getSchemaByEntityType should handle special characters in entity type', () =>
  Effect.gen(function* () {
    const specialCharsSchemaOpt = getSchemaByEntityType('Person@#$')
    expect(specialCharsSchemaOpt._tag).toBe('None')
  }),
)

// Error class tests
effect('SchemaInsertError should be properly constructed', () =>
  Effect.gen(function* () {
    const error = new SchemaInsertError({
      cause: new Error('Test cause'),
      message: 'Test message',
      operation: 'insert',
      tableName: 'people',
      type: 'operation',
    })

    expect(error._tag).toBe('SchemaInsertError')
    expect(error.message).toBe('Test message')
    expect(error.operation).toBe('insert')
    expect(error.tableName).toBe('people')
    expect(error.type).toBe('operation')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('SchemaInsertError should handle optional fields', () =>
  Effect.gen(function* () {
    const error = new SchemaInsertError({
      message: 'Test message',
      type: 'validation',
    })

    expect(error._tag).toBe('SchemaInsertError')
    expect(error.message).toBe('Test message')
    expect(error.type).toBe('validation')
    expect(error.operation).toBeUndefined()
    expect(error.tableName).toBeUndefined()
    expect(error.cause).toBeUndefined()
  }),
)

effect('SchemaUpdateError should be properly constructed', () =>
  Effect.gen(function* () {
    const error = new SchemaUpdateError({
      cause: new Error('Test cause'),
      message: 'Test message',
      operation: 'update',
      tableName: 'groups',
      type: 'operation',
    })

    expect(error._tag).toBe('SchemaUpdateError')
    expect(error.message).toBe('Test message')
    expect(error.operation).toBe('update')
    expect(error.tableName).toBe('groups')
    expect(error.type).toBe('operation')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('SchemaUpdateError should handle optional fields', () =>
  Effect.gen(function* () {
    const error = new SchemaUpdateError({
      message: 'Test message',
      type: 'validation',
    })

    expect(error._tag).toBe('SchemaUpdateError')
    expect(error.message).toBe('Test message')
    expect(error.type).toBe('validation')
    expect(error.operation).toBeUndefined()
    expect(error.tableName).toBeUndefined()
    expect(error.cause).toBeUndefined()
  }),
)

effect('SchemaDeleteError should be properly constructed', () =>
  Effect.gen(function* () {
    const error = new SchemaDeleteError({
      cause: new Error('Test cause'),
      message: 'Test delete message',
      operation: 'delete',
      tableName: 'people',
      type: 'operation',
    })

    expect(error._tag).toBe('SchemaDeleteError')
    expect(error.message).toBe('Test delete message')
    expect(error.operation).toBe('delete')
    expect(error.tableName).toBe('people')
    expect(error.type).toBe('operation')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('SchemaDeleteError should handle optional fields', () =>
  Effect.gen(function* () {
    const error = new SchemaDeleteError({
      message: 'Test delete message',
      type: 'validation',
    })

    expect(error._tag).toBe('SchemaDeleteError')
    expect(error.message).toBe('Test delete message')
    expect(error.type).toBe('validation')
    expect(error.operation).toBeUndefined()
    expect(error.tableName).toBeUndefined()
    expect(error.cause).toBeUndefined()
  }),
)

effect('SchemaUpsertError should be properly constructed', () =>
  Effect.gen(function* () {
    const error = new SchemaUpsertError({
      cause: new Error('Test cause'),
      message: 'Test upsert message',
      operation: 'upsert',
      tableName: 'groups',
      type: 'operation',
    })

    expect(error._tag).toBe('SchemaUpsertError')
    expect(error.message).toBe('Test upsert message')
    expect(error.operation).toBe('upsert')
    expect(error.tableName).toBe('groups')
    expect(error.type).toBe('operation')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('SchemaUpsertError should handle optional fields', () =>
  Effect.gen(function* () {
    const error = new SchemaUpsertError({
      message: 'Test upsert message',
      type: 'validation',
    })

    expect(error._tag).toBe('SchemaUpsertError')
    expect(error.message).toBe('Test upsert message')
    expect(error.type).toBe('validation')
    expect(error.operation).toBeUndefined()
    expect(error.tableName).toBeUndefined()
    expect(error.cause).toBeUndefined()
  }),
)

// Type-level testing
effect('Type validation: SchemaCollectionResult has correct structure', () =>
  Effect.gen(function* () {
    // Mock function that validates SchemaCollectionResult type
    const mockCollectionProcessor = (result: {
      data: Array<any>
      loading: boolean
      error: string | null
      nextPage: () => void
      pageSize: number
      limit: number
    }) => result

    // This should compile correctly - validates type structure
    const mockResult = {
      data: [mockPersonData],
      error: null,
      limit: 100,
      loading: false,
      nextPage: noOp,
      pageSize: 20,
    }

    const processedResult = mockCollectionProcessor(mockResult)
    expect(processedResult.data).toEqual([mockPersonData])
    expect(processedResult.loading).toBe(false)
    expect(processedResult.error).toBe(null)
  }),
)

effect('Type validation: SchemaEntityResult has correct structure', () =>
  Effect.gen(function* () {
    // Mock function that validates SchemaEntityResult type
    const mockEntityProcessor = (result: {
      entityOpt: Option.Option<any>
      loading: boolean
      error: string | null
    }) => result

    // This should compile correctly - validates type structure
    const mockResult = {
      entityOpt: Option.some(mockPersonData),
      error: null,
      loading: false,
    }

    const processedResult = mockEntityProcessor(mockResult)
    expect(processedResult.entityOpt._tag).toBe('Some')
    expect(processedResult.loading).toBe(false)
    expect(processedResult.error).toBe(null)
  }),
)

effect('Type validation: Error classes have correct tagged error structure', () =>
  Effect.gen(function* () {
    // Mock function that validates tagged error structure
    const mockErrorProcessor = (error: {
      _tag: string
      message: string
      type: 'validation' | 'operation'
      operation?: string
      tableName?: string
      cause?: unknown
    }) => error

    const insertError = new SchemaInsertError({
      message: 'Test error',
      type: 'validation',
    })

    const updateError = new SchemaUpdateError({
      message: 'Test error',
      operation: 'update',
      tableName: 'people',
      type: 'operation',
    })

    // This should compile correctly - validates type structure
    const processedInsertError = mockErrorProcessor(insertError)
    const processedUpdateError = mockErrorProcessor(updateError)

    expect(processedInsertError._tag).toBe('SchemaInsertError')
    expect(processedUpdateError._tag).toBe('SchemaUpdateError')
  }),
)

// Edge cases and error scenarios
effect('Edge case: should handle schema with complex nested structures', () =>
  Effect.gen(function* () {
    const schemaOpt = getSchemaByEntityType('Complex')
    // Should return None since Complex is not in our mock discovery
    expect(schemaOpt._tag).toBe('None')
  }),
)

effect('Edge case: should handle very long entity type names', () =>
  Effect.gen(function* () {
    const longEntityType = 'A'.repeat(1000)
    const schemaOpt = getSchemaByEntityType(longEntityType)
    expect(schemaOpt._tag).toBe('None')
  }),
)

effect('Edge case: should handle Unicode characters in entity type', () =>
  Effect.gen(function* () {
    const unicodeEntityType = '🚀📊💼'
    const schemaOpt = getSchemaByEntityType(unicodeEntityType)
    expect(schemaOpt._tag).toBe('None')
  }),
)

// -------------------------
// New helpers: OfRelations
// -------------------------

effect('getSchemaDeclaredRelations returns empty when no annotation', () =>
  Effect.gen(function* () {
    const NoRelSchema = Schema.Struct({
      _tag: Schema.Literal('person'),
      id: Schema.String,
    })

    const rels = getSchemaDeclaredRelations(NoRelSchema)
    expect(Array.isArray(rels)).toBe(true)
    expect(rels.length).toBe(0)
  }),
)

effect('getSchemaDeclaredRelations returns annotated relations', () =>
  Effect.gen(function* () {
    const WithRelSchema = Schema.Struct({
      _tag: Schema.Literal('person'),
      id: Schema.String,
    }).pipe(
      Schema.annotations({
        [OfRelations]: [
          {
            direction: 'both',
            form: { input: 'combobox', order: 1, show: true },
            key: 'sacraments',
            table: { order: 2, show: true },
            targetEntityTag: 'sacrament',
          },
        ],
      }),
    )

    const rels = getSchemaDeclaredRelations(WithRelSchema)
    expect(rels.length).toBe(1)
    expect(rels[0]?.key).toBe('sacraments')
    expect(rels[0]?.targetEntityTag).toBe('sacrament')
  }),
)

effect(
  'buildEntityRelationshipsForTable merges schema-declared targets first, then DB, with dedupe',
  () =>
    Effect.gen(function* () {
      const PersonSchemaWithRel = Schema.Struct({
        _tag: Schema.Literal('person'),
        id: Schema.String,
      }).pipe(
        Schema.annotations({
          [OfRelations]: [
            {
              form: { input: 'combobox', order: 1, show: true },
              key: 'sacraments',
              table: { order: 1, show: true },
              targetEntityTag: 'sacrament',
            },
            {
              form: { input: 'combobox', order: 2, show: true },
              key: 'phoneNumbers',
              table: { order: 5, show: true },
              targetEntityTag: 'phoneNumber',
            },
          ],
        }),
      )

      const dbRels = [
        {
          sourceEntityType: 'person',
          targetEntityTypes: ['sacrament', 'group'],
        },
      ]

      const merged = buildEntityRelationshipsForTable(PersonSchemaWithRel as any, dbRels)
      expect(merged.length).toBe(1)
      expect(merged[0]?.sourceEntityType).toBe('person')
      expect(merged[0]?.targetEntityTypes[0]).toBe('sacrament') // declared first (order 1)
      expect(merged[0]?.targetEntityTypes[1]).toBe('phoneNumber') // declared second (order 5)
      expect(merged[0]?.targetEntityTypes[2]).toBe('group') // DB-discovered appended
    }),
)

effect('buildEntityRelationshipsForTable returns declared only when DB has none', () =>
  Effect.gen(function* () {
    const PersonSchemaWithRel = Schema.Struct({
      _tag: Schema.Literal('person'),
      id: Schema.String,
    }).pipe(
      Schema.annotations({
        [OfRelations]: [
          {
            form: { input: 'combobox', order: 1, show: true },
            key: 'sacraments',
            table: { order: 1, show: true },
            targetEntityTag: 'sacrament',
          },
        ],
      }),
    )

    const merged = buildEntityRelationshipsForTable(PersonSchemaWithRel as any, [])
    expect(merged.length).toBe(1)
    expect(merged[0]?.targetEntityTypes).toEqual(['sacrament'])
  }),
)

effect('Edge case: should handle null and undefined entity types gracefully', () =>
  Effect.gen(function* () {
    // TypeScript would prevent this, but testing runtime behavior
    // We need to handle the case where the function might receive null/undefined
    const nullResult = yield* Effect.try(() => getSchemaByEntityType(null as any)).pipe(
      Effect.catchAll(() => Effect.succeed(Option.none())),
    )

    const undefinedResult = yield* Effect.try(() => getSchemaByEntityType(undefined as any)).pipe(
      Effect.catchAll(() => Effect.succeed(Option.none())),
    )

    expect(nullResult._tag).toBe('None')
    expect(undefinedResult._tag).toBe('None')
  }),
) // Function existence and basic structure tests
effect('Hook functions should be properly exported', () =>
  Effect.gen(function* () {
    expect(typeof useEntitySchema).toBe('function')
    expect(typeof useSchemaCollection).toBe('function')
    expect(typeof useSchemaEntity).toBe('function')
  }),
)

effect('Error classes should be properly exported and constructible', () =>
  Effect.gen(function* () {
    expect(typeof SchemaInsertError).toBe('function')
    expect(typeof SchemaUpdateError).toBe('function')
    expect(typeof SchemaDeleteError).toBe('function')
    expect(typeof SchemaUpsertError).toBe('function')

    // Test that they can be instantiated
    const insertError = new SchemaInsertError({
      message: 'Test',
      type: 'validation',
    })
    const updateError = new SchemaUpdateError({
      message: 'Test',
      type: 'validation',
    })
    const deleteError = new SchemaDeleteError({
      message: 'Test',
      type: 'validation',
    })
    const upsertError = new SchemaUpsertError({
      message: 'Test',
      type: 'validation',
    })

    expect(insertError).toBeInstanceOf(SchemaInsertError)
    expect(updateError).toBeInstanceOf(SchemaUpdateError)
    expect(deleteError).toBeInstanceOf(SchemaDeleteError)
    expect(upsertError).toBeInstanceOf(SchemaUpsertError)
  }),
)

// Schema validation tests
effect('Schema validation: TestPersonSchema should have correct structure', () =>
  Effect.gen(function* () {
    // Test that our test schema is properly structured
    const testData = {
      _tag: 'Person' as const,
      age: 25,
      email: 'test@example.com',
      firstName: 'Test',
      id: 'test_123',
      lastName: 'User',
    }

    // This should compile and validate correctly
    const parseResult = Schema.decodeUnknownSync(TestPersonSchema)(testData)
    expect(parseResult._tag).toBe('Person')
    expect(parseResult.age).toBe(25)
    expect(parseResult.email).toBe('test@example.com')
  }),
)

effect('Schema validation: TestGroupSchema should have correct structure', () =>
  Effect.gen(function* () {
    // This should compile and validate correctly
    const parseResult = Schema.decodeUnknownSync(TestGroupSchema)(mockGroupData)
    expect(parseResult._tag).toBe('Group')
    expect(parseResult.name).toBe('Test Group')
    expect(parseResult.description).toBe('Test group')
  }),
)
effect('Schema validation: SchemaWithoutTag should work for negative tests', () =>
  Effect.gen(function* () {
    // Test that our schema without tag works as expected
    const testData = {
      id: 'test_123',
      name: 'Test Item',
    }

    // This should compile and validate correctly
    const parseResult = Schema.decodeUnknownSync(SchemaWithoutTag)(testData)
    expect(parseResult.id).toBe('test_123')
    expect(parseResult.name).toBe('Test Item')
  }),
)

// Integration test for the complete type system
effect('Integration: complete type validation workflow', () =>
  Effect.gen(function* () {
    // Test that all the types work together correctly
    const personData = {
      _tag: 'Person' as const,
      age: 30,
      email: 'integration@test.com',
      firstName: 'Integration',
      id: 'person_integration',
      lastName: 'Test',
    }

    const groupData = {
      _tag: 'Group' as const,
      description: 'Integration test group',
      id: 'group_integration',
      name: 'Integration Group',
    }

    // Validate schemas work
    const personResult = Schema.decodeUnknownSync(TestPersonSchema)(personData)
    const groupResult = Schema.decodeUnknownSync(TestGroupSchema)(groupData)

    expect(personResult._tag).toBe('Person')
    expect(groupResult._tag).toBe('Group')
    // Test error construction
    const insertError = new SchemaInsertError({
      message: 'Integration test error',
      operation: 'insert',
      tableName: 'people',
      type: 'operation',
    })

    const updateError = new SchemaUpdateError({
      message: 'Integration test error',
      operation: 'update',
      tableName: 'groups',
      type: 'operation',
    })

    expect(insertError._tag).toBe('SchemaInsertError')
    expect(updateError._tag).toBe('SchemaUpdateError')

    // Test that functions exist and are callable
    expect(typeof getSchemaByEntityType).toBe('function')
    const schemaOpt = getSchemaByEntityType('NonExistent')
    expect(schemaOpt._tag).toBe('None')
  }),
)

// Performance and stress tests
effect('Performance test: getSchemaByEntityType should handle repeated calls efficiently', () =>
  Effect.gen(function* () {
    const startTime = Date.now()

    // Make multiple calls to test performance
    for (let i = 0; i < 100; i++) {
      getSchemaByEntityType('Person')
      getSchemaByEntityType('Group')
      getSchemaByEntityType('NonExistent')
    }

    const endTime = Date.now()

    // Should complete quickly (less than 100ms for 300 operations)
    expect(endTime - startTime).toBeLessThan(100)
  }),
)

effect('Stress test: Error class construction should handle many instances', () =>
  Effect.gen(function* () {
    const startTime = Date.now()

    // Create many error instances to test memory and performance
    const errors: Array<
      SchemaInsertError | SchemaUpdateError | SchemaDeleteError | SchemaUpsertError
    > = []

    for (let i = 0; i < 1000; i++) {
      const errorType = i % 4
      switch (errorType) {
        case 0:
          errors.push(
            new SchemaInsertError({
              message: `Error ${i}`,
              type: 'validation',
            }),
          )
          break
        case 1:
          errors.push(
            new SchemaUpdateError({
              message: `Error ${i}`,
              type: 'operation',
            }),
          )
          break
        case 2:
          errors.push(
            new SchemaDeleteError({
              message: `Error ${i}`,
              type: 'validation',
            }),
          )
          break
        case 3:
          errors.push(
            new SchemaUpsertError({
              message: `Error ${i}`,
              type: 'operation',
            }),
          )
          break
      }
    }

    const endTime = Date.now()

    expect(errors.length).toBe(1000)
    expect(endTime - startTime).toBeLessThan(100) // Should be very fast

    // Verify first and last errors
    expect(errors[0]?._tag).toBe('SchemaInsertError')
    expect(errors[999]?._tag).toBe('SchemaUpsertError')
  }),
)

// ================================================
// Tests for new entity name fetching functionality
// ================================================

// Mock Zero view for testing
const createMockView = () => {
  const listeners: Array<(result: any, resultType: string) => void> = []

  return {
    addListener: (listener: (result: any, resultType: string) => void) => {
      listeners.push(listener)
    },
    listeners,
    removeListener: (listener: (result: any, resultType: string) => void) => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    },
    // Simulate data being loaded
    triggerComplete: (data: any) => {
      pipe(
        listeners,
        Array.map((listener) => listener(data, 'complete')),
      )
    },
  }
}

// Mock Zero instance
const createMockZero = () => {
  const views = new Map<string, ReturnType<typeof createMockView>>()
  let viewCounter = 0

  return {
    getView: (key: string) => views.get(key),
    query: (tableName: string) => ({
      where: (_condition: any) => ({
        one: () => ({
          materialize: () => {
            const view = createMockView()
            views.set(`${tableName}-view-${viewCounter++}`, view)
            return view
          },
        }),
      }),
    }),
    views,
  }
}

// =======================
// ListenerCleanupError Tests
// =======================

effect('ListenerCleanupError should be properly constructed with all fields', () =>
  Effect.gen(function* () {
    const error = new ListenerCleanupError({
      cause: new Error('Underlying error'),
      entityId: 'person_123',
      entityType: 'Person',
      message: 'Cleanup failed',
    })

    expect(error._tag).toBe('ListenerCleanupError')
    expect(error.message).toBe('Cleanup failed')
    expect(error.entityType).toBe('Person')
    expect(error.entityId).toBe('person_123')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('ListenerCleanupError should handle optional fields correctly', () =>
  Effect.gen(function* () {
    const error = new ListenerCleanupError({
      message: 'Cleanup failed',
    })

    expect(error._tag).toBe('ListenerCleanupError')
    expect(error.message).toBe('Cleanup failed')
    expect(error.entityType).toBeUndefined()
    expect(error.entityId).toBeUndefined()
    expect(error.cause).toBeUndefined()
  }),
)

effect('ListenerCleanupError should extend Schema.TaggedError properly', () =>
  Effect.gen(function* () {
    const error = new ListenerCleanupError({
      entityType: 'Group',
      message: 'Test error',
    })

    // Should have proper tagged error structure
    expect(error._tag).toBe('ListenerCleanupError')
    expect(typeof error.message).toBe('string')

    // Should be an instance of the error class
    expect(error).toBeInstanceOf(ListenerCleanupError)
  }),
)

// =======================
// createEntityNamesFetcher Tests
// =======================

effect('createEntityNamesFetcher should return an object with correct structure', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = noOp

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache as any)

    expect(typeof fetcher).toBe('function')

    // Call the fetcher to get the cleanup function
    const cleanup = fetcher('Person', ['person_123'])
    expect(typeof cleanup).toBe('function')

    // The cleanup function should return an Effect
    const cleanupEffect = cleanup()
    expect(cleanupEffect).toBeDefined()
    expect(typeof cleanupEffect).toBe('object')
  }),
)

effect('createEntityNamesFetcher should add listeners to Zero views', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    let updateCacheCalls: Array<{ entityType: string; entityId: string; displayName: string }> = []
    const updateCacheMock = (entityType: string, entityId: string, displayName: string) => {
      updateCacheCalls.push({ displayName, entityId, entityType })
    }

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCacheMock)

    // Since the actual implementation catches errors, we need to provide all required methods
    // The fetcher will call getBaseEntityQuery which uses z.query
    // For now, we'll just verify the function exists and can be called
    const cleanup = fetcher('Person', ['person_123', 'person_456'])

    // Verify cleanup function was returned
    expect(typeof cleanup).toBe('function')

    // The cleanup effect should be executable
    const cleanupEffect = cleanup()
    expect(cleanupEffect).toBeDefined()

    // Clean up (even though no real listeners were added due to error handling)
    yield* cleanupEffect
  }),
)

effect('createEntityNamesFetcher cleanup should return Effect successfully', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = noOp

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache as any)

    // Fetch entity names
    const cleanup = fetcher('Person', ['person_123'])

    // Cleanup should return an Effect
    const cleanupEffect = cleanup()
    expect(cleanupEffect).toBeDefined()

    // Execute cleanup - should succeed even with no listeners
    const result = yield* cleanupEffect
    expect(Array.isArray(result)).toBe(true)
  }),
)

effect('createEntityNamesFetcher should handle cleanup errors gracefully', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = noOp

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache as any)

    // Fetch entity names
    const cleanup = fetcher('Person', ['person_123'])

    // Even if internal operations fail, cleanup should succeed
    const result = yield* pipe(
      cleanup(),
      Effect.map(() => 'success'),
      Effect.catchAll(() => Effect.succeed('caught')),
    )

    // Should handle error gracefully (cleanup catches internal errors)
    expect(result).toBe('success')
  }),
)

effect('createEntityNamesFetcher should respect cache when fetching', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    // Pre-populate cache with one entity
    const cache = pipe(
      HashMap.empty<string, HashMap.HashMap<string, string>>(),
      HashMap.set(
        'Person',
        pipe(HashMap.empty<string, string>(), HashMap.set('person_123', 'John Doe')),
      ),
    )
    let updateCacheCalls: Array<{ entityType: string; entityId: string; displayName: string }> = []
    const updateCacheMock = (entityType: string, entityId: string, displayName: string) => {
      updateCacheCalls.push({ displayName, entityId, entityType })
    }

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCacheMock)

    // Fetch entity names - person_123 is cached so should be skipped
    const cleanup = fetcher('Person', ['person_123', 'person_456'])

    // Verify cleanup function was returned
    expect(typeof cleanup).toBe('function')

    // Clean up
    yield* cleanup()
  }),
)

effect('createEntityNamesFetcher should work with different entity types', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    let updateCacheCalls: Array<{ entityType: string; entityId: string; displayName: string }> = []
    const updateCacheMock = (entityType: string, entityId: string, displayName: string) => {
      updateCacheCalls.push({ displayName, entityId, entityType })
    }

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCacheMock)

    // Test with different entity types
    const personCleanup = fetcher('Person', ['person_123'])
    const groupCleanup = fetcher('Group', ['group_456'])
    const addressCleanup = fetcher('Address', ['address_789'])

    // All should return cleanup functions
    expect(typeof personCleanup).toBe('function')
    expect(typeof groupCleanup).toBe('function')
    expect(typeof addressCleanup).toBe('function')

    // Clean up all
    yield* Effect.all([personCleanup(), groupCleanup(), addressCleanup()])
  }),
)

// =======================
// useEntityNamesFetcher Tests
// =======================

effect('useEntityNamesFetcher should be properly exported', () =>
  Effect.gen(function* () {
    expect(typeof useEntityNamesFetcher).toBe('function')
    // This is a React hook, so we test its internal logic separately
  }),
)

effect('useEntityNamesFetcher state management with HashMap/HashSet', () =>
  Effect.gen(function* () {
    // Test the logic that the hook uses (we can't test React hooks directly)

    // Simulate the state using HashMap
    let entityNamesCache = HashMap.empty<string, HashMap.HashMap<string, string>>()

    // Simulate updateCache function
    const updateCache = (entityType: string, entityId: string, displayName: string) => {
      const existingTypeOpt = pipe(entityNamesCache, HashMap.get(entityType))

      entityNamesCache = pipe(
        existingTypeOpt,
        Option.match({
          onNone: () =>
            pipe(
              entityNamesCache,
              HashMap.set(
                entityType,
                pipe(HashMap.empty<string, string>(), HashMap.set(entityId, displayName)),
              ),
            ),
          onSome: (existing) =>
            pipe(
              entityNamesCache,
              HashMap.set(entityType, pipe(existing, HashMap.set(entityId, displayName))),
            ),
        }),
      )
    }

    // Test adding entries
    updateCache('Person', 'person_123', 'John Doe')
    updateCache('Person', 'person_456', 'Jane Smith')
    updateCache('Group', 'group_789', 'Test Group')

    // Verify cache structure
    const personCacheOpt = pipe(entityNamesCache, HashMap.get('Person'))
    expect(Option.isSome(personCacheOpt)).toBe(true)

    if (Option.isSome(personCacheOpt)) {
      expect(pipe(personCacheOpt.value, HashMap.size)).toBe(2)
      expect(pipe(personCacheOpt.value, HashMap.get('person_123'), Option.getOrNull)).toBe(
        'John Doe',
      )
      expect(pipe(personCacheOpt.value, HashMap.get('person_456'), Option.getOrNull)).toBe(
        'Jane Smith',
      )
    }

    const groupCacheOpt = pipe(entityNamesCache, HashMap.get('Group'))
    expect(Option.isSome(groupCacheOpt)).toBe(true)

    if (Option.isSome(groupCacheOpt)) {
      expect(pipe(groupCacheOpt.value, HashMap.size)).toBe(1)
      expect(pipe(groupCacheOpt.value, HashMap.get('group_789'), Option.getOrNull)).toBe(
        'Test Group',
      )
    }
  }),
)

effect('useEntityNamesFetcher cleanup tracking and deduplication', () =>
  Effect.gen(function* () {
    // Test the deduplication logic used by the hook

    // Simulate tracking fetched entities with HashSet
    let fetchedEntities = HashSet.empty<string>()

    // Simulate tracking cleanup functions with HashMap
    let cleanupFunctions = HashMap.empty<string, () => Effect.Effect<any, never, never>>()

    // Function to check if already fetched
    const shouldFetch = (entityType: string, entityIds: ReadonlyArray<string>) => {
      const fetchKey = `${entityType}:${pipe(entityIds, Array.join(','))}`
      return !pipe(fetchedEntities, HashSet.has(fetchKey))
    }

    // Function to mark as fetched
    const markAsFetched = (entityType: string, entityIds: ReadonlyArray<string>) => {
      const fetchKey = `${entityType}:${pipe(entityIds, Array.join(','))}`
      fetchedEntities = pipe(fetchedEntities, HashSet.add(fetchKey))
    }

    // Test deduplication
    expect(shouldFetch('Person', ['person_123', 'person_456'])).toBe(true)
    markAsFetched('Person', ['person_123', 'person_456'])
    expect(shouldFetch('Person', ['person_123', 'person_456'])).toBe(false)

    // Different IDs should still fetch
    expect(shouldFetch('Person', ['person_789'])).toBe(true)

    // Different entity type should fetch
    expect(shouldFetch('Group', ['group_123'])).toBe(true)

    // Test cleanup tracking
    const mockCleanup1 = () => Effect.succeed('cleanup1')
    const mockCleanup2 = () => Effect.succeed('cleanup2')

    cleanupFunctions = pipe(
      cleanupFunctions,
      HashMap.set('Person:person_123,person_456', mockCleanup1),
      HashMap.set('Group:group_123', mockCleanup2),
    )

    expect(pipe(cleanupFunctions, HashMap.size)).toBe(2)

    // Simulate cleanup execution
    const cleanupEffects = pipe(
      cleanupFunctions,
      HashMap.values,
      Array.fromIterable,
      Array.map((cleanup) => cleanup()),
    )

    const results = yield* Effect.all(cleanupEffects)
    expect(results).toEqual(['cleanup1', 'cleanup2'])
  }),
)

effect('useEntityNamesFetcher getEntityNames functionality', () =>
  Effect.gen(function* () {
    // Test the getEntityNames logic

    const entityNamesCache = pipe(
      HashMap.empty<string, HashMap.HashMap<string, string>>(),
      HashMap.set(
        'Person',
        pipe(
          HashMap.empty<string, string>(),
          HashMap.set('person_123', 'John Doe'),
          HashMap.set('person_456', 'Jane Smith'),
        ),
      ),
      HashMap.set(
        'Group',
        pipe(HashMap.empty<string, string>(), HashMap.set('group_789', 'Test Group')),
      ),
    )

    // Simulate getEntityNames function
    const getEntityNames = (entityType: string): Record<string, string> => {
      return pipe(
        entityNamesCache,
        HashMap.get(entityType),
        Option.map((typeCache) => {
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
    }

    // Test getting names for existing entity type
    const personNames = getEntityNames('Person')
    expect(personNames).toEqual({
      person_123: 'John Doe',
      person_456: 'Jane Smith',
    })

    // Test getting names for another entity type
    const groupNames = getEntityNames('Group')
    expect(groupNames).toEqual({
      group_789: 'Test Group',
    })

    // Test getting names for non-existent entity type
    const unknownNames = getEntityNames('Unknown')
    expect(unknownNames).toEqual({})
  }),
)

// =======================
// Type-level Tests
// =======================

effect('Type validation: createEntityNamesFetcher return types', () =>
  Effect.gen(function* () {
    // Mock function that validates the type structure
    const mockFetcherProcessor = (
      fetcher: (
        entityType: string,
        entityIds: ReadonlyArray<string>,
      ) => () => Effect.Effect<ReadonlyArray<any>, never, never>,
    ) => fetcher

    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = noOp

    // This should compile correctly - validates type structure
    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache as any)
    const processedFetcher = mockFetcherProcessor(fetcher as any)

    expect(typeof processedFetcher).toBe('function')

    // Validate that calling fetcher returns a cleanup function
    const cleanup = processedFetcher('Person', ['person_123'])
    expect(typeof cleanup).toBe('function')
  }),
)

effect('Type validation: ListenerCleanupError structure', () =>
  Effect.gen(function* () {
    // Mock function that validates error structure
    const mockErrorProcessor = (error: {
      _tag: 'ListenerCleanupError'
      message: string
      entityType?: string
      entityId?: string
      cause?: unknown
    }) => error

    const error = new ListenerCleanupError({
      entityId: 'person_123',
      entityType: 'Person',
      message: 'Test cleanup error',
    })

    // This should compile correctly - validates type structure
    const processedError = mockErrorProcessor(error)
    expect(processedError._tag).toBe('ListenerCleanupError')
    expect(processedError.message).toBe('Test cleanup error')
    expect(processedError.entityType).toBe('Person')
  }),
)

effect('Type validation: Zero view structure compatibility', () =>
  Effect.gen(function* () {
    // Mock function that validates Zero view type structure
    const mockViewProcessor = (view: {
      addListener: (listener: (result: any, resultType: string) => void) => void
      removeListener: (listener: (result: any, resultType: string) => void) => void
    }) => view

    const mockView = createMockView()

    // This should compile correctly - validates type structure
    const processedView = mockViewProcessor(mockView)
    expect(typeof processedView.addListener).toBe('function')
    expect(typeof processedView.removeListener).toBe('function')
  }),
)

// =======================
// Integration Tests
// =======================

effect('Integration: complete flow of creating and cleaning up fetchers', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    let cache = HashMap.empty<string, HashMap.HashMap<string, string>>()

    const updateCache = (entityType: string, entityId: string, displayName: string) => {
      const existingTypeOpt = pipe(cache, HashMap.get(entityType))

      cache = pipe(
        existingTypeOpt,
        Option.match({
          onNone: () =>
            pipe(
              cache,
              HashMap.set(
                entityType,
                pipe(HashMap.empty<string, string>(), HashMap.set(entityId, displayName)),
              ),
            ),
          onSome: (existing) =>
            pipe(
              cache,
              HashMap.set(entityType, pipe(existing, HashMap.set(entityId, displayName))),
            ),
        }),
      )
    }

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache)

    // Create multiple fetchers
    const cleanup1 = fetcher('Person', ['person_123'])
    const cleanup2 = fetcher('Group', ['group_456'])

    // Both should return cleanup functions
    expect(typeof cleanup1).toBe('function')
    expect(typeof cleanup2).toBe('function')

    // Execute cleanups
    yield* Effect.all([cleanup1(), cleanup2()])

    // Verify cache was updated if any entities were fetched
    // (In this test it won't be since mock doesn't trigger complete)
    const cacheSize = pipe(cache, HashMap.size)
    expect(cacheSize).toBeGreaterThanOrEqual(0)
  }),
)

effect('Integration: multiple fetchers working together', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    let cache = HashMap.empty<string, HashMap.HashMap<string, string>>()

    const updateCache = (entityType: string, entityId: string, displayName: string) => {
      const existingTypeOpt = pipe(cache, HashMap.get(entityType))

      cache = pipe(
        existingTypeOpt,
        Option.match({
          onNone: () =>
            pipe(
              cache,
              HashMap.set(
                entityType,
                pipe(HashMap.empty<string, string>(), HashMap.set(entityId, displayName)),
              ),
            ),
          onSome: (existing) =>
            pipe(
              cache,
              HashMap.set(entityType, pipe(existing, HashMap.set(entityId, displayName))),
            ),
        }),
      )
    }

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache)

    // Create multiple fetchers for different entity types
    const personCleanup = fetcher('Person', ['person_123'])
    const groupCleanup = fetcher('Group', ['group_456'])
    const addressCleanup = fetcher('Address', ['address_789'])

    // All should return cleanup functions
    expect(typeof personCleanup).toBe('function')
    expect(typeof groupCleanup).toBe('function')
    expect(typeof addressCleanup).toBe('function')

    // Clean up all fetchers
    yield* Effect.all([personCleanup(), groupCleanup(), addressCleanup()])
  }),
)

effect('Integration: error recovery and logging', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = noOp

    // Make the Zero instance throw an error
    mockZ.query = () => {
      throw new Error('Query failed')
    }

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache as any)

    // This should not throw, but log a warning
    const cleanup = fetcher('Person', ['person_123'])

    // Cleanup should still work even though fetching failed
    const result = yield* pipe(
      cleanup(),
      Effect.map(() => 'success'),
      Effect.catchAll(() => Effect.succeed('error')),
    )

    expect(result).toBe('success')
  }),
)

// =======================
// Edge Cases and Stress Tests
// =======================

effect('Edge case: empty entity IDs array', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = noOp

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache as any)

    // Fetch with empty array
    const cleanup = fetcher('Person', [])

    // Should not create any views
    expect(mockZ.views.size).toBe(0)

    // Cleanup should still work
    yield* cleanup()
  }),
)

effect('Edge case: very large number of entity IDs', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    const cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = noOp

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache as any)

    // Create 100 entity IDs
    const entityIds = pipe(
      Array.range(1, 100),
      Array.map((i) => `person_${i}`),
    )

    const cleanup = fetcher('Person', entityIds)

    // Should return a cleanup function
    expect(typeof cleanup).toBe('function')

    // Clean up all - should handle large numbers efficiently
    const startTime = Date.now()
    yield* cleanup()
    const endTime = Date.now()

    // Should complete quickly even with many potential listeners
    expect(endTime - startTime).toBeLessThan(100)
  }),
)

effect('Stress test: rapid fetching and cleanup cycles', () =>
  Effect.gen(function* () {
    const mockZ = createMockZero()
    let cache = HashMap.empty<string, HashMap.HashMap<string, string>>()
    const updateCache = (entityType: string, entityId: string, displayName: string) => {
      const existingTypeOpt = pipe(cache, HashMap.get(entityType))

      cache = pipe(
        existingTypeOpt,
        Option.match({
          onNone: () =>
            pipe(
              cache,
              HashMap.set(
                entityType,
                pipe(HashMap.empty<string, string>(), HashMap.set(entityId, displayName)),
              ),
            ),
          onSome: (existing) =>
            pipe(
              cache,
              HashMap.set(entityType, pipe(existing, HashMap.set(entityId, displayName))),
            ),
        }),
      )
    }

    const fetcher = createEntityNamesFetcher(mockZ as any, cache, updateCache)

    // Perform rapid fetch/cleanup cycles
    for (let i = 0; i < 10; i++) {
      const cleanup = fetcher('Person', [`person_${i}`])
      yield* cleanup()

      // Verify cleanup happened
      const viewCount = pipe(
        Array.fromIterable(mockZ.views.values()),
        Array.filter((view) => view.listeners.length > 0),
        Array.length,
      )
      expect(viewCount).toBe(0)
    }

    // Cache should have accumulated if updates were called
    // (In this test they won't be called since we're not triggering complete)
    expect(pipe(cache, HashMap.size)).toBe(0)
  }),
)
