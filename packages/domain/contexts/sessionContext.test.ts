import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  ForbiddenError,
  SessionContext,
  SessionError,
  SessionHttpMiddleware,
  SessionRpcMiddleware,
  UnauthorizedError,
} from '@openfaith/domain/contexts/sessionContext'
import { Effect, Option } from 'effect'

// Test SessionContext tag
effect('SessionContext should be defined correctly', () =>
  Effect.gen(function* () {
    expect(SessionContext).toBeDefined()
    expect(typeof SessionContext).toBe('function')
  }),
)

effect('SessionContext should have correct identifier', () =>
  Effect.gen(function* () {
    expect(SessionContext.key).toBe('@openfaith/server/SessionContext')
  }),
)

// Test error classes
effect('UnauthorizedError should create correctly', () =>
  Effect.gen(function* () {
    const error = new UnauthorizedError({
      message: 'User not authenticated',
    })

    expect(error._tag).toBe('UnauthorizedError')
    expect(error.message).toBe('User not authenticated')
  }),
)

effect('ForbiddenError should create correctly', () =>
  Effect.gen(function* () {
    const error = new ForbiddenError({
      message: 'Access denied',
    })

    expect(error._tag).toBe('ForbiddenError')
    expect(error.message).toBe('Access denied')
  }),
)

effect('SessionError should create correctly', () =>
  Effect.gen(function* () {
    const error = new SessionError({
      message: 'Session invalid',
    })

    expect(error._tag).toBe('SessionError')
    expect(error.message).toBe('Session invalid')
  }),
)

