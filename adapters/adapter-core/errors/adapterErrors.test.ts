import { expect } from 'bun:test'
import {
  AdapterConnectionError,
  AdapterSyncError,
  AdapterTokenError,
  AdapterValidationError,
  UnsupportedAdapterError,
} from '@openfaith/adapter-core/errors/adapterErrors'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'

effect('UnsupportedAdapterError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new UnsupportedAdapterError({
      adapter: 'unknown-adapter',
      message: 'This adapter is not supported',
    })

    expect(error._tag).toBe('UnsupportedAdapterError')
    expect(error.adapter).toBe('unknown-adapter')
    expect(error.message).toBe('This adapter is not supported')
  }),
)

effect('UnsupportedAdapterError should work without optional message', () =>
  Effect.gen(function* () {
    const error = new UnsupportedAdapterError({
      adapter: 'unknown-adapter',
    })

    expect(error._tag).toBe('UnsupportedAdapterError')
    expect(error.adapter).toBe('unknown-adapter')
    expect(error.message).toBe('')
  }),
)

effect('AdapterSyncError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new AdapterSyncError({
      adapter: 'pco',
      cause: new Error('Network error'),
      entityName: 'Person',
      message: 'Failed to sync person data',
      operation: 'create',
    })

    expect(error._tag).toBe('AdapterSyncError')
    expect(error.adapter).toBe('pco')
    expect(error.entityName).toBe('Person')
    expect(error.operation).toBe('create')
    expect(error.message).toBe('Failed to sync person data')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('AdapterSyncError should work with minimal required fields', () =>
  Effect.gen(function* () {
    const error = new AdapterSyncError({
      adapter: 'ccb',
      entityName: 'Group',
      operation: 'update',
    })

    expect(error._tag).toBe('AdapterSyncError')
    expect(error.adapter).toBe('ccb')
    expect(error.entityName).toBe('Group')
    expect(error.operation).toBe('update')
    expect(error.message).toBe('')
    expect(error.cause).toBeUndefined()
  }),
)

effect('AdapterTokenError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new AdapterTokenError({
      adapter: 'pco',
      cause: { message: 'Unauthorized', status: 401 },
      message: 'Token refresh failed',
    })

    expect(error._tag).toBe('AdapterTokenError')
    expect(error.adapter).toBe('pco')
    expect(error.message).toBe('Token refresh failed')
    expect(error.cause).toEqual({ message: 'Unauthorized', status: 401 })
  }),
)

effect('AdapterTokenError should work with minimal required fields', () =>
  Effect.gen(function* () {
    const error = new AdapterTokenError({
      adapter: 'ccb',
    })

    expect(error._tag).toBe('AdapterTokenError')
    expect(error.adapter).toBe('ccb')
    expect(error.message).toBe('')
    expect(error.cause).toBeUndefined()
  }),
)

effect('AdapterConnectionError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new AdapterConnectionError({
      adapter: 'pco',
      cause: new Error('Connection timeout'),
      message: 'Failed to connect to PCO API',
    })

    expect(error._tag).toBe('AdapterConnectionError')
    expect(error.adapter).toBe('pco')
    expect(error.message).toBe('Failed to connect to PCO API')
    expect(error.cause).toBeInstanceOf(Error)
  }),
)

effect('AdapterConnectionError should work with minimal required fields', () =>
  Effect.gen(function* () {
    const error = new AdapterConnectionError({
      adapter: 'ccb',
    })

    expect(error._tag).toBe('AdapterConnectionError')
    expect(error.adapter).toBe('ccb')
    expect(error.message).toBe('')
    expect(error.cause).toBeUndefined()
  }),
)

effect('AdapterValidationError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new AdapterValidationError({
      adapter: 'pco',
      cause: { validationErrors: ['email is required'] },
      entityName: 'Person',
      field: 'email',
      message: 'Email validation failed',
    })

    expect(error._tag).toBe('AdapterValidationError')
    expect(error.adapter).toBe('pco')
    expect(error.entityName).toBe('Person')
    expect(error.field).toBe('email')
    expect(error.message).toBe('Email validation failed')
    expect(error.cause).toEqual({ validationErrors: ['email is required'] })
  }),
)

