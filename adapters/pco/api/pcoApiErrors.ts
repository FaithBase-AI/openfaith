import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ConflictError,
  GatewayTimeoutError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  ValidationError,
} from '@openfaith/adapter-core/api/apiErrors'
import { Array, pipe, Schema } from 'effect'

export const PcoErrorBody = Schema.Struct({
  errors: Schema.Tuple(
    Schema.Struct({
      code: Schema.String,
      detail: Schema.String,
      title: Schema.String,
    }),
  ),
})

export const PcoRateLimitError = Schema.transform(PcoErrorBody, RateLimitError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new RateLimitError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoValidationError = Schema.transform(PcoErrorBody, ValidationError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new ValidationError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoBadRequestError = Schema.transform(PcoErrorBody, BadRequestError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new BadRequestError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoAuthenticationError = Schema.transform(PcoErrorBody, AuthenticationError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new AuthenticationError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoAuthorizationError = Schema.transform(PcoErrorBody, AuthorizationError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new AuthorizationError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoNotFoundError = Schema.transform(PcoErrorBody, NotFoundError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new NotFoundError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoConflictError = Schema.transform(PcoErrorBody, ConflictError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new ConflictError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoInternalServerError = Schema.transform(PcoErrorBody, InternalServerError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new InternalServerError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoServiceUnavailableError = Schema.transform(PcoErrorBody, ServiceUnavailableError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new ServiceUnavailableError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})

export const PcoGatewayTimeoutError = Schema.transform(PcoErrorBody, GatewayTimeoutError, {
  decode: (body) => pipe(body.errors, Array.headNonEmpty, (x) => new GatewayTimeoutError(x)),
  encode: (error) =>
    ({
      errors: [
        {
          code: error.code,
          detail: error.detail,
          title: error.title,
        },
      ],
    }) as const,
  strict: true,
})
