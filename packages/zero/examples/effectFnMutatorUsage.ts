import {
  createEffectMutators,
  createEffectMutatorsWithGenericHelper,
  createEffectMutatorsWithIndividualFns,
  effectFnToPromise,
  type UpdatePersonInput,
  updatePersonEffectFn,
} from '@openfaith/zero/effectMutators'
import type { ZSchema } from '@openfaith/zero/zeroSchema.mts'
import type { Transaction } from '@rocicorp/zero'
import { Effect } from 'effect'

/**
 * Example 1: Using Effect.fn mutators directly (inline definition)
 */
export function exampleInlineEffectFn() {
  const mockAuthData = {
    activeOrganizationId: 'org-456',
    sub: 'user-123',
  }

  // Create mutators with inline Effect.fn definitions
  const mutators = createEffectMutators(mockAuthData)

  // The mutator functions are now Effect.fn wrapped in effectFnToPromise
  // This means they have tracing and better error reporting built-in
  return mutators
}

/**
 * Example 2: Using pre-defined Effect.fn mutators
 */
export function examplePreDefinedEffectFn() {
  const mockAuthData = {
    activeOrganizationId: 'org-456',
    sub: 'user-123',
  }

  // Use the pre-defined Effect.fn mutator
  const mutators = createEffectMutatorsWithIndividualFns(mockAuthData)

  return mutators
}

/**
 * Example 3: Using the generic helper approach
 */
export function exampleGenericHelper() {
  const mockAuthData = {
    activeOrganizationId: 'org-456',
    sub: 'user-123',
  }

  // Use the generic helper that works with any Effect.fn
  const mutators = createEffectMutatorsWithGenericHelper(mockAuthData)

  return mutators
}

/**
 * Example 4: Using Effect.fn directly for custom logic
 */
export function exampleDirectEffectFnUsage() {
  return Effect.gen(function* () {
    const mockTx = {} as Transaction<ZSchema>
    const mockAuthData = {
      activeOrganizationId: 'org-456',
      sub: 'user-123',
    }

    const input: UpdatePersonInput = {
      firstName: 'John',
      id: 'person-789',
    }

    // Use the Effect.fn directly - this gives you full Effect composition
    const result = yield* updatePersonEffectFn(mockTx, input, mockAuthData)

    yield* Effect.log('Direct Effect.fn usage completed')
    return result
  })
}

/**
 * Example 5: Creating custom Effect.fn mutators
 */
export const customMutatorEffectFn = Effect.fn('customMutator')(
  (_mockTx: Transaction<ZSchema>, customInput: { message: string }) =>
    Effect.gen(function* () {
      yield* Effect.log('Custom mutator called with:', customInput.message)

      // Custom logic here
      yield* Effect.tryPromise({
        catch: (error) => new Error(`Custom mutator failed: ${error}`), // Mock operation
        try: () => Promise.resolve(),
      })

      yield* Effect.log('Custom mutator completed')
    }),
)

/**
 * Example 6: Using effectFnToPromise helper directly
 */
export function exampleDirectHelperUsage() {
  // Convert any Effect.fn to a Promise-based function
  const promiseMutator = effectFnToPromise(customMutatorEffectFn)

  // Now it can be used in Zero's CustomMutatorDefs
  return {
    custom: {
      doSomething: promiseMutator,
    },
  }
}

/**
 * Example 7: Composing multiple Effect.fn mutators
 */
export function exampleComposition() {
  return Effect.gen(function* () {
    const mockTx = {} as Transaction<ZSchema>
    const mockAuthData = {
      activeOrganizationId: 'org-456',
      sub: 'user-123',
    }

    // Compose multiple Effect.fn calls
    yield* updatePersonEffectFn(mockTx, { firstName: 'Alice', id: 'person-1' }, mockAuthData)
    yield* customMutatorEffectFn(mockTx, {
      message: 'Hello from custom mutator',
    })
    yield* updatePersonEffectFn(mockTx, { firstName: 'Bob', id: 'person-2' }, mockAuthData)

    yield* Effect.log('All mutators completed successfully')
  })
}

/**
 * Example 8: Error handling with Effect.fn mutators
 */
export function exampleErrorHandling() {
  return Effect.gen(function* () {
    const mockTx = {} as Transaction<ZSchema>

    // This should fail due to no auth data
    const result = yield* updatePersonEffectFn(
      mockTx,
      { firstName: 'Alice', id: 'person-1' },
      undefined,
    ).pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* Effect.log('Mutator failed as expected:', error)
          return undefined
        }),
      ),
    )

    return result
  })
}
