import { createServer } from 'node:http'
import { ClusterWorkflowEngine } from '@effect/cluster'
import { NodeSdk } from '@effect/opentelemetry'
import { FetchHttpClient, HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform'
import { NodeClusterRunnerSocket, NodeHttpServer, NodeRuntime } from '@effect/platform-node'
import { WorkflowProxyServer } from '@effect/workflow'
import { DBLive } from '@openfaith/db'
import { HealthLive, WorkflowApi, workflows } from '@openfaith/workers/api/workflowApi'
import { PcoSyncEntityWorkflowLayer } from '@openfaith/workers/workflows/pcoSyncEntityWorkflow'
import { PcoSyncWorkflowLayer } from '@openfaith/workers/workflows/pcoSyncWorkflow'
import { TestWorkflowLayer } from '@openfaith/workers/workflows/testWorkflow'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Layer, Logger } from 'effect'

// NodeSDK layer for telemetry

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'openfaith-workflow-runner' },
  spanProcessor: [new BatchSpanProcessor(new OTLPTraceExporter())],
}))

// Workflow engine layer
const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(
    NodeClusterRunnerSocket.layer({
      storage: 'sql',
    }),
  ),
  Layer.provideMerge(DBLive),
)

const WorkflowApiLive = HttpApiBuilder.api(WorkflowApi).pipe(
  Layer.provide(WorkflowProxyServer.layerHttpApi(WorkflowApi, 'workflows', workflows)),
  HttpServer.withLogAddress,
)

const port = 3020

const EnvLayer = Layer.mergeAll(
  PcoSyncWorkflowLayer,
  PcoSyncEntityWorkflowLayer,
  TestWorkflowLayer,
).pipe(Layer.provide(WorkflowEngineLayer))

// Set up the server using NodeHttpServer on port 3000
HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(WorkflowApiLive),
  Layer.provide(HealthLive),
  Layer.provide(EnvLayer),
  Layer.provide(Logger.pretty),
  Layer.provide(NodeHttpServer.layer(createServer, { port })),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(NodeSdkLive),
  Layer.launch,
  NodeRuntime.runMain,
)
