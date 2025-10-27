import {
  HttpApi,
  HttpApiClient,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  type HttpClientResponse,
} from '@effect/platform'
import { RateLimiter, TokenAuth, TokenKey } from '@openfaith/adapter-core/server'
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
import { toPcoHttpApiGroup } from '@openfaith/pco/api/pcoMkEntityManifest'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { PcoRefreshToken, PcoToken } from '@openfaith/pco/modules/token/pcoTokenSchema'
import { Duration, Effect, Layer, Number, Option, pipe, Schedule, Schema, String } from 'effect'

const tokenApiGroup = HttpApiGroup.make('token')
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

const personApiGroup = toPcoHttpApiGroup(pcoEntityManifest.entities.Person)
const addressApiGroup = toPcoHttpApiGroup(pcoEntityManifest.entities.Address)
const campusApiGroup = toPcoHttpApiGroup(pcoEntityManifest.entities.Campus)
const phoneNumberApiGroup = toPcoHttpApiGroup(pcoEntityManifest.entities.PhoneNumber)
const webhookApiGroup = toPcoHttpApiGroup(pcoEntityManifest.entities.WebhookSubscription)
const groupApiGroup = toPcoHttpApiGroup(pcoEntityManifest.entities.Group)
const teamApiGroup = toPcoHttpApiGroup(pcoEntityManifest.entities.Team)

export const PcoApi = HttpApi.make('PCO')
  .add(personApiGroup)
  .add(addressApiGroup)
  .add(campusApiGroup)
  .add(phoneNumberApiGroup)
  .add(tokenApiGroup)
  .add(webhookApiGroup)
  .add(groupApiGroup)
  .add(teamApiGroup)

const calculateRateLimitDelay = (
  response: HttpClientResponse.HttpClientResponse,
): Duration.Duration => {
  return pipe(
    response.headers,
    Option.fromNullable,
    Option.flatMapNullable((headers) => headers['retry-after']),
    Option.flatMap(Number.parse),
    Option.getOrElse(() => 20),
    Duration.seconds,
  )
}

const handlePcoError = (
  response: HttpClientResponse.HttpClientResponse,
): Effect.Effect<HttpClientResponse.HttpClientResponse, HttpClientError.HttpClientError> => {
  switch (response.status) {
    case 401:
    case 403:
    case 404:
    case 409:
    case 429:
    case 422:
      return pipe(
        response.json,
        Effect.orElse(() => Effect.succeed({ message: 'Failed to parse body' })),
        Effect.flatMap((body) =>
          Effect.fail(
            new HttpClientError.ResponseError({
              cause: body,
              reason: 'StatusCode',
              request: response.request,
              response,
            }),
          ),
        ),
      )

    case 500:
    case 503:
    case 504:
      return pipe(
        response.json,
        Effect.orElse(() => Effect.succeed({ message: 'Failed to parse body' })),
        Effect.flatMap((body) =>
          Effect.fail(
            new HttpClientError.ResponseError({
              cause: body,
              reason: 'StatusCode',
              request: response.request,
              response,
            }),
          ),
        ),
      )

    default:
      if (response.status >= 400) {
        return pipe(
          response.json,
          Effect.orElse(() => Effect.succeed({ message: 'Failed to parse body' })),
          Effect.flatMap((body) =>
            Effect.fail(
              new HttpClientError.ResponseError({
                cause: body,
                reason: 'StatusCode',
                request: response.request,
                response,
              }),
            ),
          ),
        )
      }
      return Effect.succeed(response)
  }
}

export class PcoHttpClient extends Effect.Service<PcoHttpClient>()('PcoHttpClient', {
  effect: Effect.gen(function* () {
    const tokenAuth = yield* TokenAuth
    const limiter = yield* RateLimiter.RateLimiter
    const tokenKey = yield* TokenKey
    const getRateLimitedAccessToken = Effect.zipRight(
      limiter.maybeWait(`pco:rate-limit:${tokenKey}`, Duration.seconds(20), 101),
      tokenAuth.getValidAccessToken,
    )

    const client = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequestEffect(
        Effect.fn(function* (request) {
          const token = yield* getRateLimitedAccessToken

          const tokenResponse = HttpClientRequest.bearerToken(request, token)

          // PCO doesn't let you set the API version for webhook subscriptions in the app config, so you have to set it with the header.
          if (pipe(request.url, String.includes('webhook_subscriptions'))) {
            return tokenResponse.pipe(
              HttpClientRequest.setHeader('X-PCO-API-Version', '2022-10-20'),
            )
          }

          return tokenResponse
        }),
      ),
      HttpClient.transformResponse((responseEffect) => {
        return pipe(
          responseEffect,
          Effect.flatMap(handlePcoError),
          Effect.retry({
            schedule: Schedule.identity<HttpClientError.ResponseError>().pipe(
              Schedule.addDelay((error) => {
                if (error instanceof HttpClientError.ResponseError) {
                  if (error.response.status === 429) {
                    return calculateRateLimitDelay(error.response)
                  }
                  if (error.response.status >= 500) {
                    return Duration.seconds(1)
                  }
                }
                return Duration.zero
              }),
              Schedule.intersect(Schedule.recurs(5)),
            ),
            while: (error) => {
              if (error instanceof HttpClientError.ResponseError) {
                const status = error.response.status
                return status === 429 || status >= 500
              }
              return false
            },
          }),
          Effect.catchAll((error) => {
            if (error instanceof HttpClientError.ResponseError) {
              console.log(`PCO API request failed after retries: ${error.response.status}`)
            }
            return Effect.fail(error)
          }),
        )
      }),
    )

    return yield* HttpApiClient.makeWith(PcoApi, {
      baseUrl: 'https://api.planningcenteronline.com',
      httpClient: client,
    })
  }),
}) {}

export const BasePcoApiLayer = Layer.empty.pipe(Layer.provideMerge(PcoHttpClient.Default))
