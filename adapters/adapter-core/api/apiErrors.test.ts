import { expect } from 'bun:test'
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ConflictError,
  GatewayTimeoutError,
  GenericApiError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  TimeoutError,
  ValidationError,
} from '@openfaith/adapter-core/api/apiErrors'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'

effect('RateLimitError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new RateLimitError({
      code: 'RATE_LIMIT_EXCEEDED',
      detail: 'Too many requests',
      title: 'Rate Limit Exceeded',
    })

    expect(error._tag).toBe('RateLimitError')
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(error.detail).toBe('Too many requests')
    expect(error.title).toBe('Rate Limit Exceeded')
  }),
)

effect('ValidationError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new ValidationError({
      code: 'VALIDATION_FAILED',
      detail: 'Invalid input data',
      title: 'Validation Error',
    })

    expect(error._tag).toBe('ValidationError')
    expect(error.code).toBe('VALIDATION_FAILED')
    expect(error.detail).toBe('Invalid input data')
    expect(error.title).toBe('Validation Error')
  }),
)

effect('AuthenticationError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new AuthenticationError({
      code: 'INVALID_TOKEN',
      detail: 'Authentication token is invalid',
      title: 'Authentication Failed',
    })

    expect(error._tag).toBe('AuthenticationError')
    expect(error.code).toBe('INVALID_TOKEN')
    expect(error.detail).toBe('Authentication token is invalid')
    expect(error.title).toBe('Authentication Failed')
  }),
)

effect('AuthorizationError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new AuthorizationError({
      code: 'INSUFFICIENT_PERMISSIONS',
      detail: 'User lacks required permissions',
      title: 'Authorization Failed',
    })

    expect(error._tag).toBe('AuthorizationError')
    expect(error.code).toBe('INSUFFICIENT_PERMISSIONS')
    expect(error.detail).toBe('User lacks required permissions')
    expect(error.title).toBe('Authorization Failed')
  }),
)

effect('NotFoundError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new NotFoundError({
      code: 'RESOURCE_NOT_FOUND',
      detail: 'The requested resource was not found',
      title: 'Not Found',
    })

    expect(error._tag).toBe('NotFoundError')
    expect(error.code).toBe('RESOURCE_NOT_FOUND')
    expect(error.detail).toBe('The requested resource was not found')
    expect(error.title).toBe('Not Found')
  }),
)

effect('ConflictError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new ConflictError({
      code: 'RESOURCE_CONFLICT',
      detail: 'Resource already exists',
      title: 'Conflict',
    })

    expect(error._tag).toBe('ConflictError')
    expect(error.code).toBe('RESOURCE_CONFLICT')
    expect(error.detail).toBe('Resource already exists')
    expect(error.title).toBe('Conflict')
  }),
)

effect('InternalServerError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new InternalServerError({
      code: 'INTERNAL_ERROR',
      detail: 'An internal server error occurred',
      title: 'Internal Server Error',
    })

    expect(error._tag).toBe('InternalServerError')
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.detail).toBe('An internal server error occurred')
    expect(error.title).toBe('Internal Server Error')
  }),
)

effect('ServiceUnavailableError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new ServiceUnavailableError({
      code: 'SERVICE_UNAVAILABLE',
      detail: 'Service is temporarily unavailable',
      title: 'Service Unavailable',
    })

    expect(error._tag).toBe('ServiceUnavailableError')
    expect(error.code).toBe('SERVICE_UNAVAILABLE')
    expect(error.detail).toBe('Service is temporarily unavailable')
    expect(error.title).toBe('Service Unavailable')
  }),
)

effect('BadRequestError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new BadRequestError({
      code: 'BAD_REQUEST',
      detail: 'The request was malformed',
      title: 'Bad Request',
    })

    expect(error._tag).toBe('BadRequestError')
    expect(error.code).toBe('BAD_REQUEST')
    expect(error.detail).toBe('The request was malformed')
    expect(error.title).toBe('Bad Request')
  }),
)

effect('TimeoutError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new TimeoutError({
      code: 'REQUEST_TIMEOUT',
      detail: 'Request timed out',
      title: 'Timeout',
    })

    expect(error._tag).toBe('TimeoutError')
    expect(error.code).toBe('REQUEST_TIMEOUT')
    expect(error.detail).toBe('Request timed out')
    expect(error.title).toBe('Timeout')
  }),
)

