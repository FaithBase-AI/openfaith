import {
  FetchHttpClient,
  HttpApiBuilder,
  HttpApiSwagger,
  HttpLayerRouter,
  HttpServer,
} from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { AdapterRpc, CoreRpc, ZeroMutatorsApi } from '@openfaith/domain'
import { AdapterHandlerLive } from '@openfaith/server/handlers/adapterHandler'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { ZeroHandlerLive } from '@openfaith/server/handlers/zeroMutatorsHandler'
import { DBLive } from '@openfaith/server/live/dbLive'
import { SessionRpcMiddlewareLayer } from '@openfaith/server/live/sessionMiddlewareLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Layer } from 'effect'

// Create the handlers layer with basic dependencies
const HandlersLayer = Layer.mergeAll(CoreHandlerLive, AdapterHandlerLive, ZeroHandlerLive).pipe(
  Layer.provide(DBLive),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(WorkflowClient.Default),
)

// Create the Core RPC route using HttpLayerRouter
export const RpcRoute = RpcServer.layerHttpRouter({
  group: CoreRpc.merge(AdapterRpc),
  path: '/api/api',
  protocol: 'http',
}).pipe(
  Layer.provide(HandlersLayer),
  Layer.provide(SessionRpcMiddlewareLayer),
  Layer.provide(RpcSerialization.layerJson),
)

// Create the Zero HTTP API route using HttpLayerRouter
export const HttpApiRoute = HttpLayerRouter.addHttpApi(ZeroMutatorsApi, {
  openapiPath: '/api/api/openapi.json',
}).pipe(Layer.provide(HandlersLayer), Layer.provide(HttpServer.layerContext))

export const ApiLive = HttpApiBuilder.api(ZeroMutatorsApi).pipe(Layer.provide(HandlersLayer))

export const SwaggerLayer = HttpApiSwagger.layer({
  path: '/api/api/docs',
}).pipe(Layer.provide(ApiLive))

// Main server layer that includes Core, Adapter, Zero, and Swagger together
export const ServerLive = Layer.mergeAll(
  HttpApiRoute,
  RpcRoute,
  SwaggerLayer,
  HttpServer.layerContext,
)
