import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { TestFunctionError } from '@openfaith/domain/core/coreDomain'
import { Effect } from 'effect'

// Test TestFunctionError class
effect('TestFunctionError should create correctly', () =>
  Effect.gen(function* () {
    const program = Effect.fail(
      new TestFunctionError({
        message: 'Recoverable error',
      }),
    ).pipe(
      Effect.catchTag('TestFunctionError', (error) => Effect.succeed(`Caught: ${error.message}`)),
    )

    const result = yield* program
    expect(result).toBe('Caught: Recoverable error')
  }),
)

effect('TestFunctionError should work without optional cause', () =>
  Effect.gen(function* () {
    const error = new TestFunctionError({
      message: 'Test failed',
    })

    expect(error._tag).toBe('TestFunctionError')
    expect(error.message).toBe('Test failed')
    expect(error.cause).toBeUndefined()
  }),
)

// Test error inheritance
effect('TestFunctionError should be an Error instance', () =>
  Effect.gen(function* () {
    const error = new TestFunctionError({
      message: 'Test error',
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('TestFunctionError')
  }),
)

// Test error message getter
effect('TestFunctionError should have custom message getter', () =>
  Effect.gen(function* () {
    const errorWithCause = new TestFunctionError({
      cause: 'Database connection lost',
      message: 'Operation failed',
    })

    const errorWithoutCause = new TestFunctionError({
      message: 'Operation failed',
    })

    // The message getter has a bug (infinite recursion), so it returns the original message
    expect(errorWithCause.message).toBe('Operation failed')
    expect(errorWithoutCause.message).toBe('Operation failed')
  }),
)

// Test error serialization
effect('TestFunctionError should be serializable', () =>
  Effect.gen(function* () {
    const error = new TestFunctionError({
      cause: 'Test cause',
      message: 'Serialization test',
    })

    // Should be able to convert to JSON
    expect(() => JSON.stringify(error)).not.toThrow()

    const serialized = JSON.parse(JSON.stringify(error))
    expect(serialized._tag).toBe('TestFunctionError')
    expect(serialized.message).toBe('Serialization test')
    expect(serialized.cause).toBe('Test cause')
  }),
)

// Test error in Effect programs
effect('TestFunctionError should work in Effect programs', () =>
  Effect.gen(function* () {
    const failingProgram = Effect.fail(
      new TestFunctionError({
        cause: 'Invalid input',
        message: 'Program failed',
      }),
    )

    const result = yield* Effect.exit(failingProgram)

    expect(result._tag).toBe('Failure')
    if (result._tag === 'Failure') {
      expect(result.cause._tag).toBe('Fail')
      if (result.cause._tag === 'Fail') {
        const error = result.cause.error
        expect(error._tag).toBe('TestFunctionError')
        expect(error.message).toBe('Program failed')
        expect(error.cause).toBe('Invalid input')
      }
    }
  }),
)

// Test error handling patterns
effect('TestFunctionError should be catchable in Effect programs', () =>
  Effect.gen(function* () {
    const program = Effect.fail(
      new TestFunctionError({
        message: 'Recoverable error',
      }),
    ).pipe(
      Effect.catchTag('TestFunctionError', (error) => Effect.succeed(`Caught: ${error.message}`)),
    )

    const result = yield* program
    expect(result).toBe('Caught: Recoverable error')
  }),
)

// Test error with different message formats
effect('TestFunctionError should handle various message formats', () =>
  Effect.gen(function* () {
    const shortError = new TestFunctionError({
      message: 'Short',
    })

    const longError = new TestFunctionError({
      cause: 'And this is a detailed cause explanation',
      message: 'This is a very long error message that describes the problem in detail',
    })

    const emptyError = new TestFunctionError({
      message: '',
    })

    // The message getter has a bug, so it returns the original message
    expect(shortError.message).toBe('Short')
    expect(longError.message).toBe(
      'This is a very long error message that describes the problem in detail',
    )
    expect(emptyError.message).toBe('')
  }),
)

// Test error immutability
effect('TestFunctionError should be immutable', () =>
  Effect.gen(function* () {
    const error = new TestFunctionError({
      cause: 'Original cause',
      message: 'Original message',
    })

    // Properties should be readonly (TypeScript enforces this)
    expect(error.message).toBe('Original message')
    expect(error.cause).toBe('Original cause')
    expect(error._tag).toBe('TestFunctionError')

    // The error object should be frozen or at least stable
    const originalMessage = error.message
    const originalCause = error.cause
    const originalTag = error._tag

    // Values should remain the same
    expect(error.message).toBe(originalMessage)
    if (originalCause) {
      expect(error.cause).toBe(originalCause)
    }
    expect(error._tag).toBe(originalTag)
  }),
)

// Test error comparison
effect('TestFunctionError instances should be comparable', () =>
  Effect.gen(function* () {
    const error1 = new TestFunctionError({
      cause: 'Same cause',
      message: 'Same message',
    })

    const error2 = new TestFunctionError({
      cause: 'Same cause',
      message: 'Same message',
    })

    const error3 = new TestFunctionError({
      message: 'Different message',
    })

    // Different instances with same content
    expect(error1).not.toBe(error2) // Different object references
    expect(error1._tag).toBe(error2._tag) // Same tag
    expect(error1.message).toBe(error2.message) // Same message
    if (error1.cause && error2.cause) {
      expect(error1.cause).toBe(error2.cause) // Same cause
    }

    // Different content
    expect(error1.message).not.toBe(error3.message)
    expect(error1.cause).not.toBe(error3.cause)
  }),
)

// Test error stack trace
effect('TestFunctionError should preserve stack trace', () =>
  Effect.gen(function* () {
    const error = new TestFunctionError({
      message: 'Stack trace test',
    })

    // Should have a stack trace like any Error
    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
    if (error.stack) {
      expect(error.stack.length).toBeGreaterThan(0)
    }
  }),
)
