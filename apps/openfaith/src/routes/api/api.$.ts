import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSwagger,
  HttpServer,
} from '@effect/platform'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Effect, Layer, Schema } from 'effect'

// 1. Define the API with a single group and endpoint
const api = HttpApi.make('api').add(
  HttpApiGroup.make('main').add(HttpApiEndpoint.get('hello', '/').addSuccess(Schema.String)),
)

// 2. Implement the group handler
const mainGroupLive = HttpApiBuilder.group(api, 'main', (handlers) =>
  handlers.handle('hello', () => Effect.succeed('Hello, world!')),
)

// 3. Provide the implementation for the API
const ApiLive = HttpApiBuilder.api(api).pipe(Layer.provide(mainGroupLive))

// 4. Optionally add Swagger docs (not required for Tanstack, but useful for dev)
const SwaggerLayer = HttpApiSwagger.layer().pipe(Layer.provide(ApiLive))

// 5. Create the web handler (no NodeHttpServer needed for Tanstack Start)
const { handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(ApiLive, SwaggerLayer, HttpServer.layerContext),
)

// 6. Export using Tanstack's createAPIFileRoute convention
export const ServerRoute = createServerFileRoute('/api/test/$').methods({
  async GET({ request }) {
    // Forward the request to the Effect handler
    return await handler(request)
  },
})
