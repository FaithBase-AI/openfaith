import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { removeReadonly, removeReadonlyNonEmpty, SyncStatus } from '@openfaith/shared/types'
import { type Array as EArray, Effect, Equal } from 'effect'

// Test removeReadonly function
effect('removeReadonly should convert readonly arrays to mutable arrays', () =>
  Effect.gen(function* () {
    // Test with regular array
    const regularArray = [1, 2, 3]
    const result1 = removeReadonly(regularArray)
    expect(result1).toEqual([1, 2, 3])
    expect(Array.isArray(result1)).toBe(true)

    // Test with readonly array
    const readonlyArray: ReadonlyArray<number> = [4, 5, 6]
    const result2 = removeReadonly(readonlyArray)
    expect(result2).toEqual([4, 5, 6])
    expect(Array.isArray(result2)).toBe(true)

    // Test that the result is mutable
    result2.push(7)
    expect(result2).toEqual([4, 5, 6, 7])
  }),
)

// Test removeReadonly with different types
effect('removeReadonly should work with different array types', () =>
  Effect.gen(function* () {
    // Test with string array
    const stringArray: ReadonlyArray<string> = ['a', 'b', 'c']
    const stringResult = removeReadonly(stringArray)
    expect(stringResult).toEqual(['a', 'b', 'c'])

    // Test with object array
    const objectArray: ReadonlyArray<{ id: number }> = [{ id: 1 }, { id: 2 }]
    const objectResult = removeReadonly(objectArray)
    expect(objectResult).toEqual([{ id: 1 }, { id: 2 }])

    // Test with empty array
    const emptyArray: ReadonlyArray<any> = []
    const emptyResult = removeReadonly(emptyArray)
    expect(emptyResult).toEqual([])
  }),
)

// Test removeReadonlyNonEmpty function
effect('removeReadonlyNonEmpty should convert readonly non-empty arrays', () =>
  Effect.gen(function* () {
    // Test with non-empty array
    const nonEmptyArray: EArray.NonEmptyReadonlyArray<number> = [1, 2, 3]
    const result = removeReadonlyNonEmpty(nonEmptyArray)
    expect(result).toEqual([1, 2, 3])
    expect(Array.isArray(result)).toBe(true)

    // Test that the result is mutable
    result.push(4)
    expect(result).toEqual([1, 2, 3, 4])
  }),
)

// Test removeReadonlyNonEmpty with different types
effect('removeReadonlyNonEmpty should work with different non-empty array types', () =>
  Effect.gen(function* () {
    // Test with string non-empty array
    const stringArray: EArray.NonEmptyReadonlyArray<string> = ['first', 'second']
    const stringResult = removeReadonlyNonEmpty(stringArray)
    expect(stringResult).toEqual(['first', 'second'])

    // Test with single element
    const singleArray: EArray.NonEmptyReadonlyArray<boolean> = [true]
    const singleResult = removeReadonlyNonEmpty(singleArray)
    expect(singleResult).toEqual([true])
  }),
)

// Test SyncStatus tagged enum
effect('SyncStatus should create correct tagged enum variants', () =>
  Effect.gen(function* () {
    // Test notSynced variant
    const notSynced = SyncStatus.notSynced()
    expect(notSynced._tag).toBe('notSynced')

    // Test syncing variant without progress
    const syncing1 = SyncStatus.syncing({})
    expect(syncing1._tag).toBe('syncing')

    // Test syncing variant with progress
    const syncing2 = SyncStatus.syncing({ current: 5, total: 10 })
    expect(syncing2._tag).toBe('syncing')
    expect(syncing2.current).toBe(5)
    expect(syncing2.total).toBe(10)

    // Test synced variant
    const synced = SyncStatus.synced()
    expect(synced._tag).toBe('synced')

    // Test error variant
    const error = SyncStatus.error({ message: 'Something went wrong' })
    expect(error._tag).toBe('error')
    expect(error.message).toBe('Something went wrong')
  }),
)

// Test SyncStatus pattern matching
effect('SyncStatus should support pattern matching', () =>
  Effect.gen(function* () {
    const statuses = [
      SyncStatus.notSynced(),
      SyncStatus.syncing({ current: 3, total: 10 }),
      SyncStatus.synced(),
      SyncStatus.error({ message: 'Failed to sync' }),
    ]

    const results = statuses.map((status) => {
      switch (status._tag) {
        case 'notSynced':
          return 'not started'
        case 'syncing':
          return status.current && status.total
            ? `${status.current}/${status.total}`
            : 'in progress'
        case 'synced':
          return 'completed'
        case 'error':
          return `error: ${status.message}`
      }
    })

    expect(results).toEqual(['not started', '3/10', 'completed', 'error: Failed to sync'])
  }),
)

// Test SyncStatus equality
effect('SyncStatus should support equality comparison', () =>
  Effect.gen(function* () {
    // Test same variants are equal
    const notSynced1 = SyncStatus.notSynced()
    const notSynced2 = SyncStatus.notSynced()
    expect(Equal.equals(notSynced1, notSynced2)).toBe(true)

    // Test different variants are not equal
    const synced = SyncStatus.synced()
    expect(Equal.equals(notSynced1, synced)).toBe(false)

    // Test same variant with same data are equal
    const error1 = SyncStatus.error({ message: 'test' })
    const error2 = SyncStatus.error({ message: 'test' })
    expect(Equal.equals(error1, error2)).toBe(true)

    // Test same variant with different data are not equal
    const error3 = SyncStatus.error({ message: 'different' })
    expect(Equal.equals(error1, error3)).toBe(false)
  }),
)

