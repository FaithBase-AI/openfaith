// import { HttpApiBuilder } from '@effect/platform'
// import { BunHttpServer, BunRuntime } from '@effect/platform-bun'
// import { WorkflowProxyServer } from '@effect/workflow'
// import { WorkflowApi, workflows } from '@openfaith/workers/api/workflowApi'
// import { Effect, Layer, Logger } from 'effect'

// // Cluster runner configuration
// // const RunnerLive = NodeClusterRunnerSocket.layer({
// //   storage: 'sql',
// //   // Can add sharding config if needed for distributed deployment
// // }).pipe(Layer.provide(PgLive))

// // Workflow engine layer
// // const WorkflowEngineLive = ClusterWorkflowEngine.layer

// // Combine all workflow layers
// // const WorkflowLayers = Layer.mergeAll(PcoSyncWorkflowLayer)

// // Implement the WorkflowApi
// const WorkflowApiLive = HttpApiBuilder.api(WorkflowApi).pipe(
//   Layer.provide(WorkflowProxyServer.layerHttpApi(WorkflowApi, 'workflows', workflows)),
//   // Layer.provide(WorkflowEngineLive),
//   // Layer.provide(RunnerLive),
// )

// // HTTP server layer
// const HttpServerLive = BunHttpServer.layer({ port: 3001 })

// // Main program that launches the workflow runner
// // const program = WorkflowLayers.pipe(
// //   Layer.provide(WorkflowEngineLive),
// //   Layer.provide(Logger.pretty),
// //   Layer.provide(RunnerLive),
// //   Layer.launch,
// //   // NodeRuntime.runMain,
// // )

// // HTTP API server program following the readme patterns
// HttpApiBuilder.serve().pipe(
//   Layer.provide(WorkflowApiLive),
//   Layer.provide(Logger.pretty),
//   // HttpServer.withLogAddress,
//   Layer.provide(HttpServerLive),
//   Layer.launch,
//   Effect.tapError((error) =>
//     Effect.gen(function* () {
//       yield* Effect.logError(`💥 Workflow runner failed to start: ${error}`)
//       yield* Effect.logInfo('🔍 Make sure PostgreSQL is running and accessible')
//       yield* Effect.logInfo('🔍 Check that the shard manager is running')
//       yield* Effect.logInfo('🌐 Workflow HTTP API will be available on http://localhost:3001')
//     }),
//   ),
//   Effect.tap(() => Effect.logInfo('🌐 Workflow HTTP API started on http://localhost:3001')),
//   BunRuntime.runMain,
// )

// // Combine both programs
// // const combinedProgram = Effect.all([program, apiProgram], { concurrency: 'unbounded' })

// // // Determine if we're in a containerized environment
// // const inProduction = process.env.NODE_ENV === 'production'
// // const programWithLogging = inProduction
// //   ? combinedProgram.pipe(Effect.provide(Logger.json))
// //   : combinedProgram.pipe(Effect.provide(Logger.pretty))

// // Launch the runner
// // apiProgram.pipe(
// //   Effect.tapError((error) =>
// //     Effect.gen(function* () {
// //       yield* Effect.logError(`💥 Workflow runner failed to start: ${error}`)
// //       yield* Effect.logInfo('🔍 Make sure PostgreSQL is running and accessible')
// //       yield* Effect.logInfo('🔍 Check that the shard manager is running')
// //       yield* Effect.logInfo('🌐 Workflow HTTP API will be available on http://localhost:3001')
// //     }),
// //   ),
// //   Effect.tap(() => Effect.logInfo('🌐 Workflow HTTP API started on http://localhost:3001')),
// //   BunRuntime.runMain,
// // )

// // Workflows.pipe(
// //   Layer.provide(ServerLive),
// //   Layer.provide(WorkflowEngineLive),
// //   Layer.provide(ShardingLive),
// //   Layer.provide(Logger.json),
// //   Layer.launch,
// //   NodeRuntime.runMain({ disablePrettyLogger: true }),
// // )

import { ClusterWorkflowEngine } from '@effect/cluster'
import { HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform'
import { BunClusterRunnerSocket, BunHttpServer, BunRuntime } from '@effect/platform-bun'
import { WorkflowProxyServer } from '@effect/workflow'
import { PgLive } from '@openfaith/db'
import { HealthLive, WorkflowApi, workflows } from '@openfaith/workers/api/workflowApi'
import { PcoSyncWorkflowLayer } from '@openfaith/workers/workflows/pcoSyncWorkflow'
import { Effect, Layer, Logger } from 'effect'

// Workflow engine layer
const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(
    BunClusterRunnerSocket.layer({
      storage: 'sql',
    }),
  ),
  Layer.provideMerge(PgLive),
)

const WorkflowApiLive = HttpApiBuilder.api(WorkflowApi).pipe(
  Layer.provide(WorkflowProxyServer.layerHttpApi(WorkflowApi, 'workflows', workflows)),
)

const port = 3020

const EnvLayer = Layer.mergeAll(PcoSyncWorkflowLayer).pipe(Layer.provide(WorkflowEngineLayer))

// Set up the server using NodeHttpServer on port 3000
const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(WorkflowApiLive),
  Layer.provide(HealthLive),
  Layer.provide(EnvLayer),
  Layer.provide(Logger.pretty),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port })),
)

// Run the application
Layer.launch(ServerLive).pipe(
  Effect.tapError((error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`💥 Workflow runner failed to start: ${error}`)
      yield* Effect.logInfo('🔍 Make sure PostgreSQL is running and accessible')
      yield* Effect.logInfo('🔍 Check that the shard manager is running')
      yield* Effect.logInfo('🌐 Workflow HTTP API will be available on http://localhost:3001')
    }),
  ),
  BunRuntime.runMain(),
)
