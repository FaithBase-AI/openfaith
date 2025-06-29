import { ClusterWorkflowEngine } from '@effect/cluster'
import { NodeSdk } from '@effect/opentelemetry'
import { FetchHttpClient } from '@effect/platform'
import { NodeClusterRunnerSocket } from '@effect/platform-node'
import { Activity, DurableClock, Workflow } from '@effect/workflow'
import { createPaginatedStream, TokenKey } from '@openfaith/adapter-core/server'
import { DBLive, PgLive } from '@openfaith/db'
import { PcoApiLayer, PcoHttpClient } from '@openfaith/pco/server'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Effect, Layer, Schema, Stream } from 'effect'

// Define a custom error for the PCO sync activity
class PcoSyncError extends Schema.TaggedError<PcoSyncError>('PcoSyncError')('PcoSyncError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const PcoSyncPayload = Schema.Struct({
  tokenKey: Schema.String,
})

// Define the PCO sync workflow
const PcoSyncWorkflow = Workflow.make({
  error: PcoSyncError,
  idempotencyKey: ({ tokenKey }) => `pco-sync-${tokenKey}`,
  name: 'PcoSyncWorkflow',
  payload: PcoSyncPayload,
  success: Schema.Void,
})

// NodeSDK layer for telemetry
const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'openfaith-workflow-engine' },
  spanProcessor: [new BatchSpanProcessor(new OTLPTraceExporter())],
}))

// Create the workflow implementation layer
const PcoSyncWorkflowLayer = PcoSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`Starting PCO sync workflow for token: ${payload.tokenKey}`)

    // Create the PCO sync activity
    yield* Activity.make({
      error: PcoSyncError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        yield* Effect.annotateLogs(Effect.log(`Syncing PCO data`), {
          attempt,
          executionId,
          tokenKey: payload.tokenKey,
        })

        // This is the core program from coreRouter.ts, adapted for the workflow
        const pcoClient = yield* PcoHttpClient

        return yield* Stream.runForEach(
          createPaginatedStream(pcoClient.people.getAll, {
            urlParams: {
              include: 'addresses',
            },
          } as const),
          (response) =>
            Effect.log({
              offset: response.meta.next?.offset || 0,
              tokenKey: payload.tokenKey,
              totalCount: response.meta.total_count,
            }),
        )
      }).pipe(
        Effect.withSpan('pco-sync-activity'),
        Effect.provide(PcoApiLayer),
        Effect.provide(FetchHttpClient.layer),
        Effect.provide(DBLive),
        Effect.provideService(TokenKey, payload.tokenKey),
        Effect.provide(NodeSdkLive),
      ),
      name: 'SyncPcoData',
    }).pipe(
      Activity.retry({ times: 3 }),
      PcoSyncWorkflow.withCompensation(
        Effect.fn(function* (value, cause) {
          yield* Effect.log(`Compensating PCO sync activity for token: ${payload.tokenKey}`)
          // Add any cleanup logic here if needed
        }),
      ),
    )

    // Add a small delay between sync operations
    yield* Effect.log('Waiting before completing workflow')
    yield* DurableClock.sleep({
      duration: '5 seconds',
      name: 'PostSyncDelay',
    })

    yield* Effect.log(`Completed PCO sync workflow for token: ${payload.tokenKey}`)
  }),
)

// Set up the workflow engine with cluster support
const WorkflowEngineLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(NodeClusterRunnerSocket.layer({ storage: 'sql' })),
  Layer.provideMerge(PgLive),
)

// Combine all layers
const EnvLayer = Layer.mergeAll(PcoSyncWorkflowLayer).pipe(Layer.provide(WorkflowEngineLayer))

// Export the workflow for external use
export { PcoSyncWorkflow, EnvLayer }

// Example of how to execute the workflow (commented out for now)
// PcoSyncWorkflow.execute({
//   tokenKey: "org_01jww7zkeyfzvsxd20nfjzc21z"
// }).pipe(
//   Effect.provide(EnvLayer),
//   NodeRuntime.runMain
// )
