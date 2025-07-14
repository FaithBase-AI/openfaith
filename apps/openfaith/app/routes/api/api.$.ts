import { FetchHttpClient, HttpLayerRouter } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { DBLive } from '@openfaith/db'
import { AdapterRpc, CoreRpc } from '@openfaith/domain'
import { AdapterHandlerLive, CoreHandlerLive, HttpAuthMiddlewareLive } from '@openfaith/server'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { Layer } from 'effect'

// Create the handlers layer with basic dependencies
const HandlersLayer = Layer.mergeAll(CoreHandlerLive, AdapterHandlerLive).pipe(
  Layer.provide(DBLive),
  Layer.provide(FetchHttpClient.layer),
)

// Create the RPC route using HttpLayerRouter
const CoreRpcRoute = RpcServer.layerHttpRouter({
  group: CoreRpc,
  path: '/api/api',
  protocol: 'http',
}).pipe(Layer.provide(HttpAuthMiddlewareLive.layer))

const AdapterRpcRoute = RpcServer.layerHttpRouter({
  group: AdapterRpc,
  path: '/api/api',
  protocol: 'http',
})

const Foo = Layer.mergeAll(CoreRpcRoute, AdapterRpcRoute).pipe(
  Layer.provide(HttpAuthMiddlewareLive.layer),
  Layer.provide(HandlersLayer),
  Layer.provide(RpcSerialization.layerJson),
)

// Create the web handler using HttpLayerRouter.toWebHandler
const { handler } = HttpLayerRouter.toWebHandler(Foo)

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
