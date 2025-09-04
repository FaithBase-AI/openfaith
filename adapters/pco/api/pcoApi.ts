import {
  HttpApi,
  HttpApiClient,
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  type HttpClientResponse,
} from '@effect/platform'
import { RateLimiter, TokenAuth, TokenKey } from '@openfaith/adapter-core/server'
import { toPcoHttpApiGroup } from '@openfaith/pco/api/pcoMkEntityManifest'
import { tokenApiGroup } from '@openfaith/pco/api/pcoTokenApi'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { Duration, Effect, Layer, Number, Option, pipe, Schedule } from 'effect'

const peopleApiGroup = toPcoHttpApiGroup(pcoEntityManifest.Person)
const addressApiGroup = toPcoHttpApiGroup(pcoEntityManifest.Address)
const campusApiGroup = toPcoHttpApiGroup(pcoEntityManifest.Campus)
const phoneNumberApiGroup = toPcoHttpApiGroup(pcoEntityManifest.PhoneNumber)
const webhookApiGroup = toPcoHttpApiGroup(pcoEntityManifest.WebhookSubscription)

export const PcoApi = HttpApi.make('PCO')
  .add(peopleApiGroup)
  .add(addressApiGroup)
  .add(campusApiGroup)
  .add(phoneNumberApiGroup)
  .add(webhookApiGroup)
  .add(tokenApiGroup)

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
    case 422:
    case 429:
      return Effect.fail(
        new HttpClientError.ResponseError({
          reason: 'StatusCode',
          request: response.request,
          response,
        }),
      )

    case 500:
    case 503:
    case 504:
      return Effect.fail(
        new HttpClientError.ResponseError({
          reason: 'StatusCode',
          request: response.request,
          response,
        }),
      )

    default:
      if (response.status >= 400) {
        return Effect.fail(
          new HttpClientError.ResponseError({
            reason: 'StatusCode',
            request: response.request,
            response,
          }),
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
          console.log('Using PCO token for request')
          return HttpClientRequest.bearerToken(request, token)
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
