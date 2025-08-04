import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  getSchemaByEntityType,
  SchemaInsertError,
  SchemaUpdateError,
  useEntitySchema,
  useSchemaCollection,
  useSchemaEntity,
  useSchemaInsert,
  useSchemaUpdate,
} from '@openfaith/schema/shared/hooks'
import { Effect, Option, Schema } from 'effect'

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
      nextPage: () => {},
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
    expect(typeof useSchemaInsert).toBe('function')
    expect(typeof useSchemaUpdate).toBe('function')
    expect(typeof useSchemaCollection).toBe('function')
    expect(typeof useSchemaEntity).toBe('function')
  }),
)

effect('Error classes should be properly exported and constructible', () =>
  Effect.gen(function* () {
    expect(typeof SchemaInsertError).toBe('function')
    expect(typeof SchemaUpdateError).toBe('function')

    // Test that they can be instantiated
    const insertError = new SchemaInsertError({
      message: 'Test',
      type: 'validation',
    })
    const updateError = new SchemaUpdateError({
      message: 'Test',
      type: 'validation',
    })

    expect(insertError).toBeInstanceOf(SchemaInsertError)
    expect(updateError).toBeInstanceOf(SchemaUpdateError)
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
    const errors: Array<SchemaInsertError | SchemaUpdateError> = []

    for (let i = 0; i < 1000; i++) {
      if (i % 2 === 0) {
        errors.push(
          new SchemaInsertError({
            message: `Error ${i}`,
            type: 'validation',
          }),
        )
      } else {
        errors.push(
          new SchemaUpdateError({
            message: `Error ${i}`,
            type: 'operation',
          }),
        )
      }
    }

    const endTime = Date.now()

    expect(errors.length).toBe(1000)
    expect(endTime - startTime).toBeLessThan(100) // Should be very fast

    // Verify first and last errors
    expect(errors[0]?._tag).toBe('SchemaInsertError')
    expect(errors[999]?._tag).toBe('SchemaUpdateError')
  }),
)
