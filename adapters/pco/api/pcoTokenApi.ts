import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import {
  PcoAuthenticationError,
  PcoAuthorizationError,
  PcoBadRequestError,
  PcoConflictError,
  PcoGatewayTimeoutError,
  PcoInternalServerError,
  PcoNotFoundError,
  PcoRateLimitError,
  PcoServiceUnavailableError,
  PcoValidationError,
} from '@openfaith/pco/api/pcoApiErrors'
import { PcoRefreshToken, PcoToken } from '@openfaith/pco/modules/token/pcoTokenSchema'
import { Schema } from 'effect'

/**
 * PCO OAuth Token API Group
 * Handles OAuth token exchange and refresh operations
 */
export const tokenApiGroup = HttpApiGroup.make('token')
  .add(
    HttpApiEndpoint.post('getToken', '/oauth/token')
      .setUrlParams(
        Schema.Struct({
          client_id: Schema.String,
          client_secret: Schema.String,
          code: Schema.String,
          grant_type: Schema.Literal('authorization_code'),
          redirect_uri: Schema.String,
        }),
      )
      .addSuccess(PcoToken),
  )
  .add(
    HttpApiEndpoint.post('refreshToken', '/oauth/token')
      .setUrlParams(
        Schema.Struct({
          client_id: Schema.String,
          client_secret: Schema.String,
          grant_type: Schema.Literal('refresh_token'),
          refresh_token: Schema.String,
        }),
      )
      .addSuccess(PcoRefreshToken),
  )
  .addError(PcoBadRequestError, { status: 400 })
  .addError(PcoAuthenticationError, { status: 401 })
  .addError(PcoAuthorizationError, { status: 403 })
  .addError(PcoNotFoundError, { status: 404 })
  .addError(PcoConflictError, { status: 409 })
  .addError(PcoValidationError, { status: 422 })
  .addError(PcoRateLimitError, { status: 429 })
  .addError(PcoInternalServerError, { status: 500 })
  .addError(PcoServiceUnavailableError, { status: 503 })
  .addError(PcoGatewayTimeoutError, { status: 504 })
