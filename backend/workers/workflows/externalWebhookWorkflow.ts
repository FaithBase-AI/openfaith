import { Headers } from '@effect/platform'
import { Activity, Workflow } from '@effect/workflow'
import { getWebhookOrgId, TokenKey, webhookSyncEntity } from '@openfaith/adapter-core/server'
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
    // We have a bit of a funny problem with TokenKey (orgId). AdapterManager and InternalManager both depend on
    // TokenKey being provided upfront to them. We can technically have a single workflow where we take in the webhooks
    // and do everything all at once, but then we get stuck with a TokenKey that isn't valid. The easiest workaround
    // that I could think of that I didn't hate was to split out validating the webhook and getting the orgId from
    // processing it. This lets us then run another activity with the right orgId as the TokenKey for the rest of the
    // operations.
    //
    // We could in the future make TokenKey be more robust, have it be a look up service that then lets you change the
    // value, but for now this works.
    const orgId = yield* Activity.make({
      error: ExternalWebhookError,
      execute: getWebhookOrgId({
        headers: pipe(payload.headers, Headers.fromInput),
        payload: payload.payload,
      }).pipe(
        Effect.provide(Layer.mergeAll(PcoAdapterManagerLayer, InternalManagerLive)),
        Effect.provideService(TokenKey, 'webhook-token-key'),
        Effect.catchTags({
          AdapterWebhookNoOrgIdError: (error) =>
            Effect.fail(
              new ExternalWebhookError({
                cause: error,
                message: error.message,
              }),
            ),
          AdapterWebhookRetrieveOrgIdError: (error) =>
            Effect.fail(
              new ExternalWebhookError({
                cause: error,
                message: error.message,
              }),
            ),
        }),
      ),
      name: 'GetWebhookOrgId',
      success: Schema.String,
    }).pipe(Activity.retry({ times: 3 }))

    yield* Activity.make({
      error: ExternalWebhookError,
      execute: webhookSyncEntity(payload.payload).pipe(
        Effect.provide(Layer.mergeAll(PcoAdapterManagerLayer, InternalManagerLive)),
        Effect.provideService(TokenKey, orgId),
        Effect.catchTags({
          AdapterEntityMethodNotFoundError: (error) =>
            Effect.fail(
              new ExternalWebhookError({
                cause: error,
                message:
                  'Failed to find get method for entity. THIS SHOULD NOT HAPPEN! IF IT DOES there is a bug in getSyncEntityId in pcoAdapterMangerLive',
              }),
            ),
          AdapterWebhookProcessingError: (error) =>
            Effect.fail(
              new ExternalWebhookError({
                cause: error,
                message: error.message,
              }),
            ),
        }),
      ),
      name: 'ProcessExternalWebhook',
    }).pipe(Activity.retry({ times: 3 }))
  }),
)
