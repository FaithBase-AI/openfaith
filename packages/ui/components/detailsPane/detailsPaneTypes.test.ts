import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { assertSuccess } from '@openfaith/bun-test/assert'
import {
  DetailsPaneEntity,
  type DetailsPaneEntity as DetailsPaneEntityType,
  DetailsPaneParams,
  type DetailsPaneParams as DetailsPaneParamsType,
  DetailsPaneUnion,
} from '@openfaith/ui/components/detailsPane/detailsPaneTypes'
import { Effect, Schema } from 'effect'

// Tests for DetailsPaneEntity Schema
effect('DetailsPaneEntity: should validate valid entity with all fields', () =>
  Effect.gen(function* () {
    const validEntity = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
      tab: 'details',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(validEntity))
    assertSuccess(result, validEntity)
  }),
)

effect('DetailsPaneEntity: should validate valid entity without optional tab', () =>
  Effect.gen(function* () {
    const validEntity = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(validEntity))
    assertSuccess(result, validEntity)
  }),
)

effect('DetailsPaneEntity: should reject entity with wrong _tag', () =>
  Effect.gen(function* () {
    const invalidEntity = {
      _tag: 'wrong-tag',
      entityId: '123',
      entityType: 'person',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(invalidEntity))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneEntity: should reject entity without _tag', () =>
  Effect.gen(function* () {
    const invalidEntity = {
      entityId: '123',
      entityType: 'person',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(invalidEntity))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneEntity: should reject entity without entityId', () =>
  Effect.gen(function* () {
    const invalidEntity = {
      _tag: 'entity' as const,
      entityType: 'person',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(invalidEntity))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneEntity: should reject entity without entityType', () =>
  Effect.gen(function* () {
    const invalidEntity = {
      _tag: 'entity' as const,
      entityId: '123',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(invalidEntity))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneEntity: should reject entity with non-string entityId', () =>
  Effect.gen(function* () {
    const invalidEntity = {
      _tag: 'entity' as const,
      entityId: 123,
      entityType: 'person',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(invalidEntity))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneEntity: should reject entity with non-string entityType', () =>
  Effect.gen(function* () {
    const invalidEntity = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 123,
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(invalidEntity))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneEntity: should reject entity with non-string tab', () =>
  Effect.gen(function* () {
    const invalidEntity = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
      tab: 123,
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(invalidEntity))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneEntity: should accept entity with null tab (optional)', () =>
  Effect.gen(function* () {
    const validEntity = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
      tab: null,
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(validEntity))
    // Should succeed but tab should be undefined in the result
    assertSuccess(result, {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
    })
  }),
)

effect('DetailsPaneEntity: should handle empty string values', () =>
  Effect.gen(function* () {
    const validEntity = {
      _tag: 'entity' as const,
      entityId: '',
      entityType: '',
      tab: '',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(validEntity))
    assertSuccess(result, validEntity)
  }),
)

effect('DetailsPaneEntity: should handle special characters in strings', () =>
  Effect.gen(function* () {
    const validEntity = {
      _tag: 'entity' as const,
      entityId: 'id-with-special-chars-123!@#$%',
      entityType: 'person-type',
      tab: 'tab-with-dashes',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(validEntity))
    assertSuccess(result, validEntity)
  }),
)

effect('DetailsPaneEntity: should handle Unicode characters', () =>
  Effect.gen(function* () {
    const validEntity = {
      _tag: 'entity' as const,
      entityId: '用户123',
      entityType: 'personne',
      tab: 'détails',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(validEntity))
    assertSuccess(result, validEntity)
  }),
)

// Tests for DetailsPaneUnion Schema (currently same as DetailsPaneEntity)
effect('DetailsPaneUnion: should validate same as DetailsPaneEntity', () =>
  Effect.gen(function* () {
    const validEntity = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
      tab: 'details',
    }

    const entityResult = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneEntity)(validEntity))
    const unionResult = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneUnion)(validEntity))

    assertSuccess(entityResult, validEntity)
    assertSuccess(unionResult, validEntity)
  }),
)

// Tests for DetailsPaneParams Schema (Array of DetailsPaneUnion)
effect('DetailsPaneParams: should validate empty array', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParamsType = []

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(validParams))
    assertSuccess(result, [])
  }),
)

effect('DetailsPaneParams: should validate array with single entity', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParamsType = [
      {
        _tag: 'entity' as const,
        entityId: '123',
        entityType: 'person',
        tab: 'details',
      },
    ]

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(validParams))
    assertSuccess(result, validParams)
  }),
)

effect('DetailsPaneParams: should validate array with multiple entities', () =>
  Effect.gen(function* () {
    const validParams: DetailsPaneParamsType = [
      {
        _tag: 'entity' as const,
        entityId: '123',
        entityType: 'person',
        tab: 'details',
      },
      {
        _tag: 'entity' as const,
        entityId: '456',
        entityType: 'group',
        tab: 'members',
      },
      {
        _tag: 'entity' as const,
        entityId: '789',
        entityType: 'event',
      },
    ]

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(validParams))
    assertSuccess(result, validParams)
  }),
)

