import { NodeSdk } from '@effect/opentelemetry'
import { FetchHttpClient } from '@effect/platform'
import { Activity, Workflow } from '@effect/workflow'
import { createPaginatedStream, TokenKey } from '@openfaith/adapter-core/server'
import { DBLive } from '@openfaith/db'
import { PcoApiLayer, PcoHttpClient } from '@openfaith/pco/server'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Effect, Schema, Stream } from 'effect'

// Define the PCO sync error
class PcoSyncError extends Schema.TaggedError<PcoSyncError>('PcoSyncError')('PcoSyncError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const PcoSyncPayload = Schema.Struct({
  tokenKey: Schema.String,
})

// Define the PCO sync workflow
export const PcoSyncWorkflow = Workflow.make({
  error: PcoSyncError,
  idempotencyKey: ({ tokenKey }) => `pco-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'PcoSyncWorkflow',
  payload: PcoSyncPayload,
  success: Schema.Void,
})

// NodeSDK layer for telemetry
const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'openfaith-workflow-runner' },
  spanProcessor: [new BatchSpanProcessor(new OTLPTraceExporter())],
}))

// Create the workflow implementation layer
export const PcoSyncWorkflowLayer = PcoSyncWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting PCO sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    console.log('yeet')

    // Create the PCO sync activity
    yield* Activity.make({
      error: PcoSyncError,
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt

        console.log('attempt', attempt)

        yield* Effect.annotateLogs(Effect.log(`📊 Syncing PCO data`), {
          attempt,
          executionId,
          tokenKey: payload.tokenKey,
        })

        // Core PCO sync logic - stream through all people with addresses
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
        Effect.fn(function* (_value, cause) {
          yield* Effect.log(`🔄 Compensating PCO sync activity for token: ${payload.tokenKey}`)
          yield* Effect.log(`📋 Cause: ${cause}`)
          // Add any cleanup logic here if needed
        }),
      ),
    )

    yield* Effect.log(`✅ Completed PCO sync workflow for token: ${payload.tokenKey}`)
  }),
)
