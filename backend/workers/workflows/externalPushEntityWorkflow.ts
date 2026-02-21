import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { Activity, Workflow } from '@effect/workflow'
import { processMutation } from '@openfaith/adapter-core/chains/syncEngine.chain'
import {
  AdapterEntityNotFoundError,
  AdapterFetchError,
  AdapterTransformError,
  DetectionError,
  EntityProcessingError,
  ExternalLinkRetrievalError,
  ExternalLinkUpsertError,
  RelationshipProcessingError,
  TokenKey,
} from '@openfaith/adapter-core/server'
import { adapterDetailsTable } from '@openfaith/db'
import { CRUDMutation, CRUDOp } from '@openfaith/domain'
import { PcoAdapterManagerLayer } from '@openfaith/pco/server'
import { InternalManagerLive } from '@openfaith/server/live/internalManagerLive'
import { and, eq } from 'drizzle-orm'
import { Array, Effect, Layer, pipe, Schema } from 'effect'

// Registry of adapter layers indexed by adapter name.
// Add new adapters here as they become available.
const adapterLayerRegistry = {
  pco: PcoAdapterManagerLayer,
} as const

type AdapterName = keyof typeof adapterLayerRegistry

// Define the workflow payload schema
const ExternalPushEntityPayload = Schema.Struct({
  entityName: Schema.String,
  mutations: Schema.Array(
    Schema.Struct({
      mutation: CRUDMutation,
      op: CRUDOp,
    }),
  ),
  tokenKey: Schema.String,
})

// Define the external sync entity workflow with adapter error types
export const ExternalPushEntityWorkflow = Workflow.make({
  error: Schema.Union(
    AdapterEntityNotFoundError,
    AdapterFetchError,
    AdapterTransformError,
    DetectionError,
    EntityProcessingError,
    ExternalLinkRetrievalError,
    ExternalLinkUpsertError,
    RelationshipProcessingError,
  ),
  idempotencyKey: ({ tokenKey, entityName }) =>
    `external-sync-entity-${tokenKey}-${entityName}-${new Date().toISOString()}`,
  name: 'ExternalPushEntityWorkflow',
  payload: ExternalPushEntityPayload,
  success: Schema.Void,
})

// Create the workflow implementation layer
export const ExternalPushEntityWorkflowLayer = ExternalPushEntityWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.log(`🔄 Starting external sync entity workflow for: ${payload.entityName}`)
    yield* Effect.log(`🆔 Execution ID: ${executionId}`)

    const { entityName, mutations, tokenKey } = payload

    // Create the external sync activity
    yield* Activity.make({
      error: Schema.Union(
        AdapterEntityNotFoundError,
        AdapterFetchError,
        AdapterTransformError,
        DetectionError,
        EntityProcessingError,
        ExternalLinkRetrievalError,
        ExternalLinkUpsertError,
        RelationshipProcessingError,
      ),
      execute: Effect.gen(function* () {
        const attempt = yield* Activity.CurrentAttempt
        const db = yield* PgDrizzle.PgDrizzle

        yield* Effect.annotateLogs(
          Effect.log(`📊 Syncing external data for entity: ${entityName}`),
          {
            attempt,
            entityName,
            executionId,
            mutationCount: mutations.length,
            tokenKey,
          },
        )

        // Query all enabled adapters for this organization
        const enabledAdapters = yield* db
          .select({ adapter: adapterDetailsTable.adapter })
          .from(adapterDetailsTable)
          .where(
            and(
              eq(adapterDetailsTable.orgId, tokenKey),
              eq(adapterDetailsTable.enabled, true),
            ),
          )
          .pipe(
            Effect.tapError((error) =>
              Effect.logError('Failed to query enabled adapters, skipping external push', {
                error,
                entityName,
                tokenKey,
              }),
            ),
            Effect.orElse(() => Effect.succeed([] as Array<{ adapter: string }>)),
          )

        yield* Effect.log('Found enabled adapters for org', {
          adapters: pipe(
            enabledAdapters,
            Array.map((a) => a.adapter),
          ),
          entityName,
          orgId: tokenKey,
        })

        if (enabledAdapters.length === 0) {
          yield* Effect.log('No enabled adapters found, skipping external push', {
            entityName,
            orgId: tokenKey,
          })
          return
        }

        // Send mutations to each enabled adapter that has a registered layer
        yield* Effect.forEach(
          enabledAdapters,
          ({ adapter }) =>
            Effect.gen(function* () {
              const adapterLayer = adapterLayerRegistry[adapter as AdapterName]

              if (!adapterLayer) {
                yield* Effect.log(
                  `No layer registered for adapter: ${adapter}, skipping`,
                  {
                    adapter,
                    entityName,
                    tokenKey,
                  },
                )
                return
              }

              yield* Effect.log(`Processing mutations for adapter: ${adapter}`, {
                adapter,
                entityName,
                mutationCount: mutations.length,
              })

              // Process each mutation op through this adapter
              yield* Effect.forEach(
                mutations,
                (mutationData) => processMutation(mutationData.op),
                { concurrency: 'unbounded' },
              ).pipe(
                Effect.provide(Layer.mergeAll(adapterLayer, InternalManagerLive)),
                Effect.provideService(TokenKey, tokenKey),
              )
            }),
          { concurrency: 'unbounded' },
        )
      }),
      name: 'SyncExternalEntityData',
    }).pipe(Activity.retry({ times: 3 }))

    yield* Effect.log(`✅ Completed external sync entity workflow for: ${payload.entityName}`)
  }),
)
