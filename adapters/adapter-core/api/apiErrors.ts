import { Schema } from 'effect'

// Base error structure used by many APIs
const BaseErrorFields = {
  code: Schema.String,
  detail: Schema.String,
  title: Schema.String,
}

// Rate limiting errors (429)
export class RateLimitError extends Schema.TaggedError<RateLimitError>()(
  'RateLimitError',
  BaseErrorFields,
) {}

// Validation errors (422)
export class ValidationError extends Schema.TaggedError<ValidationError>()(
  'ValidationError',
  BaseErrorFields,
) {}

// Authentication errors (401)
export class AuthenticationError extends Schema.TaggedError<AuthenticationError>()(
  'AuthenticationError',
  BaseErrorFields,
) {}

// Authorization errors (403)
export class AuthorizationError extends Schema.TaggedError<AuthorizationError>()(
  'AuthorizationError',
  BaseErrorFields,
) {}

// Not found errors (404)
export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  'NotFoundError',
  BaseErrorFields,
) {}

// Conflict errors (409)
export class ConflictError extends Schema.TaggedError<ConflictError>()(
  'ConflictError',
  BaseErrorFields,
) {}

// Internal server errors (500)
export class InternalServerError extends Schema.TaggedError<InternalServerError>()(
  'InternalServerError',
  BaseErrorFields,
) {}

// Service unavailable errors (503)
export class ServiceUnavailableError extends Schema.TaggedError<ServiceUnavailableError>()(
  'ServiceUnavailableError',
  BaseErrorFields,
) {}

// Bad request errors (400)
export class BadRequestError extends Schema.TaggedError<BadRequestError>()(
  'BadRequestError',
  BaseErrorFields,
) {}

// Timeout errors (408)
export class TimeoutError extends Schema.TaggedError<TimeoutError>()(
  'TimeoutError',
  BaseErrorFields,
) {}

// Generic API error for cases where we need a structured error but don't have a specific type
export class GenericApiError extends Schema.TaggedError<GenericApiError>()('GenericApiError', {
  ...BaseErrorFields,
  status: Schema.Number,
}) {}
