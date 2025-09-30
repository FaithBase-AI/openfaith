import { NodeSdk } from '@effect/opentelemetry'
import {
  FetchHttpClient,
  HttpApiBuilder,
  HttpApiSwagger,
  HttpLayerRouter,
  HttpServer,
} from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { AdapterRpc, AdminRpc, AppHttpApi, CoreRpc } from '@openfaith/domain'
import { AdapterHandlerLive } from '@openfaith/server/handlers/adapterHandler'
import { AdapterWebhooksHandlerLive } from '@openfaith/server/handlers/adapterWebhooksHandler'
import { AdminHandlerLive } from '@openfaith/server/handlers/adminHandler'
import { CoreHandlerLive } from '@openfaith/server/handlers/coreHandler'
import { ZeroHandlerLive } from '@openfaith/server/handlers/zeroMutatorsHandler'
import { DBLive } from '@openfaith/server/live/dbLive'
import { SessionRpcMiddlewareLayer } from '@openfaith/server/live/sessionMiddlewareLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web'
import { Layer } from 'effect'

const BunSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'openfaith-api' },
  spanProcessor: [new BatchSpanProcessor(new OTLPTraceExporter())],
}))

// Create the handlers layer with basic dependencies
const HandlersLayer = Layer.mergeAll(
  CoreHandlerLive,
  AdapterHandlerLive,
  ZeroHandlerLive,
  AdminHandlerLive,
  AdapterWebhooksHandlerLive,
).pipe(
  Layer.provide(DBLive),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(WorkflowClient.Default),
)

// Create the Core RPC route using HttpLayerRouter
export const RpcRoute = RpcServer.layerHttpRouter({
  group: CoreRpc.merge(AdapterRpc, AdminRpc),
  path: '/api',
  protocol: 'http',
}).pipe(
  Layer.provide(HandlersLayer),
  Layer.provide(SessionRpcMiddlewareLayer),
  Layer.provide(RpcSerialization.layerJson),
)

// Create the Zero HTTP API route using HttpLayerRouter
export const HttpApiRoute = HttpLayerRouter.addHttpApi(AppHttpApi, {
  openapiPath: '/api/openapi.json',
}).pipe(Layer.provide(HandlersLayer), Layer.provide(HttpServer.layerContext))

export const ApiLive = HttpApiBuilder.api(AppHttpApi).pipe(Layer.provide(HandlersLayer))

export const SwaggerLayer = HttpApiSwagger.layer({
  path: '/api/docs',
}).pipe(Layer.provide(ApiLive))

// Main server layer that includes Core, Adapter, Zero, and Swagger together
export const ServerLive = Layer.mergeAll(
  HttpApiRoute,
  RpcRoute,
  SwaggerLayer,
  HttpServer.layerContext,
  BunSdkLive,
)
