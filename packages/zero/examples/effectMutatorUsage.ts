import {
  createEffectMutators,
  createEffectMutatorsWithGenericHelper,
  type MutatorError,
  type UpdatePersonInput,
  updatePersonEffectFn,
} from '@openfaith/zero/effectMutators'
import type { ZSchema } from '@openfaith/zero/zeroSchema.mts'
import type { Transaction } from '@rocicorp/zero'
import { Effect } from 'effect'

/**
 * Example 1: Using the Effect-based mutator directly
 */
export function exampleDirectUsage() {
  return Effect.gen(function* () {
    // Mock transaction and auth data for example
    const mockTx = {} as Transaction<ZSchema>
    const mockAuthData = {
      activeOrganizationId: 'org-456',
      sub: 'user-123',
    }

    const input: UpdatePersonInput = {
      firstName: 'John',
      id: 'person-789',
    }

    // Use the Effect-based mutator directly
    const result = yield* updatePersonEffectFn(mockTx, input, mockAuthData)

    yield* Effect.log('Direct mutator usage completed', result)
    return result
  })
}

/**
 * Example 2: Using the createEffectMutators function (Zero-compatible)
 */
export function exampleZeroCompatibleUsage() {
  return Effect.gen(function* () {
    const mockAuthData = {
      activeOrganizationId: 'org-456',
      sub: 'user-123',
    }

    // Create Zero-compatible mutators
    const mutators = createEffectMutators(mockAuthData)

    // These mutators can be passed directly to Zero's PushProcessor
    yield* Effect.log('Created Zero-compatible mutators', mutators)

    return mutators
  })
}

/**
 * Example 3: Using the helper function approach
 */
export function exampleHelperUsage() {
  return Effect.gen(function* () {
    const mockAuthData = {
      activeOrganizationId: 'org-456',
      sub: 'user-123',
    }

    // Create mutators using the helper function
    const mutators = createEffectMutatorsWithGenericHelper(mockAuthData)

    yield* Effect.log('Created mutators with helper', mutators)

    return mutators
  })
}

/**
 * Example 4: Error handling with Effect-based mutators
 */
export function exampleErrorHandling() {
  return Effect.gen(function* () {
    const mockTx = {} as Transaction<ZSchema>

    // Example with no auth data (should fail)
    const input: UpdatePersonInput = {
      firstName: 'John',
      id: 'person-789',
    }

    const result = yield* updatePersonEffectFn(mockTx, input, undefined).pipe(
      Effect.catchAll((error: MutatorError) => {
        // Handle different types of errors
        switch (error._tag) {
          case 'MutatorAuthError':
            return Effect.log('Authentication error:', error.message)
          case 'MutatorValidationError':
            return Effect.log('Validation error:', error.message, error.field)
          case 'MutatorDatabaseError':
            return Effect.log('Database error:', error.message, error.cause)
          default:
            return Effect.log('Unknown error:', error)
        }
      }),
    )

    return result
  })
}

/**
 * Example 5: Composing multiple mutators
 */
export function exampleComposition() {
  return Effect.gen(function* () {
    const mockTx = {} as Transaction<ZSchema>
    const mockAuthData = {
      activeOrganizationId: 'org-456',
      sub: 'user-123',
    }

    // Update multiple people in sequence
    const people: Array<UpdatePersonInput> = [
      { firstName: 'Alice', id: 'person-1' },
      { firstName: 'Bob', id: 'person-2' },
      { firstName: 'Charlie', id: 'person-3' },
    ]

    // Use Effect.forEach to process all updates
    yield* Effect.forEach(people, (person) => updatePersonEffectFn(mockTx, person, mockAuthData))

    yield* Effect.log('All people updated successfully')
  })
}

/**
 * Example 6: Using with proper error recovery
 */
export function exampleWithRecovery() {
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

    // Try the mutation with retry and fallback
    const result = yield* updatePersonEffectFn(mockTx, input, mockAuthData).pipe(
      Effect.retry({ times: 3 }),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* Effect.log('Mutation failed after retries, using fallback', error)
          // Could implement fallback logic here
          return undefined
        }),
      ),
    )

    return result
  })
}
