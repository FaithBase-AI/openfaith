import { Activity, Workflow } from '@effect/workflow'
import { createPaginatedStream, TokenKey } from '@openfaith/adapter-core/server'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { PcoApiLayer, PcoHttpClient } from '@openfaith/pco/server'
import { pluralize } from '@openfaith/shared'
import { saveDataE } from '@openfaith/workers/helpers/ofLookup'
import { Array, Effect, Option, pipe, Record, Schema, Stream, String } from 'effect'

// Define the PCO sync error
class PcoSyncError extends Schema.TaggedError<PcoSyncError>('PcoSyncError')('PcoSyncError', {
  message: Schema.String,
}) {}

// Define the workflow payload schema
const PcoSyncPayload = Schema.Struct({
  entity: Schema.Literal(
    ...pipe(
      pcoEntityManifest,
      Record.values,
      Array.map((x) => x.module),
    ),
  ),
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

        yield* Effect.annotateLogs(Effect.log(`📊 Syncing PCO data`), {
          attempt,
          executionId,
          tokenKey: payload.tokenKey,
        })

        // Core PCO sync logic - stream through all people with addresses
        const pcoClient = yield* PcoHttpClient

        const entityHttp = pcoClient[payload.entity]

        if ('list' in entityHttp) {
          const urlParams = pipe(
            pcoEntityManifest,
            Record.findFirst(
              (x) => pipe(x.entity, String.pascalToSnake, pluralize) === payload.entity,
            ),
            Option.flatMapNullable(([, x]) => x.endpoints.list.defaultQuery),
            Option.getOrElse(() => ({})),
          )

          yield* Stream.runForEach(
            createPaginatedStream(entityHttp.list, {
              // We have to cast here because the type is too complex for the compiler to infer.
              urlParams: urlParams as Parameters<typeof entityHttp.list>[0]['urlParams'],
            } as const),
            (data) =>
              saveDataE(data).pipe(
                Effect.mapError((error) => new PcoSyncError({ message: error.message })),
              ),
          )
        }
      }).pipe(
        Effect.withSpan('pco-sync-activity'),
        Effect.provide(PcoApiLayer),
        Effect.provideService(TokenKey, payload.tokenKey),
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