effect('AdapterValidationError should work with minimal required fields', () =>
  Effect.gen(function* () {
    const error = new AdapterValidationError({
      adapter: 'ccb',
      entityName: 'Group',
      field: 'name',
    })

    expect(error._tag).toBe('AdapterValidationError')
    expect(error.adapter).toBe('ccb')
    expect(error.entityName).toBe('Group')
    expect(error.field).toBe('name')
    expect(error.message).toBe('')
    expect(error.cause).toBeUndefined()
  }),
)

effect('Error schemas should validate correctly', () =>
  Effect.gen(function* () {
    const syncErrorData = {
      _tag: 'AdapterSyncError',
      adapter: 'pco',
      entityName: 'Person',
      operation: 'create',
    }

    const result = yield* Schema.decodeUnknown(AdapterSyncError)(syncErrorData)
    expect(result._tag).toBe('AdapterSyncError')
    expect(result.adapter).toBe('pco')
    expect(result.entityName).toBe('Person')
    expect(result.operation).toBe('create')
  }),
)

effect('Error schemas should reject invalid data', () =>
  Effect.gen(function* () {
    const invalidData = {
      _tag: 'AdapterSyncError',
      adapter: 123, // Should be string
      entityName: 'Person',
      operation: 'create',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(AdapterSyncError)(invalidData))
    expect(result._tag).toBe('Failure')
  }),
)

effect('Error schemas should handle optional fields correctly', () =>
  Effect.gen(function* () {
    const dataWithOptionals = {
      _tag: 'UnsupportedAdapterError',
      adapter: 'test-adapter',
      message: 'Optional message',
    }

    const dataWithoutOptionals = {
      _tag: 'UnsupportedAdapterError',
      adapter: 'test-adapter',
    }

    const resultWith = yield* Schema.decodeUnknown(UnsupportedAdapterError)(dataWithOptionals)
    const resultWithout = yield* Schema.decodeUnknown(UnsupportedAdapterError)(dataWithoutOptionals)

    expect(resultWith.message).toBe('Optional message')
    expect(resultWithout.message).toBe('')
  }),
)

effect('Error encoding should work correctly', () =>
  Effect.gen(function* () {
    const error = new AdapterValidationError({
      adapter: 'pco',
      entityName: 'Person',
      field: 'email',
      message: 'Invalid email format',
    })

    const encoded = yield* Schema.encode(AdapterValidationError)(error)
    expect(encoded._tag).toBe('AdapterValidationError')
    expect(encoded.adapter).toBe('pco')
    expect(encoded.entityName).toBe('Person')
    expect(encoded.field).toBe('email')
    expect(encoded.message).toBe('Invalid email format')
  }),
)

effect('All adapter errors should have adapter field', () =>
  Effect.gen(function* () {
    const errors = [
      new UnsupportedAdapterError({ adapter: 'test' }),
      new AdapterSyncError({
        adapter: 'test',
        entityName: 'Test',
        operation: 'test',
      }),
      new AdapterTokenError({ adapter: 'test' }),
      new AdapterConnectionError({ adapter: 'test' }),
      new AdapterValidationError({
        adapter: 'test',
        entityName: 'Test',
        field: 'test',
      }),
    ]

    for (const error of errors) {
      expect(error.adapter).toBe('test')
      expect(typeof error._tag).toBe('string')
    }
  }),
)

effect('AdapterSyncError should handle various operation types', () =>
  Effect.gen(function* () {
    const operations = ['create', 'update', 'delete', 'sync', 'list']

    for (const operation of operations) {
      const error = new AdapterSyncError({
        adapter: 'test',
        entityName: 'TestEntity',
        operation,
      })

      expect(error.operation).toBe(operation)
    }
  }),
)

effect('Error cause field should accept any unknown value', () =>
  Effect.gen(function* () {
    const causes = [
      new Error('Standard error'),
      { message: 'Server error', status: 500 },
      'String error',
      123,
      null,
      undefined,
      ['array', 'of', 'errors'],
    ]

    for (const cause of causes) {
      const error = new AdapterTokenError({
        adapter: 'test',
        cause,
      })

      expect(error.cause).toBe(cause)
    }
  }),
)