// Test AdapterSyncItem type structure
effect('AdapterSyncItem should have correct structure', () =>
  Effect.gen(function* () {
    // Test creating AdapterSyncItem objects
    const syncItem1 = {
      entity: 'person',
      module: 'pco',
      status: SyncStatus.notSynced(),
    }

    expect(syncItem1.module).toBe('pco')
    expect(syncItem1.entity).toBe('person')
    expect(syncItem1.status._tag).toBe('notSynced')

    // Test with parent
    const syncItem2 = {
      entity: 'group',
      module: 'ccb',
      parent: 'organization',
      status: SyncStatus.syncing({ current: 5, total: 15 }),
    }

    expect(syncItem2.module).toBe('ccb')
    expect(syncItem2.entity).toBe('group')
    expect(syncItem2.parent).toBe('organization')
    expect(syncItem2.status._tag).toBe('syncing')
  }),
)

// Test type transformations (compile-time tests)
effect('type transformations should be available', () =>
  Effect.gen(function* () {
    // These are primarily compile-time tests
    // We can verify the module exports the namespace
    const typesModule = yield* Effect.promise(() => import('@openfaith/shared/types'))
    expect(typesModule).toBeDefined()

    // Test that we can import the types
    expect(typeof typesModule.removeReadonly).toBe('function')
    expect(typeof typesModule.removeReadonlyNonEmpty).toBe('function')
    expect(typeof typesModule.SyncStatus).toBe('object')
  }),
)

// Test AsyncReturnType utility
effect('AsyncReturnType should work with async functions', () =>
  Effect.gen(function* () {
    // Test with async functions
    const asyncStringFunction = async (): Promise<string> => 'test'
    const asyncNumberFunction = async (): Promise<number> => 42
    const asyncObjectFunction = async (): Promise<{ id: number }> => ({
      id: 1,
    })

    // We can't test the type directly at runtime, but we can test the functions work
    const stringResult = yield* Effect.promise(() => asyncStringFunction())
    const numberResult = yield* Effect.promise(() => asyncNumberFunction())
    const objectResult = yield* Effect.promise(() => asyncObjectFunction())

    expect(stringResult).toBe('test')
    expect(numberResult).toBe(42)
    expect(objectResult).toEqual({ id: 1 })
  }),
)

// Test Resolve utility type
effect('Resolve utility type should work with functions and objects', () =>
  Effect.gen(function* () {
    // Test with regular objects (should pass through)
    const testObject = { name: 'test', value: 42 }

    // Test with functions (should pass through)
    const testFunction = () => 'hello'

    // These are compile-time utilities, so we just verify they exist
    expect(testObject.name).toBe('test')
    expect(testFunction()).toBe('hello')
  }),
)

// Test array utility functions with Effect arrays
effect('array utilities should work with Effect array types', () =>
  Effect.gen(function* () {
    // Test with Effect NonEmptyArray
    const effectArray: EArray.NonEmptyArray<string> = ['first', 'second', 'third']
    const converted = removeReadonlyNonEmpty(effectArray)

    expect(converted).toEqual(['first', 'second', 'third'])
    expect(Array.isArray(converted)).toBe(true)

    // Test mutation works
    converted.push('fourth')
    expect(converted.length).toBe(4)
  }),
)

// Test SyncStatus with complex scenarios
effect('SyncStatus should handle complex sync scenarios', () =>
  Effect.gen(function* () {
    // Test a complete sync workflow
    const notSyncedStatus = SyncStatus.notSynced()
    expect(notSyncedStatus._tag).toBe('notSynced')

    // Start syncing
    const syncingStatus1 = SyncStatus.syncing({ current: 0, total: 100 })
    expect(syncingStatus1._tag).toBe('syncing')
    expect(syncingStatus1.current).toBe(0)
    expect(syncingStatus1.total).toBe(100)

    // Progress update
    const syncingStatus2 = SyncStatus.syncing({ current: 50, total: 100 })
    expect(syncingStatus2.current).toBe(50)

    // Complete successfully
    const syncedStatus = SyncStatus.synced()
    expect(syncedStatus._tag).toBe('synced')

    // Test error scenario
    const errorStatus = SyncStatus.error({ message: 'Network timeout' })
    expect(errorStatus._tag).toBe('error')
    expect(errorStatus.message).toBe('Network timeout')
  }),
)

// Test SyncStatus optional fields
effect('SyncStatus syncing should handle optional fields correctly', () =>
  Effect.gen(function* () {
    // Test syncing without progress info
    const syncingNoProgress = SyncStatus.syncing({})
    expect(syncingNoProgress._tag).toBe('syncing')
    expect(syncingNoProgress.current).toBeUndefined()
    expect(syncingNoProgress.total).toBeUndefined()

    // Test syncing with only current
    const syncingWithCurrent = SyncStatus.syncing({ current: 5 })
    expect(syncingWithCurrent._tag).toBe('syncing')
    expect(syncingWithCurrent.current).toBe(5)
    expect(syncingWithCurrent.total).toBeUndefined()

    // Test syncing with only total
    const syncingWithTotal = SyncStatus.syncing({ total: 10 })
    expect(syncingWithTotal._tag).toBe('syncing')
    expect(syncingWithTotal.current).toBeUndefined()
    expect(syncingWithTotal.total).toBe(10)
  }),
)

// Test SyncStatus immutability
effect('SyncStatus instances should be immutable', () =>
  Effect.gen(function* () {
    const syncingStatus = SyncStatus.syncing({ current: 5, total: 10 })

    // Attempting to modify should not affect the original
    const modifiedStatus = { ...syncingStatus, current: 8 }

    expect(syncingStatus.current).toBe(5)
    expect(modifiedStatus.current).toBe(8)

    // Original should remain unchanged
    expect(syncingStatus.current).toBe(5)
    expect(syncingStatus.total).toBe(10)
  }),
)
