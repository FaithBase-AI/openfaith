import { FetchHttpClient, HttpLayerRouter } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { DBLive } from '@openfaith/db'
import { CoreRpc } from '@openfaith/domain'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { HttpAuthMiddlewareLive } from '@openfaith/server/live/httpAuthMiddlewareLive'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Layer } from 'effect'

// Create the handlers layer with basic dependencies
const HandlersLayer = CoreHandlerLive.pipe(
  Layer.provide(DBLive),
  Layer.provide(FetchHttpClient.layer),
)

// Create the RPC route using HttpLayerRouter
const RpcRoute = RpcServer.layerHttpRouter({
  group: CoreRpc,
  path: '/api/api',
  protocol: 'http',
}).pipe(
  Layer.provide(HandlersLayer),
  Layer.provide(RpcSerialization.layerJson),
  Layer.provide(HttpAuthMiddlewareLive.layer),
)

// Create the web handler using HttpLayerRouter.toWebHandler
const { handler } = HttpLayerRouter.toWebHandler(RpcRoute)

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
    return await handler(request)
  },
  async PUT({ request }) {
    return await handler(request)
  },
})