effect('GatewayTimeoutError should create valid error instance', () =>
  Effect.gen(function* () {
    const error = new GatewayTimeoutError({
      code: 'GATEWAY_TIMEOUT',
      detail: 'Gateway timeout occurred',
      title: 'Gateway Timeout',
    })

    expect(error._tag).toBe('GatewayTimeoutError')
    expect(error.code).toBe('GATEWAY_TIMEOUT')
    expect(error.detail).toBe('Gateway timeout occurred')
    expect(error.title).toBe('Gateway Timeout')
  }),
)

effect('GenericApiError should create valid error instance with status', () =>
  Effect.gen(function* () {
    const error = new GenericApiError({
      code: 'GENERIC_ERROR',
      detail: 'A generic error occurred',
      status: 418,
      title: 'Generic Error',
    })

    expect(error._tag).toBe('GenericApiError')
    expect(error.code).toBe('GENERIC_ERROR')
    expect(error.detail).toBe('A generic error occurred')
    expect(error.title).toBe('Generic Error')
    expect(error.status).toBe(418)
  }),
)

effect('Error schemas should validate correctly', () =>
  Effect.gen(function* () {
    const rateLimitData = {
      _tag: 'RateLimitError',
      code: 'RATE_LIMIT',
      detail: 'Rate limit exceeded',
      title: 'Rate Limit',
    }

    const result = yield* Schema.decodeUnknown(RateLimitError)(rateLimitData)
    expect(result._tag).toBe('RateLimitError')
    expect(result.code).toBe('RATE_LIMIT')
  }),
)

effect('Error schemas should reject invalid data', () =>
  Effect.gen(function* () {
    const invalidData = {
      _tag: 'RateLimitError',
      code: 123, // Should be string
      detail: 'Rate limit exceeded',
      title: 'Rate Limit',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(RateLimitError)(invalidData))
    expect(result._tag).toBe('Failure')
  }),
)

effect('All error types should extend base error fields', () =>
  Effect.gen(function* () {
    const errors = [
      new RateLimitError({ code: 'test', detail: 'test', title: 'test' }),
      new ValidationError({ code: 'test', detail: 'test', title: 'test' }),
      new AuthenticationError({ code: 'test', detail: 'test', title: 'test' }),
      new AuthorizationError({ code: 'test', detail: 'test', title: 'test' }),
      new NotFoundError({ code: 'test', detail: 'test', title: 'test' }),
      new ConflictError({ code: 'test', detail: 'test', title: 'test' }),
      new InternalServerError({ code: 'test', detail: 'test', title: 'test' }),
      new ServiceUnavailableError({
        code: 'test',
        detail: 'test',
        title: 'test',
      }),
      new BadRequestError({ code: 'test', detail: 'test', title: 'test' }),
      new TimeoutError({ code: 'test', detail: 'test', title: 'test' }),
      new GatewayTimeoutError({ code: 'test', detail: 'test', title: 'test' }),
    ]

    for (const error of errors) {
      expect(error.code).toBe('test')
      expect(error.detail).toBe('test')
      expect(error.title).toBe('test')
      expect(typeof error._tag).toBe('string')
    }
  }),
)

effect('GenericApiError should include status field', () =>
  Effect.gen(function* () {
    const error = new GenericApiError({
      code: 'test',
      detail: 'test',
      status: 500,
      title: 'test',
    })

    expect(error.status).toBe(500)
    expect(error.code).toBe('test')
    expect(error.detail).toBe('test')
    expect(error.title).toBe('test')
  }),
)

effect('Error encoding should work correctly', () =>
  Effect.gen(function* () {
    const error = new ValidationError({
      code: 'VALIDATION_ERROR',
      detail: 'Field is required',
      title: 'Validation Failed',
    })

    const encoded = yield* Schema.encode(ValidationError)(error)
    expect(encoded._tag).toBe('ValidationError')
    expect(encoded.code).toBe('VALIDATION_ERROR')
    expect(encoded.detail).toBe('Field is required')
    expect(encoded.title).toBe('Validation Failed')
  }),
)
