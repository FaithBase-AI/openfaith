import {
  type HttpApi,
  HttpApiClient,
  type HttpApiGroup,
  HttpApiMiddleware,
  HttpApiSchema,
  HttpApiSecurity,
} from '@effect/platform'
import type { SimpleRuntimeConfig } from '@openfaith/adapter-core/api/apiConfig'
import { Effect, Layer, Redacted, Schema } from 'effect'

/**
 * @internal
 * A specific, tagged error representing a 401 Unauthorized response.
 * This is used by the `Authorization` middleware to define its failure type.
 */
class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  'Unauthorized',
  {},
  HttpApiSchema.annotations({ status: 401 }),
) {}

/**
 * @internal
 * Defines the static requirement for Bearer token authentication.
 *
 * This middleware tag annotates an `HttpApi` to declare that its endpoints
 * are protected and require a security handler that can provide a 'bearer' token.
 * It does not contain the token itself, only the requirement.
 */
class Authorization extends HttpApiMiddleware.Tag<Authorization>()('Authorization', {
  /** The error type to return if authentication fails. */
  failure: Unauthorized,
  /** The security schemes this middleware implements. */
  security: {
    bearer: HttpApiSecurity.bearer,
  },
}) {}

/**
 * @internal
 * Creates a live `Layer` that provides the runtime implementation for the `Authorization` middleware.
 *
 * This function takes a runtime token and returns a layer that knows how to satisfy
 * the `bearer` security requirement defined in the `Authorization` tag.
 *
 * @param token The Bearer token string to be used for authentication.
 * @returns A `Layer` that provides the `Authorization` service.
 */
export const AuthorizationLive = (token: string): Layer.Layer<Authorization> =>
  Layer.effect(
    Authorization,
    Effect.succeed({
      // The key 'bearer' must match the key in the 'security' object of the Authorization definition.
      bearer: () => Effect.succeed(Redacted.make(token)),
    }),
  )

/**
 * Creates a fully configured and executable API client from a static API definition and runtime configuration.
 *
 * This function acts as the primary factory for instantiating an API client. It performs two key steps:
 * 1. Derives a client from the `HttpApi` definition, annotating it with the `Authorization` security middleware.
 * 2. Immediately provides the live implementation for that middleware using the provided `authToken`.
 *
 * The resulting `Effect` is ready to be run, requiring only a base `HttpClient` implementation (like `FetchHttpClient`).
 *
 * @template ApiId The ID of the API.
 * @template Groups The groups belonging to the API.
 * @template ApiError The error type of the API.
 * @template ApiR The context requirement of the API.
 * @param api The static `HttpApi` definition object for the target API.
 * @param config The runtime configuration containing the `baseUrl` and `authToken`.
 * @returns An `Effect` that, when executed, resolves to a fully typed and authenticated API client.
 * The `Effect`'s context requirement will be the base `HttpClient`.
 */
export function createApi<
  ApiId extends string,
  Groups extends HttpApiGroup.HttpApiGroup.Any,
  ApiError,
  ApiR,
>(api: HttpApi.HttpApi<ApiId, Groups, ApiError, ApiR>, config: SimpleRuntimeConfig) {
  // Statically annotate the entire API, marking all its endpoints as requiring Authorization.
  const securedApi = api.middleware(Authorization)

  // Derive the client. The resulting `clientEffect` now requires both `HttpClient` and `Authorization` to run.
  const clientEffect = HttpApiClient.make(securedApi, {
    baseUrl: config.baseUrl,
  })

  // Immediately satisfy the `Authorization` requirement by providing the live layer with the token.
  // The returned Effect now only requires `HttpClient`.
  return clientEffect.pipe(Effect.provide(AuthorizationLive(config.authToken)))
}
