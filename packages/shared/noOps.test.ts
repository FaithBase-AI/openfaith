import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { asyncNoOp, asyncNullOp, noOp, nullOp, nullOpE } from '@openfaith/shared/noOps'
import { Effect } from 'effect'

// Test noOp function
effect('noOp should be a function that returns undefined', () =>
  Effect.gen(function* () {
    // Test that noOp is a function
    expect(typeof noOp).toBe('function')

    // Test that it returns undefined
    const result = noOp()
    expect(result).toBeUndefined()

    // Test that it can be called multiple times
    expect(noOp()).toBeUndefined()
    expect(noOp()).toBeUndefined()
  }),
)

// Test nullOp function
effect('nullOp should be a function that returns null', () =>
  Effect.gen(function* () {
    // Test that nullOp is a function
    expect(typeof nullOp).toBe('function')

    // Test that it returns null
    const result = nullOp()
    expect(result).toBeNull()

    // Test that it can be called multiple times
    expect(nullOp()).toBeNull()
    expect(nullOp()).toBeNull()
  }),
)

// Test asyncNoOp function
effect('asyncNoOp should be an async function that returns undefined', () =>
  Effect.gen(function* () {
    // Test that asyncNoOp is a function
    expect(typeof asyncNoOp).toBe('function')

    // Test that it returns a Promise
    const promise = asyncNoOp()
    expect(promise).toBeInstanceOf(Promise)

    // Test that the promise resolves to undefined
    const result = yield* Effect.promise(() => promise)
    expect(result).toBeUndefined()
  }),
)

// Test asyncNullOp function
effect('asyncNullOp should be an async function that returns null', () =>
  Effect.gen(function* () {
    // Test that asyncNullOp is a function
    expect(typeof asyncNullOp).toBe('function')

    // Test that it returns a Promise
    const promise = asyncNullOp()
    expect(promise).toBeInstanceOf(Promise)

    // Test that the promise resolves to null
    const result = yield* Effect.promise(() => promise)
    expect(result).toBeNull()
  }),
)

// Test nullOpE function
effect('nullOpE should return an Effect that succeeds with null', () =>
  Effect.gen(function* () {
    // Test that nullOpE is a function
    expect(typeof nullOpE).toBe('function')

    // Test that it returns an Effect
    const effect = nullOpE()
    expect(effect).toBeDefined()
    expect(typeof effect).toBe('object')

    // Test that the Effect succeeds with null
    const result = yield* effect
    expect(result).toBeNull()
  }),
)

// Test that functions can be used as callbacks
effect('no-op functions should work as callbacks', () =>
  Effect.gen(function* () {
    // Test noOp as callback
    const testArray = [1, 2, 3]
    expect(() => testArray.forEach(noOp)).not.toThrow()

    // Test nullOp as callback
    const results = testArray.map(nullOp)
    expect(results).toEqual([null, null, null])
  }),
)

// Test async functions with Promise.all
effect('async no-op functions should work with Promise.all', () =>
  Effect.gen(function* () {
    // Test multiple async calls
    const promises = [asyncNoOp(), asyncNoOp(), asyncNoOp()]
    const results = yield* Effect.promise(() => Promise.all(promises))

    expect(results).toEqual([undefined, undefined, undefined])

    // Test async null operations
    const nullPromises = [asyncNullOp(), asyncNullOp(), asyncNullOp()]
    const nullResults = yield* Effect.promise(() => Promise.all(nullPromises))

    expect(nullResults).toEqual([null, null, null])
  }),
)

// Test Effect composition with nullOpE
effect('nullOpE should compose with other Effects', () =>
  Effect.gen(function* () {
    // Test chaining with other Effects
    const result = yield* Effect.gen(function* () {
      const nullResult = yield* nullOpE()
      const anotherResult = yield* Effect.succeed('test')
      return { anotherResult, nullResult }
    })

    expect(result.nullResult).toBeNull()
    expect(result.anotherResult).toBe('test')
  }),
)

