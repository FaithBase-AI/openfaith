import { ClusterWorkflowEngine, RunnerAddress } from '@effect/cluster'
import { NodeSdk } from '@effect/opentelemetry'
import {
  FetchHttpClient,
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from '@effect/platform'
import { BunClusterRunnerSocket, BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { WorkflowProxyServer } from '@effect/workflow'
import { DBLive, TokenManagerLive } from '@openfaith/server'
import { env } from '@openfaith/shared'
import { HealthLive, WorkflowApi, workflows } from '@openfaith/workers/api/workflowApi'
import { CreateOrgWorkflowLayer } from '@openfaith/workers/workflows/createOrgWorkflow'
import { ExternalPushEntityWorkflowLayer } from '@openfaith/workers/workflows/externalPushEntityWorkflow'
import { ExternalPushWorkflowLayer } from '@openfaith/workers/workflows/externalPushWorkflow'
import { ExternalSyncEntityWorkflowLayer } from '@openfaith/workers/workflows/externalSyncEntityWorkflow'
import { ExternalSyncWorkflowLayer } from '@openfaith/workers/workflows/externalSyncWorkflow'
import { ExternalWebhookWorkflowLayer } from '@openfaith/workers/workflows/externalWebhookWorkflow'
import { TestWorkflowLayer } from '@openfaith/workers/workflows/testWorkflow'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Layer, Logger, Option } from 'effect'

// NodeSDK layer for telemetry

const BunSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'openfaith-workflow-runner' },
  spanProcessor: [new BatchSpanProcessor(new OTLPTraceExporter())],
}))

// Workflow engine layer
const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(
    BunClusterRunnerSocket.layer({
      shardingConfig: {
        runnerAddress: Option.some(RunnerAddress.make(env.WORKERS_HOST, 34431)),
        runnerListenAddress: Option.some(RunnerAddress.make('0.0.0.0', 34431)),
        shardManagerAddress: RunnerAddress.make(env.SHARD_MANAGER_HOST, 8080),
      },
      storage: 'sql',
    }),
  ),
)

const port = 3020

const EnvLayer = Layer.mergeAll(
  ExternalSyncWorkflowLayer,
  ExternalWebhookWorkflowLayer,
  ExternalSyncEntityWorkflowLayer,
  ExternalPushWorkflowLayer,
  ExternalPushEntityWorkflowLayer,
  CreateOrgWorkflowLayer,
  TestWorkflowLayer,
).pipe(
  Layer.provide(WorkflowEngineLayer),
  Layer.provideMerge(TokenManagerLive),
  Layer.provideMerge(DBLive),
)

const WorkflowApiLive = HttpApiBuilder.api(WorkflowApi).pipe(
  Layer.provide(WorkflowProxyServer.layerHttpApi(WorkflowApi, 'workflows', workflows)),
  Layer.provide(HealthLive),
  Layer.provide(EnvLayer),
  HttpServer.withLogAddress,
)

export const SwaggerLayer = HttpApiSwagger.layer({
  path: '/api/docs',
}).pipe(Layer.provide(WorkflowApiLive))

// Set up the server using NodeHttpServer on port 3020
const ServerLayer = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(WorkflowApiLive),
  Layer.provide(Logger.pretty),
  Layer.provide(SwaggerLayer),
  Layer.provide(BunHttpServer.layer({ port })),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(BunSdkLive),
)

BunRuntime.runMain(Layer.launch(ServerLayer))
