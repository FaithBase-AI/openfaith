import { Activity, Workflow } from '@effect/workflow'
import { createPaginatedStream, TokenKey } from '@openfaith/adapter-core/server'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { PcoApiLayer, PcoHttpClient } from '@openfaith/pco/server'
import { OfSkipEntity } from '@openfaith/schema'
import { saveDataE } from '@openfaith/workers/helpers/saveDataE'
import { Array, Effect, Option, pipe, Record, Schema, SchemaAST, Stream } from 'effect'

// Define the PCO sync error
class PcoSyncEntityError extends Schema.TaggedError<PcoSyncEntityError>('PcoSyncEntityError')(
  'PcoSyncEntityError',
  {
    message: Schema.String,
  },
) {}

// Define the workflow payload schema
const PcoSyncEntityPayload = Schema.Struct({
  entity: Schema.Literal(
    ...pipe(
      pcoEntityManifest,
      Record.values,
      Array.map((x) => x.entity),
    ),
  ),
  tokenKey: Schema.String,
})

// Define the PCO sync workflow
export const PcoSyncEntityWorkflow = Workflow.make({
  error: PcoSyncEntityError,
  idempotencyKey: ({ tokenKey }) => `pco-sync-${tokenKey}-${new Date().toISOString()}`,
  name: 'PcoSyncEntityWorkflow',
  payload: PcoSyncEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const PcoSyncEntityWorkflowLayer = PcoSyncEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting PCO sync workflow for token: ${payload.tokenKey}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    console.log('yeet')

    // Create the PCO sync activity
    yield* Activity.make({
      error: PcoSyncEntityError,
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
          const entityOpt = pipe(
            pcoEntityManifest,
            Record.findFirst((x) => x.entity === payload.entity),
            Option.filter(([, x]) => {
              return !SchemaAST.getAnnotation<boolean>(OfSkipEntity)(x.apiSchema.ast).pipe(
                Option.getOrElse(() => false),
              )
            }),
          )

          if (entityOpt._tag === 'None') {
            yield* Effect.annotateLogs(
              Effect.log(`🔄 Skipping PCO sync for entity: ${payload.entity}`),
              {
                attempt,
                executionId,
                tokenKey: payload.tokenKey,
              },
            )
            return
          }

          const urlParams = pipe(
            entityOpt,
            Option.flatMapNullable(([, x]) => x.endpoints.list.defaultQuery),
            Option.getOrElse(() => ({})),
          )

          yield* Stream.runForEach(
            createPaginatedStream(entityHttp.list, {
              // We have to cast here because the type is too complex for the compiler to infer.
              urlParams: urlParams as any,
            } as const),
            (data) =>
              saveDataE(data).pipe(
                Effect.mapError((error) => {
                  console.log(error)

                  return new PcoSyncEntityError({ message: error.message })
                }),
              ),
          ).pipe(
            Effect.mapError((error) => {
              console.log(error)

              return new PcoSyncEntityError({ message: error.message })
            }),
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
      PcoSyncEntityWorkflow.withCompensation(
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