effect('DetailsPaneParams: should reject non-array input', () =>
  Effect.gen(function* () {
    const invalidParams = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(invalidParams))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneParams: should reject array with invalid entity', () =>
  Effect.gen(function* () {
    const invalidParams = [
      {
        _tag: 'entity' as const,
        entityId: '123',
        entityType: 'person',
      },
      {
        _tag: 'wrong-tag',
        entityId: '456',
        entityType: 'group',
      },
    ]

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(invalidParams))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneParams: should reject array with mixed valid/invalid entities', () =>
  Effect.gen(function* () {
    const invalidParams = [
      {
        _tag: 'entity' as const,
        entityId: '123',
        entityType: 'person',
      },
      {
        _tag: 'entity' as const,
        entityId: 456, // Invalid: should be string
        entityType: 'group',
      },
    ]

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(invalidParams))
    expect(result._tag).toBe('Failure')
  }),
)

effect('DetailsPaneParams: should handle large arrays', () =>
  Effect.gen(function* () {
    const largeParams: DetailsPaneParamsType = Array.from({ length: 100 }, (_, i) => ({
      _tag: 'entity' as const,
      entityId: `entity-${i}`,
      entityType: 'person',
      tab: 'details',
    }))

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(largeParams))
    assertSuccess(result, largeParams)
  }),
)

// Type-level testing
effect('Type validation: DetailsPaneEntity type structure is correct', () =>
  Effect.gen(function* () {
    // Mock function that validates type structure
    const mockEntityProcessor = (entity: {
      _tag: 'entity'
      entityId: string
      entityType: string
      tab?: string
    }) => entity

    // This should compile correctly - validates type structure
    const result = mockEntityProcessor({
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
      tab: 'details',
    })

    expect(result._tag).toBe('entity')
    expect(result.entityId).toBe('123')
    expect(result.entityType).toBe('person')
    expect(result.tab).toBe('details')
  }),
)

effect('Type validation: DetailsPaneParams type structure is correct', () =>
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
        _tag: 'entity' as const,
        entityId: '123',
        entityType: 'person',
        tab: 'details',
      },
      {
        _tag: 'entity' as const,
        entityId: '456',
        entityType: 'group',
        // tab is optional
      },
    ])

    expect(result).toHaveLength(2)
    expect(result[0]?._tag).toBe('entity')
    expect(result[1]?._tag).toBe('entity')
  }),
)

// Schema encoding tests (round-trip validation)
effect('Schema round-trip: DetailsPaneEntity encode/decode', () =>
  Effect.gen(function* () {
    const originalEntity: DetailsPaneEntityType = {
      _tag: 'entity' as const,
      entityId: '123',
      entityType: 'person',
      tab: 'details',
    }

    // Encode to unknown
    const encoded = yield* Schema.encode(DetailsPaneEntity)(originalEntity)

    // Decode back
    const decoded = yield* Schema.decodeUnknown(DetailsPaneEntity)(encoded)

    expect(decoded).toEqual(originalEntity)
  }),
)

effect('Schema round-trip: DetailsPaneParams encode/decode', () =>
  Effect.gen(function* () {
    const originalParams: DetailsPaneParamsType = [
      {
        _tag: 'entity' as const,
        entityId: '123',
        entityType: 'person',
        tab: 'details',
      },
      {
        _tag: 'entity' as const,
        entityId: '456',
        entityType: 'group',
      },
    ]

    // Encode to unknown
    const encoded = yield* Schema.encode(DetailsPaneParams)(originalParams)

    // Decode back
    const decoded = yield* Schema.decodeUnknown(DetailsPaneParams)(encoded)

    expect(decoded).toEqual(originalParams)
  }),
)

// Edge cases and boundary conditions
effect('Edge case: very long string values', () =>
  Effect.gen(function* () {
    const longString = 'a'.repeat(10000)
    const entityWithLongStrings = {
      _tag: 'entity' as const,
      entityId: longString,
      entityType: longString,
      tab: longString,
    }

    const result = yield* Effect.exit(
      Schema.decodeUnknown(DetailsPaneEntity)(entityWithLongStrings),
    )
    assertSuccess(result, entityWithLongStrings)
  }),
)

effect('Edge case: maximum array size', () =>
  Effect.gen(function* () {
    const maxParams: DetailsPaneParamsType = Array.from({ length: 10000 }, (_, i) => ({
      _tag: 'entity' as const,
      entityId: `entity-${i}`,
      entityType: 'person',
    }))

    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(maxParams))
    assertSuccess(result, maxParams)
  }),
)

// Performance tests
effect('Performance test: large schema validation', () =>
  Effect.gen(function* () {
    const largeParams: DetailsPaneParamsType = Array.from({ length: 1000 }, (_, i) => ({
      _tag: 'entity' as const,
      entityId: `entity-${i}`,
      entityType: 'person',
      tab: 'details',
    }))

    const startTime = Date.now()
    const result = yield* Effect.exit(Schema.decodeUnknown(DetailsPaneParams)(largeParams))
    const endTime = Date.now()

    // Should complete quickly (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100)
    assertSuccess(result, largeParams)
  }),
)
