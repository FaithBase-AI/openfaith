import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import type { CustomMutation } from '@openfaith/domain'
import {
  convertCustomMutations,
  convertCustomMutationToCrudMutation,
  type InvalidMutationDataError,
  type InvalidMutationNameError,
  type UnsupportedOperationError,
} from '@openfaith/workers/helpers/convertCustomMutation'
import { Effect } from 'effect'

const createBaseMutation = (overrides: Partial<CustomMutation> = {}): CustomMutation => ({
  args: [[{ id: 'person_123', name: 'John Doe' }]],
  clientID: 'client_123',
  id: 1,
  name: 'people|update',
  timestamp: 1234567890,
  type: 'custom',
  ...overrides,
})

// Successful conversions
effect('should convert people|update mutation correctly', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation()
    const result = yield* convertCustomMutationToCrudMutation(mutation)

    expect(result).toHaveLength(1)
    const item = result[0]
    expect(item).toBeDefined()
    expect(item?.entityName).toBe('people')
    expect(item?.op.op).toBe('update')
    expect(item?.op.tableName).toBe('people')
    expect(item?.op.primaryKey).toEqual({ id: 'person_123' })
    expect(item?.op.value).toEqual({ id: 'person_123', name: 'John Doe' })
    expect(item?.mutation.type).toBe('crud')
    expect(item?.mutation.name).toBe('_zero_crud')
    expect(item?.mutation.args[0]?.ops).toHaveLength(1)
  }),
)

effect('should convert people|create mutation correctly', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({
      args: [[{ email: 'jane@example.com', id: 'person_456', name: 'Jane Doe' }]],
      name: 'people|create',
    })
    const result = yield* convertCustomMutationToCrudMutation(mutation)

    expect(result).toHaveLength(1)
    const item = result[0]
    expect(item).toBeDefined()
    expect(item?.entityName).toBe('people')
    expect(item?.op.op).toBe('insert')
    expect(item?.op.tableName).toBe('people')
    expect(item?.op.primaryKey).toEqual({ id: 'person_456' })
    expect(item?.op.value).toEqual({
      email: 'jane@example.com',
      id: 'person_456',
      name: 'Jane Doe',
    })
  }),
)

effect('should convert people|delete mutation correctly', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({
      args: [[{ id: 'person_789' }]],
      name: 'people|delete',
    })
    const result = yield* convertCustomMutationToCrudMutation(mutation)

    expect(result).toHaveLength(1)
    const item = result[0]
    expect(item).toBeDefined()
    expect(item?.entityName).toBe('people')
    expect(item?.op.op).toBe('delete')
    expect(item?.op.tableName).toBe('people')
    expect(item?.op.primaryKey).toEqual({ id: 'person_789' })
    expect(item?.op.value).toEqual({ id: 'person_789' }) // For delete, value is the primary key
  }),
)

effect('should handle different entity types', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({
      args: [[{ id: 'group_123', name: 'Youth Group' }]],
      name: 'groups|update',
    })
    const result = yield* convertCustomMutationToCrudMutation(mutation)

    expect(result).toHaveLength(1)
    const item = result[0]
    expect(item).toBeDefined()
    expect(item?.entityName).toBe('groups')
    expect(item?.op.tableName).toBe('groups')
  }),
)

// Error cases
effect('should fail with InvalidMutationNameError for malformed name', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({ name: 'invalid-name' })
    const result = yield* Effect.flip(convertCustomMutationToCrudMutation(mutation))

    expect(result._tag).toBe('InvalidMutationNameError')
    expect((result as InvalidMutationNameError).mutationName).toBe('invalid-name')
    expect((result as InvalidMutationNameError).reason).toContain('entity|operation')
  }),
)

effect('should fail with InvalidMutationDataError for empty args', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({ args: [] })
    const result = yield* Effect.flip(convertCustomMutationToCrudMutation(mutation))

    expect(result._tag).toBe('InvalidMutationDataError')
    expect((result as InvalidMutationDataError).reason).toContain('at least one argument')
  }),
)

effect('should fail with InvalidMutationDataError for missing id', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({ args: [[{ name: 'John Doe' }]] })
    const result = yield* Effect.flip(convertCustomMutationToCrudMutation(mutation))

    expect(result._tag).toBe('InvalidMutationDataError')
    expect((result as InvalidMutationDataError).reason).toContain('string "id" field')
  }),
)

