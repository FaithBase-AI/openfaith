import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { getDetailsPaneParamsOpt } from '@openfaith/ui/components/detailsPane/detailsPaneHelpers'
import type { DetailsPaneParams } from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { Array, Effect, pipe } from 'effect'

// Tests for getDetailsPaneParamsOpt
effect('getDetailsPaneParamsOpt: should parse valid JSON string', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParams = [
      {
        _tag: 'entity',
        entityId: '123',
        entityType: 'person',
        tab: 'details',
      },
    ]
    const jsonString = JSON.stringify(validParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toEqual(validParams)
    }
  }),
)

effect('getDetailsPaneParamsOpt: should parse multiple entities', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParams = [
      {
        _tag: 'entity',
        entityId: '123',
        entityType: 'person',
        tab: 'details',
      },
      {
        _tag: 'entity',
        entityId: '456',
        entityType: 'group',
        tab: 'members',
      },
    ]
    const jsonString = JSON.stringify(validParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toEqual(validParams)
    }
  }),
)

effect('getDetailsPaneParamsOpt: should parse entity without optional tab', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParams = [
      {
        _tag: 'entity',
        entityId: '123',
        entityType: 'person',
      },
    ]
    const jsonString = JSON.stringify(validParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toEqual(validParams)
    }
  }),
)

effect('getDetailsPaneParamsOpt: should parse empty array', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParams = []
    const jsonString = JSON.stringify(validParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toEqual([])
    }
  }),
)

