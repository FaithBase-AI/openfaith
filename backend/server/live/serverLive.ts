import { FetchHttpClient, HttpLayerRouter } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { DBLive } from '@openfaith/db'
import { AdapterRpc, CoreRpc, ZeroMutatorsApi } from '@openfaith/domain'
import { AdapterHandlerLive } from '@openfaith/server/handlers/adapterHandler'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { ZeroMutatorsHandlerLive } from '@openfaith/server/handlers/zeroMutatorsHandler'
import { HttpAuthMiddlewareLive } from '@openfaith/server/live/httpAuthMiddlewareLive'
import { Layer } from 'effect'

// Create the handlers layer with basic dependencies
const HandlersLayer = Layer.mergeAll(CoreHandlerLive, AdapterHandlerLive).pipe(
  Layer.provide(DBLive),
  Layer.provide(FetchHttpClient.layer),
)

// Create the Core RPC route using HttpLayerRouter
const CoreRpcRoute = RpcServer.layerHttpRouter({
  group: CoreRpc,
  path: '/rpc/core',
  protocol: 'http',
}).pipe(
  Layer.provide(HandlersLayer),
  Layer.provide(RpcSerialization.layerJson),
  Layer.provide(HttpAuthMiddlewareLive.layer),
)

// Create the Adapter RPC route using HttpLayerRouter
const AdapterRpcRoute = RpcServer.layerHttpRouter({
  group: AdapterRpc,
  path: '/rpc/adapter',
  protocol: 'http',
}).pipe(
  Layer.provide(HandlersLayer),
  Layer.provide(RpcSerialization.layerJson),
  Layer.provide(HttpAuthMiddlewareLive.layer),
)

// Create the Zero HTTP API route using HttpLayerRouter
const ZeroApiRoute = HttpLayerRouter.addHttpApi(ZeroMutatorsApi, {
  openapiPath: '/docs/zero-openapi.json',
}).pipe(Layer.provide(ZeroMutatorsHandlerLive))

// Main server layer that includes Core, Adapter, and Zero together
export const ServerLive = Layer.mergeAll(CoreRpcRoute, AdapterRpcRoute, ZeroApiRoute)
