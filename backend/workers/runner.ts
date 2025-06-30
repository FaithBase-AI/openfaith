import { createServer } from 'node:http'
import { ClusterWorkflowEngine } from '@effect/cluster'
import { HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform'
import { NodeClusterRunnerSocket, NodeHttpServer, NodeRuntime } from '@effect/platform-node'
import { WorkflowProxyServer } from '@effect/workflow'
import { PgLive } from '@openfaith/db'
import { HealthLive, WorkflowApi, workflows } from '@openfaith/workers/api/workflowApi'
import { PcoSyncWorkflowLayer } from '@openfaith/workers/workflows/pcoSyncWorkflow'
import { TestWorkflowLayer } from '@openfaith/workers/workflows/testWorkflow'
import { Layer, Logger } from 'effect'

// Workflow engine layer
const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(
    NodeClusterRunnerSocket.layer({
      storage: 'sql',
    }),
  ),
  Layer.provideMerge(PgLive),
)

const WorkflowApiLive = HttpApiBuilder.api(WorkflowApi).pipe(
  Layer.provide(WorkflowProxyServer.layerHttpApi(WorkflowApi, 'workflows', workflows)),
)

const port = 3020

const EnvLayer = Layer.mergeAll(PcoSyncWorkflowLayer, TestWorkflowLayer).pipe(
  Layer.provide(WorkflowEngineLayer),
)

// Set up the server using NodeHttpServer on port 3000
HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(WorkflowApiLive),
  Layer.provide(HealthLive),
  Layer.provide(EnvLayer),
  Layer.provide(Logger.pretty),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port })),
  Layer.launch,
  NodeRuntime.runMain,
)