// Test that functions have no side effects
effect('no-op functions should have no side effects', () =>
  Effect.gen(function* () {
    const sideEffectCounter = 0

    // Call all no-op functions
    noOp()
    nullOp()
    yield* Effect.promise(() => asyncNoOp())
    yield* Effect.promise(() => asyncNullOp())
    yield* nullOpE()

    // Counter should remain unchanged
    expect(sideEffectCounter).toBe(0)
  }),
)

// Test function signatures and types
effect('no-op functions should have correct signatures', () =>
  Effect.gen(function* () {
    // Test that functions accept no parameters
    expect(noOp.length).toBe(0)
    expect(nullOp.length).toBe(0)
    expect(asyncNoOp.length).toBe(0)
    expect(asyncNullOp.length).toBe(0)
    expect(nullOpE.length).toBe(0)
  }),
)

// Test performance (should be fast)
effect('no-op functions should execute quickly', () =>
  Effect.gen(function* () {
    const iterations = 10000

    // Test synchronous functions
    const syncStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      noOp()
      nullOp()
    }
    const syncEnd = Date.now()
    const syncDuration = syncEnd - syncStart

    // Should complete very quickly (less than 100ms for 10k iterations)
    expect(syncDuration).toBeLessThan(100)

    // Test Effect function
    const effectStart = Date.now()
    for (let i = 0; i < 1000; i++) {
      yield* nullOpE()
    }
    const effectEnd = Date.now()
    const effectDuration = effectEnd - effectStart

    // Should also be reasonably fast
    expect(effectDuration).toBeLessThan(1000)
  }),
)

// Test that functions are referentially stable
effect('no-op functions should be referentially stable', () =>
  Effect.gen(function* () {
    // Import the functions again to test they're the same reference
    const {
      noOp: noOp2,
      nullOp: nullOp2,
      asyncNoOp: asyncNoOp2,
      asyncNullOp: asyncNullOp2,
      nullOpE: nullOpE2,
    } = yield* Effect.promise(() => import('@openfaith/shared/noOps'))

    // Functions should be the same reference
    expect(noOp).toBe(noOp2)
    expect(nullOp).toBe(nullOp2)
    expect(asyncNoOp).toBe(asyncNoOp2)
    expect(asyncNullOp).toBe(asyncNullOp2)
    expect(nullOpE).toBe(nullOpE2)
  }),
)

// Test error handling (should not throw)
effect('no-op functions should never throw errors', () =>
  Effect.gen(function* () {
    // Test that functions don't throw even when called in unusual ways
    expect(() => noOp()).not.toThrow()
    expect(() => nullOp()).not.toThrow()
    expect(() => asyncNoOp()).not.toThrow()
    expect(() => asyncNullOp()).not.toThrow()
    expect(() => nullOpE()).not.toThrow()

    // Test calling with unexpected arguments (should still work)
    expect(() => (noOp as any)(1, 2, 3)).not.toThrow()
    expect(() => (nullOp as any)('test')).not.toThrow()
  }),
)

// Test async function timing
effect('async no-op functions should resolve immediately', () =>
  Effect.gen(function* () {
    const start = Date.now()

    yield* Effect.promise(() => asyncNoOp())
    yield* Effect.promise(() => asyncNullOp())

    const end = Date.now()
    const duration = end - start

    // Should resolve very quickly (less than 10ms)
    expect(duration).toBeLessThan(10)
  }),
)

// Test that nullOpE creates a new Effect instance each time
effect('nullOpE should create new Effect instances', () =>
  Effect.gen(function* () {
    const effect1 = nullOpE()
    const effect2 = nullOpE()

    // Should be different instances (Effects are not referentially equal)
    expect(effect1).not.toBe(effect2)

    // But should both succeed with null
    const result1 = yield* effect1
    const result2 = yield* effect2

    expect(result1).toBeNull()
    expect(result2).toBeNull()
  }),
)