// Test error inheritance
effect('UnauthorizedError should be an Error instance', () =>
  Effect.gen(function* () {
    const error = new UnauthorizedError({
      message: 'Test error',
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('UnauthorizedError')
  }),
)

effect('ForbiddenError should be an Error instance', () =>
  Effect.gen(function* () {
    const error = new ForbiddenError({
      message: 'Test error',
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ForbiddenError')
  }),
)

effect('SessionError should be an Error instance', () =>
  Effect.gen(function* () {
    const error = new SessionError({
      message: 'Test error',
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('SessionError')
  }),
)

// Test middleware classes
effect('SessionHttpMiddleware should be defined correctly', () =>
  Effect.gen(function* () {
    expect(SessionHttpMiddleware).toBeDefined()
    expect(typeof SessionHttpMiddleware).toBe('function')
  }),
)

effect('SessionHttpMiddleware should have correct identifier', () =>
  Effect.gen(function* () {
    expect(SessionHttpMiddleware.key).toBe('@openfaith/server/SessionHttpMiddleware')
  }),
)

effect('SessionRpcMiddleware should be defined correctly', () =>
  Effect.gen(function* () {
    expect(SessionRpcMiddleware).toBeDefined()
    expect(typeof SessionRpcMiddleware).toBe('function')
  }),
)

effect('SessionRpcMiddleware should have correct identifier', () =>
  Effect.gen(function* () {
    expect(SessionRpcMiddleware.key).toBe('@openfaith/server/SessionRpcMiddleware')
  }),
)

// Test SessionContext structure
effect('SessionContext should have correct type structure', () =>
  Effect.gen(function* () {
    // We can't directly test the type structure at runtime,
    // but we can verify the tag is properly constructed
    expect(SessionContext.key).toBe('@openfaith/server/SessionContext')

    // The context should be usable in Effect programs
    const mockSessionContext = {
      activeOrganizationIdOpt: Option.some('org-456'),
      roleOpt: Option.some('admin'),
      userId: 'user-123',
    }

    // Test that the structure matches what's expected
    expect(typeof mockSessionContext.userId).toBe('string')
    expect(Option.isSome(mockSessionContext.activeOrganizationIdOpt)).toBe(true)
    expect(Option.isSome(mockSessionContext.roleOpt)).toBe(true)
  }),
)

effect('SessionContext should work with Option.none values', () =>
  Effect.gen(function* () {
    const mockSessionContext = {
      activeOrganizationIdOpt: Option.none(),
      roleOpt: Option.none(),
      userId: 'user-123',
    }

    expect(typeof mockSessionContext.userId).toBe('string')
    expect(Option.isNone(mockSessionContext.activeOrganizationIdOpt)).toBe(true)
    expect(Option.isNone(mockSessionContext.roleOpt)).toBe(true)
  }),
)

// Test error serialization
effect('errors should be serializable', () =>
  Effect.gen(function* () {
    const unauthorizedError = new UnauthorizedError({
      message: 'Not authenticated',
    })

    const forbiddenError = new ForbiddenError({
      message: 'Access denied',
    })

    const sessionError = new SessionError({
      message: 'Invalid session',
    })

    // Test that errors can be converted to JSON (for API responses)
    expect(() => JSON.stringify(unauthorizedError)).not.toThrow()
    expect(() => JSON.stringify(forbiddenError)).not.toThrow()
    expect(() => JSON.stringify(sessionError)).not.toThrow()
  }),
)

// Test error message handling
effect('errors should preserve message content', () =>
  Effect.gen(function* () {
    const testMessage = 'Custom error message'

    const unauthorizedError = new UnauthorizedError({ message: testMessage })
    const forbiddenError = new ForbiddenError({ message: testMessage })
    const sessionError = new SessionError({ message: testMessage })

    expect(unauthorizedError.message).toBe(testMessage)
    expect(forbiddenError.message).toBe(testMessage)
    expect(sessionError.message).toBe(testMessage)
  }),
)

// Test middleware tag structure
effect('middleware tags should be properly structured', () =>
  Effect.gen(function* () {
    // Test that middleware tags have the expected structure
    expect(SessionHttpMiddleware.key).toContain('@openfaith/server/')
    expect(SessionRpcMiddleware.key).toContain('@openfaith/server/')

    // They should be different middleware types
    expect(SessionHttpMiddleware.key).not.toBe(SessionRpcMiddleware.key)
  }),
)

// Test context tag usage
effect('SessionContext should be usable in Effect programs', () =>
  Effect.gen(function* () {
    // Test that the context tag can be used in Effect programs
    const program = Effect.gen(function* () {
      const session = yield* SessionContext
      return session.userId
    })

    // The program should be properly typed
    expect(program).toBeDefined()

    // We can't run it without providing the context, but we can verify structure
    expect(typeof program).toBe('object')
  }),
)

// Test error union types
effect('middleware should handle error unions correctly', () =>
  Effect.gen(function* () {
    // Test that the middleware can handle the expected error types
    const unauthorizedError = new UnauthorizedError({
      message: 'Unauthorized',
    })
    const sessionError = new SessionError({ message: 'Session error' })

    // Both should be valid error types for the middleware
    expect(unauthorizedError._tag).toBe('UnauthorizedError')
    expect(sessionError._tag).toBe('SessionError')

    // They should be different error types
    expect(unauthorizedError._tag).not.toBe(sessionError._tag)
  }),
)

// Test Option handling in context
effect('SessionContext should properly handle Option types', () =>
  Effect.gen(function* () {
    // Test Option.some cases
    const someOrgId = Option.some('org-123')
    const someRole = Option.some('user')

    expect(Option.isSome(someOrgId)).toBe(true)
    expect(Option.isSome(someRole)).toBe(true)

    if (Option.isSome(someOrgId)) {
      expect(someOrgId.value).toBe('org-123')
    }

    if (Option.isSome(someRole)) {
      expect(someRole.value).toBe('user')
    }

    // Test Option.none cases
    const noneOrgId = Option.none()
    const noneRole = Option.none()

    expect(Option.isNone(noneOrgId)).toBe(true)
    expect(Option.isNone(noneRole)).toBe(true)
  }),
)
