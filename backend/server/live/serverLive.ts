import {
  FetchHttpClient,
  HttpApiBuilder,
  HttpApiSwagger,
  HttpLayerRouter,
  HttpServer,
} from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { AdapterRpc, CoreRpc, MainApi } from '@openfaith/domain'
import { AdapterHandlerLive } from '@openfaith/server/handlers/adapterHandler'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { WebhookHandlerLive } from '@openfaith/server/handlers/webhookHandler'
import { ZeroHandlerLive } from '@openfaith/server/handlers/zeroMutatorsHandler'
import { DBLive } from '@openfaith/server/live/dbLive'
import { SessionRpcMiddlewareLayer } from '@openfaith/server/live/sessionMiddlewareLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { Layer } from 'effect'

// Create the handlers layer with basic dependencies
const HandlersLayer = Layer.mergeAll(
  CoreHandlerLive,
  AdapterHandlerLive,
  ZeroHandlerLive,
  WebhookHandlerLive,
).pipe(
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

// Create the combined HTTP API route using HttpLayerRouter
export const HttpApiRoute = HttpLayerRouter.addHttpApi(MainApi, {
  openapiPath: '/api/openapi.json',
}).pipe(Layer.provide(HandlersLayer), Layer.provide(HttpServer.layerContext))

export const ApiLive = HttpApiBuilder.api(MainApi).pipe(Layer.provide(HandlersLayer))

export const SwaggerLayer = HttpApiSwagger.layer({
  path: '/api/docs',
}).pipe(Layer.provide(ApiLive))

// Main server layer that includes everything
export const ServerLive = Layer.mergeAll(
  HttpApiRoute,
  RpcRoute,
  SwaggerLayer,
  HttpServer.layerContext,
)