effect('getDetailsPaneParamsOpt: should return None for null input', () =>
  Effect.gen(function* () {
    const result = getDetailsPaneParamsOpt(null)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should return None for invalid JSON', () =>
  Effect.gen(function* () {
    const invalidJson = '{ invalid json'

    const result = getDetailsPaneParamsOpt(invalidJson)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should return None for malformed JSON', () =>
  Effect.gen(function* () {
    const malformedJson = '{"key": value}' // Missing quotes around value

    const result = getDetailsPaneParamsOpt(malformedJson)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should return None for invalid schema', () =>
  Effect.gen(function* () {
    const invalidParams = [
      {
        _tag: 'invalid',
        entityId: '123',
        entityType: 'person',
      },
    ]
    const jsonString = JSON.stringify(invalidParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should return None for missing required fields', () =>
  Effect.gen(function* () {
    const invalidParams = [
      {
        _tag: 'entity',
        // Missing entityId and entityType
      },
    ]
    const jsonString = JSON.stringify(invalidParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should return None for wrong data type', () =>
  Effect.gen(function* () {
    const invalidParams = {
      // Should be array, not object
      _tag: 'entity',
      entityId: '123',
      entityType: 'person',
    }
    const jsonString = JSON.stringify(invalidParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should return None for non-string entityId', () =>
  Effect.gen(function* () {
    const invalidParams = [
      {
        _tag: 'entity',
        entityId: 123, // Should be string
        entityType: 'person',
      },
    ]
    const jsonString = JSON.stringify(invalidParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should return None for non-string entityType', () =>
  Effect.gen(function* () {
    const invalidParams = [
      {
        _tag: 'entity',
        entityId: '123',
        entityType: 123, // Should be string
      },
    ]
    const jsonString = JSON.stringify(invalidParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should handle empty string input', () =>
  Effect.gen(function* () {
    const result = getDetailsPaneParamsOpt('')

    expect(result._tag).toBe('None')
  }),
)

effect('getDetailsPaneParamsOpt: should handle whitespace-only input', () =>
  Effect.gen(function* () {
    const result = getDetailsPaneParamsOpt('   ')

    expect(result._tag).toBe('None')
  }),
)

// Edge cases and complex scenarios
effect('getDetailsPaneParamsOpt: should handle very long entityId', () =>
  Effect.gen(function* () {
    const longId = 'a'.repeat(1000)
    const validParams: DetailsPaneParams = [
      {
        _tag: 'entity',
        entityId: longId,
        entityType: 'person',
      },
    ]
    const jsonString = JSON.stringify(validParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value[0]?.entityId).toBe(longId)
    }
  }),
)

effect('getDetailsPaneParamsOpt: should handle special characters in fields', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParams = [
      {
        _tag: 'entity',
        entityId: 'id-with-special-chars-123!@#$%',
        entityType: 'person-type',
        tab: 'tab-with-dashes',
      },
    ]
    const jsonString = JSON.stringify(validParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toEqual(validParams)
    }
  }),
)

effect('getDetailsPaneParamsOpt: should handle Unicode characters', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParams = [
      {
        _tag: 'entity',
        entityId: '用户123',
        entityType: 'personne',
        tab: 'détails',
      },
    ]
    const jsonString = JSON.stringify(validParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toEqual(validParams)
    }
  }),
)

effect('getDetailsPaneParamsOpt: should handle large arrays', () =>
  Effect.gen(function* () {
    const largeParams: DetailsPaneParams = pipe(
      Array.range(1, 100),
      Array.map((i) => ({
        _tag: 'entity' as const,
        entityId: `entity-${i}`,
        entityType: 'person',
        tab: 'details',
      })),
    )
    const jsonString = JSON.stringify(largeParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toHaveLength(100)
      expect(result.value[0]?.entityId).toBe('entity-1')
      expect(result.value[99]?.entityId).toBe('entity-100')
    }
  }),
)

// Type-level testing
effect('Type validation: DetailsPaneParams structure is correctly typed', () =>
  Effect.gen(function* () {
    // Mock function that validates type structure
    const mockParamsProcessor = (
      params: Array<{
        _tag: 'entity'
        entityId: string
        entityType: string
        tab?: string
      }>,
    ) => params

    // This should compile correctly - validates type structure
    const result = mockParamsProcessor([
      {
        _tag: 'entity',
        entityId: '123',
        entityType: 'person',
        tab: 'details',
      },
      {
        _tag: 'entity',
        entityId: '456',
        entityType: 'group',
        // tab is optional
      },
    ])

    expect(result).toHaveLength(2)
    expect(result[0]?._tag).toBe('entity')
  }),
)

// Integration tests with Effect error handling
effect('Effect integration: should handle JSON parsing errors gracefully', () =>
  Effect.gen(function* () {
    const invalidJson = '{ "incomplete": json'

    // Test that the function handles errors internally and returns None
    const result = getDetailsPaneParamsOpt(invalidJson)

    expect(result._tag).toBe('None')

    // The function should not throw or cause Effect failures
    // This test verifies the error handling is properly contained
  }),
)

effect('Effect integration: should handle schema validation errors gracefully', () =>
  Effect.gen(function* () {
    const invalidSchema = JSON.stringify([
      {
        _tag: 'wrong-tag',
        entityId: '123',
        entityType: 'person',
      },
    ])

    // Test that schema validation errors are handled gracefully
    const result = getDetailsPaneParamsOpt(invalidSchema)

    expect(result._tag).toBe('None')

    // The function should not throw or cause Effect failures
    // This test verifies the schema validation error handling is properly contained
  }),
)

// Performance and stress tests
effect('Performance test: should handle large JSON strings efficiently', () =>
  Effect.gen(function* () {
    // Create a large but valid JSON string
    const largeParams: DetailsPaneParams = pipe(
      Array.range(1, 1000),
      Array.map((i) => ({
        _tag: 'entity' as const,
        entityId: `entity-${i}`,
        entityType: 'person',
        tab: 'details',
      })),
    )
    const jsonString = JSON.stringify(largeParams)

    const startTime = Date.now()
    const result = getDetailsPaneParamsOpt(jsonString)
    const endTime = Date.now()

    // Should complete quickly (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100)

    // Should still parse correctly
    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toHaveLength(1000)
    }
  }),
)

effect('Stress test: should handle deeply nested invalid JSON gracefully', () =>
  Effect.gen(function* () {
    // Create deeply nested invalid structure
    const deeplyNested = JSON.stringify({
      level1: {
        level2: {
          level3: {
            level4: {
              level5: [
                {
                  _tag: 'entity',
                  entityId: '123',
                  entityType: 'person',
                },
              ],
            },
          },
        },
      },
    })

    const result = getDetailsPaneParamsOpt(deeplyNested)

    // Should return None for invalid structure (not an array at root level)
    expect(result._tag).toBe('None')
  }),
)

// Boundary condition tests
effect('Boundary test: should handle minimum valid input', () =>
  Effect.gen(function* () {
    const minimalParams: DetailsPaneParams = [
      {
        _tag: 'entity',
        entityId: 'a',
        entityType: 'b',
      },
    ]
    const jsonString = JSON.stringify(minimalParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toEqual(minimalParams)
    }
  }),
)

effect('Boundary test: should handle maximum reasonable input size', () =>
  Effect.gen(function* () {
    // Test with very large but reasonable input
    const maxParams: DetailsPaneParams = pipe(
      Array.range(1, 10000),
      Array.map((i) => ({
        _tag: 'entity' as const,
        entityId: `entity-${i}`,
        entityType: 'person',
        tab: 'details',
      })),
    )
    const jsonString = JSON.stringify(maxParams)

    const result = getDetailsPaneParamsOpt(jsonString)

    expect(result._tag).toBe('Some')
    if (result._tag === 'Some') {
      expect(result.value).toHaveLength(10000)
    }
  }),
)
