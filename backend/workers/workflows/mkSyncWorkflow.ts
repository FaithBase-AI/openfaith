import { Activity, Workflow } from '@effect/workflow'
import { createPaginatedStream, TokenKey } from '@openfaith/adapter-core/server'
import { PcoApi, PcoApiLayer, PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { Effect, Schema, Stream } from 'effect'

class SyncError extends Schema.TaggedError<SyncError>('SyncError')('SyncError', {
  message: Schema.String,
}) {}

export const mkSyncWorkflow = (adapterKey: string) => {
  const apiGroups = Object.keys(PcoApi.groups) as Array<
    (typeof PcoApi.groups)[keyof typeof PcoApi.groups]['identifier']
  >
  const PayloadSyncSchema = Schema.Struct({
    entity: Schema.Literal(...apiGroups),
    tokenKey: Schema.String,
  })

  const SyncWorkflow = Workflow.make({
    error: SyncError,
    idempotencyKey: ({ tokenKey }) => `${adapterKey}-sync-${tokenKey}-${new Date().toISOString()}`,
    name: `${adapterKey}SyncWorkflow`,
    payload: PayloadSyncSchema,
    success: Schema.Void,
  })

  const SyncWorkflowLayer = SyncWorkflow.toLayer(
    Effect.fn(function* (payload) {
      const { entity, tokenKey } = payload

      yield* Activity.make({
        error: SyncError,
        execute: Effect.gen(function* () {
          const pcoClient = yield* PcoHttpClient

          const entityHttp = pcoClient[entity]

          if ('list' in entityHttp) {
            return yield* Stream.runForEach(
              createPaginatedStream(entityHttp.list, {
                urlParams: {
                  include: 'addresses',
                },
              } as const),
              (response) =>
                Effect.log({
                  offset: response.meta.next?.offset || 0,
                  tokenKey: tokenKey,
                  totalCount: response.meta.total_count,
                }),
            )
          }
        }).pipe(
          Effect.withSpan('pco-sync-activity'),
          Effect.provide(PcoApiLayer),
          Effect.provideService(TokenKey, tokenKey),
        ),
        name: `${adapterKey}-sync-${entity}`,
      })
    }),
  )

  return {
    PayloadSyncSchema,
    SyncWorkflow,
    SyncWorkflowLayer,
  }
}
