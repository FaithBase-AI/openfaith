import { HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import {
  PcoAuthenticationError,
  PcoAuthorizationError,
  PcoBadRequestError,
  PcoConflictError,
  PcoGatewayTimeoutError,
  PcoInternalServerError,
  PcoNotFoundError,
  PcoRateLimitError,
  PcoServiceUnavailableError,
  PcoValidationError,
} from '@openfaith/pco/api/pcoApiErrors'
import { Schema } from 'effect'

/**
 * PCO Webhook Subscription Schema
 * Represents a webhook subscription in PCO's system
 */
export const PcoWebhookSubscription = Schema.Struct({
  attributes: Schema.Struct({
    active: Schema.Boolean,
    application_id: Schema.optional(Schema.String),
    authenticity_secret: Schema.String,
    created_at: Schema.String,
    name: Schema.String,
    updated_at: Schema.String,
    url: Schema.String,
  }),
  id: Schema.String,
  relationships: Schema.Struct({
    webhook_events: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String, // e.g., "people.v2.events.person.created"
          type: Schema.Literal('WebhookEvent'),
        }),
      ),
    }),
  }),
  type: Schema.Literal('Subscription'),
})

export type PcoWebhookSubscription = typeof PcoWebhookSubscription.Type

/**
 * PCO Webhook Event Schema
 * Represents an available webhook event type
 */
export const PcoWebhookEvent = Schema.Struct({
  attributes: Schema.Struct({
    description: Schema.String,
    name: Schema.String,
    resource_name: Schema.String,
    version: Schema.String,
  }),
  id: Schema.String,
  type: Schema.Literal('WebhookEvent'),
})

export type PcoWebhookEvent = typeof PcoWebhookEvent.Type

/**
 * Create Subscription Request Schema
 */
export const CreateSubscriptionRequest = Schema.Struct({
  data: Schema.Struct({
    attributes: Schema.Struct({
      active: Schema.optional(Schema.Boolean),
      name: Schema.String,
      url: Schema.String,
    }),
    relationships: Schema.Struct({
      webhook_events: Schema.Struct({
        data: Schema.Array(
          Schema.Struct({
            id: Schema.String,
            type: Schema.Literal('WebhookEvent'),
          }),
        ),
      }),
    }),
    type: Schema.Literal('Subscription'),
  }),
})

export type CreateSubscriptionRequest = typeof CreateSubscriptionRequest.Type

/**
 * Update Subscription Request Schema
 */
export const UpdateSubscriptionRequest = Schema.Struct({
  data: Schema.Struct({
    attributes: Schema.optional(
      Schema.Struct({
        active: Schema.optional(Schema.Boolean),
        name: Schema.optional(Schema.String),
      }),
    ),
    id: Schema.String,
    type: Schema.Literal('Subscription'),
  }),
})

export type UpdateSubscriptionRequest = typeof UpdateSubscriptionRequest.Type

/**
 * List Response Schemas
 */
export const ListSubscriptionsResponse = Schema.Struct({
  data: Schema.Array(PcoWebhookSubscription),
  meta: Schema.optional(
    Schema.Struct({
      can_filter: Schema.optional(Schema.Array(Schema.String)),
      can_include: Schema.optional(Schema.Array(Schema.String)),
      can_query_by: Schema.optional(Schema.Array(Schema.String)),
      count: Schema.Number,
      parent: Schema.optional(Schema.Unknown),
      total_count: Schema.Number,
    }),
  ),
})

export type ListSubscriptionsResponse = typeof ListSubscriptionsResponse.Type

export const GetSubscriptionResponse = Schema.Struct({
  data: PcoWebhookSubscription,
})

export type GetSubscriptionResponse = typeof GetSubscriptionResponse.Type

export const ListWebhookEventsResponse = Schema.Struct({
  data: Schema.Array(PcoWebhookEvent),
  meta: Schema.optional(
    Schema.Struct({
      count: Schema.Number,
      total_count: Schema.Number,
    }),
  ),
})

export type ListWebhookEventsResponse = typeof ListWebhookEventsResponse.Type

/**
 * PCO Webhook API Group
 * Manages webhook subscriptions and events
 */
export const webhookApiGroup = HttpApiGroup.make('webhooks')
  .add(
    HttpApiEndpoint.get('listSubscriptions', '/webhooks/v2/subscriptions').addSuccess(
      ListSubscriptionsResponse,
    ),
  )
  .add(
    HttpApiEndpoint.get('getSubscription', '/webhooks/v2/subscriptions/:id')
      .setUrlParams(Schema.Struct({ id: Schema.String }))
      .addSuccess(GetSubscriptionResponse),
  )
  .add(
    HttpApiEndpoint.post('createSubscription', '/webhooks/v2/subscriptions')
      .setPayload(CreateSubscriptionRequest)
      .addSuccess(GetSubscriptionResponse),
  )
  .add(
    HttpApiEndpoint.patch('updateSubscription', '/webhooks/v2/subscriptions/:id')
      .setUrlParams(Schema.Struct({ id: Schema.String }))
      .setPayload(UpdateSubscriptionRequest)
      .addSuccess(GetSubscriptionResponse),
  )
  .add(
    HttpApiEndpoint.del('deleteSubscription', '/webhooks/v2/subscriptions/:id')
      .setUrlParams(Schema.Struct({ id: Schema.String }))
      .addSuccess(Schema.Null),
  )
  .add(
    HttpApiEndpoint.get('listWebhookEvents', '/webhooks/v2/webhook_events').addSuccess(
      ListWebhookEventsResponse,
    ),
  )
  // Add error handlers
  .addError(PcoBadRequestError, { status: 400 })
  .addError(PcoAuthenticationError, { status: 401 })
  .addError(PcoAuthorizationError, { status: 403 })
  .addError(PcoNotFoundError, { status: 404 })
  .addError(PcoConflictError, { status: 409 })
  .addError(PcoValidationError, { status: 422 })
  .addError(PcoRateLimitError, { status: 429 })
  .addError(PcoInternalServerError, { status: 500 })
  .addError(PcoServiceUnavailableError, { status: 503 })
  .addError(PcoGatewayTimeoutError, { status: 504 })
