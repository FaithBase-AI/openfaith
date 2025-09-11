import { Headers } from '@effect/platform'
import { Activity, Workflow } from '@effect/workflow'
import {
  AdapterManager,
  InternalManager,
  TokenKey,
  webhookSyncEntity,
} from '@openfaith/adapter-core/server'
import { PcoAdapterManagerLayer } from '@openfaith/pco/pcoAdapterManagerLayer'
import { InternalManagerLive } from '@openfaith/server'
import { Effect, Layer, pipe, Schema } from 'effect'

class ExternalWebhookError extends Schema.TaggedError<ExternalWebhookError>()(
  'ExternalWebhookError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
  },
) {}

export const ExternalWebhookWorkflow = Workflow.make({
  error: ExternalWebhookError,
  idempotencyKey: () => `external-webhook-${new Date().toISOString()}`,
  name: 'ExternalWebhookWorkflow',
  payload: Schema.Struct({
    headers: Schema.Record({
      key: Schema.String,
      value: Schema.String,
    }),
    payload: Schema.Unknown,
  }),
  success: Schema.Void,
})

export const ExternalWebhookWorkflowLayer = ExternalWebhookWorkflow.toLayer(
  Effect.fn(function* (payload) {
    const headers = pipe(payload.headers, Headers.fromInput)

    const orgIdOpt = yield* Activity.make({
      error: ExternalWebhookError,
      execute: Effect.gen(function* () {
        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        return yield* adapterManager.getWebhookOrgIdOpt({
          getWebhooks: internalManager.getWebhooks,
          headers,
          payload: payload.payload,
        })
      }).pipe(
        Effect.provide(Layer.mergeAll(PcoAdapterManagerLayer, InternalManagerLive)),
        Effect.provideService(TokenKey, 'webhook-token-key'),
        Effect.withSpan('external-webhook-org-id-retrieval-activity'),
        Effect.tapError((error) =>
          Effect.logError('External webhook org ID retrieval failed', {
            error,
          }),
        ),
        Effect.mapError(
          (error) =>
            new ExternalWebhookError({
              cause: error,
              message: `Failed to get webhook org ID: ${error.message}`,
            }),
        ),
      ),
      name: 'GetWebhookOrgId',
      success: Schema.Option(Schema.String),
    })

    if (orgIdOpt._tag === 'None') {
      return yield* Effect.fail(
        new ExternalWebhookError({
          message: 'No org ID found',
        }),
      )
    }

    yield* Activity.make({
      error: ExternalWebhookError,
      execute: Effect.gen(function* () {
        yield* webhookSyncEntity(payload.payload)
      }).pipe(
        Effect.provide(Layer.mergeAll(PcoAdapterManagerLayer, InternalManagerLive)),
        Effect.provideService(TokenKey, orgIdOpt.value),
        Effect.withSpan('external-webhook-activity'),
        Effect.tapError((error) =>
          Effect.logError('External webhook failed', {
            error,
          }),
        ),
        Effect.mapError(
          (error) =>
            new ExternalWebhookError({
              cause: error,
              message: `External webhook failed: ${error.message}`,
            }),
        ),
      ),
      name: 'ProcessExternalWebhook',
    }).pipe(Activity.retry({ times: 3 }))
  }),
)
