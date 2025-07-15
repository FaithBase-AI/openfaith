import { HttpApiBuilder, HttpServer } from '@effect/platform'
import { ApiLive, SwaggerLayer } from '@openfaith/server'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Layer } from 'effect'

// // Create the handlers layer with basic dependencies
// const HandlersLayer = Layer.mergeAll(CoreHandlerLive, AdapterHandlerLive).pipe(
//   Layer.provide(DBLive),
//   Layer.provide(FetchHttpClient.layer),
// )

// // Create the RPC route using HttpLayerRouter
// const RpcRoute = RpcServer.layerHttpRouter({
//   group: CoreRpc.merge(AdapterRpc),
//   path: '/api/api',
//   protocol: 'http',
// })

// Create the web handler using HttpLayerRouter.toWebHandler
// const { handler } = HttpLayerRouter.toWebHandler(ServerLive)

const { handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(ApiLive, SwaggerLayer, HttpServer.layerContext),
)

export const ServerRoute = createServerFileRoute('/api/api/$').methods({
  async DELETE({ request }) {
    return await handler(request)
  },
  async GET({ request }) {
    return await handler(request)
  },
  async PATCH({ request }) {
    return await handler(request)
  },
  async POST({ request }) {
    console.log('POST', request)
    return await handler(request)
  },
  async PUT({ request }) {
    return await handler(request)
  },
})