effect('should fail with UnsupportedOperationError for unknown operation', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({ name: 'people|unknown' })
    const result = yield* Effect.flip(convertCustomMutationToCrudMutation(mutation))

    expect(result._tag).toBe('UnsupportedOperationError')
    expect((result as UnsupportedOperationError).operation).toBe('unknown')
    expect((result as UnsupportedOperationError).mutationName).toBe('people|unknown')
  }),
)

// Multiple mutations
effect('should convert multiple valid mutations', () =>
  Effect.gen(function* () {
    const mutations = [
      createBaseMutation({ id: 1, name: 'people|update' }),
      createBaseMutation({
        args: [[{ id: 'group_123', name: 'Youth' }]],
        id: 2,
        name: 'groups|create',
      }),
      createBaseMutation({
        args: [[{ id: 'person_456' }]],
        id: 3,
        name: 'people|delete',
      }),
    ]

    const result = yield* convertCustomMutations(mutations)

    expect(result).toHaveLength(3)
    expect(result[0]?.entityName).toBe('people')
    expect(result[0]?.op.op).toBe('update')
    expect(result[1]?.entityName).toBe('groups')
    expect(result[1]?.op.op).toBe('insert')
    expect(result[2]?.entityName).toBe('people')
    expect(result[2]?.op.op).toBe('delete')
  }),
)

effect('should skip invalid mutations and continue with valid ones', () =>
  Effect.gen(function* () {
    const mutations = [
      createBaseMutation({ id: 1, name: 'people|update' }), // Valid
      createBaseMutation({ id: 2, name: 'invalid-name' }), // Invalid name
      createBaseMutation({
        args: [[{ id: 'group_123', name: 'Youth' }]],
        id: 3,
        name: 'groups|create',
      }), // Valid
      createBaseMutation({ id: 4, name: 'people|unknown' }), // Invalid operation
    ]

    const result = yield* convertCustomMutations(mutations)

    // Should only return the 2 valid mutations
    expect(result).toHaveLength(2)
    expect(result[0]?.entityName).toBe('people')
    expect(result[0]?.op.op).toBe('update')
    expect(result[1]?.entityName).toBe('groups')
    expect(result[1]?.op.op).toBe('insert')
  }),
)

// Batch operations
effect('should handle batch mutations with multiple items in array', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({
      args: [
        [
          { id: 'person_123', name: 'John Doe' },
          { id: 'person_456', name: 'Jane Doe' },
          { id: 'person_789', name: 'Bob Smith' },
        ],
      ],
      name: 'people|update',
    })
    const result = yield* convertCustomMutationToCrudMutation(mutation)

    // Should create 3 separate entity workflow items
    expect(result).toHaveLength(3)

    expect(result[0]?.entityName).toBe('people')
    expect(result[0]?.op.op).toBe('update')
    expect(result[0]?.op.primaryKey).toEqual({ id: 'person_123' })
    expect(result[0]?.op.value).toEqual({ id: 'person_123', name: 'John Doe' })

    expect(result[1]?.entityName).toBe('people')
    expect(result[1]?.op.op).toBe('update')
    expect(result[1]?.op.primaryKey).toEqual({ id: 'person_456' })
    expect(result[1]?.op.value).toEqual({ id: 'person_456', name: 'Jane Doe' })

    expect(result[2]?.entityName).toBe('people')
    expect(result[2]?.op.op).toBe('update')
    expect(result[2]?.op.primaryKey).toEqual({ id: 'person_789' })
    expect(result[2]?.op.value).toEqual({ id: 'person_789', name: 'Bob Smith' })
  }),
)

effect('should fail with InvalidMutationDataError if args is not an array', () =>
  Effect.gen(function* () {
    const mutation = createBaseMutation({
      args: [{ id: 'person_123', name: 'John Doe' }] as any, // Not wrapped in array
    })
    const result = yield* Effect.flip(convertCustomMutationToCrudMutation(mutation))

    expect(result._tag).toBe('InvalidMutationDataError')
    expect((result as InvalidMutationDataError).reason).toContain('must be an array')
  }),
)
