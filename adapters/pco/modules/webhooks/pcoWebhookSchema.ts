import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  AdapterWebhook,
  BaseAdapterWebhook,
  OfCustomField,
  OfEntity,
  OfFieldName,
  OfIdentifier,
  OfTransformer,
} from '@openfaith/schema'
import { Schema } from 'effect'

/**
 * PCO Webhook Subscription Attributes
 * Maps PCO API response fields to OpenFaith fields
 */
export const PcoWebhookSubscriptionAttributes = Schema.Struct({
  active: Schema.Boolean.annotations({
    [OfFieldName]: 'enabled',
  }),
  application_id: Schema.optional(Schema.String).annotations({
    [OfFieldName]: 'applicationId',
    [OfCustomField]: true,
  }),
  authenticity_secret: Schema.String.annotations({
    [OfFieldName]: 'authenticitySecret',
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
    [OfCustomField]: true,
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  url: Schema.String.annotations({
    [OfFieldName]: 'webhookUrl',
  }),
})

export type PcoWebhookSubscriptionAttributes = typeof PcoWebhookSubscriptionAttributes.Type

/**
 * Transformer for converting PCO webhook subscription to OpenFaith format
 * Note: We'll need to handle eventTypes and other fields separately since they come from relationships
 */
export const pcoWebhookSubscriptionTransformer = pcoToOf(
  PcoWebhookSubscriptionAttributes,
  BaseAdapterWebhook,
  'adapterWebhook',
)

/**
 * PCO Webhook Subscription Entity Schema
 * Full schema including relationships for webhook events
 */
export const PcoWebhookSubscription = mkPcoEntity({
  attributes: PcoWebhookSubscriptionAttributes,
  links: Schema.Struct({
    html: Schema.optional(Schema.String),
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    webhook_events: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String, // Event name like "people.v2.events.person.created"
          type: Schema.Literal('WebhookEvent'),
        }),
      ),
    }),
  }),
  type: 'Subscription',
}).annotations({
  [OfEntity]: AdapterWebhook,
  [OfIdentifier]: 'pco-webhook-subscription',
  [OfTransformer]: pcoWebhookSubscriptionTransformer,
})

export type PcoWebhookSubscription = typeof PcoWebhookSubscription.Type

/**
 * Response schema for listing webhook subscriptions
 */
export const PcoWebhookSubscriptionListResponse = Schema.Struct({
  data: Schema.Array(PcoWebhookSubscription),
  included: Schema.optional(Schema.Array(Schema.Unknown)),
  links: Schema.optional(
    Schema.Struct({
      next: Schema.optional(Schema.String),
      prev: Schema.optional(Schema.String),
      self: Schema.String,
    }),
  ),
  meta: Schema.optional(
    Schema.Struct({
      can_filter: Schema.optional(Schema.Array(Schema.String)),
      can_include: Schema.optional(Schema.Array(Schema.String)),
      can_order_by: Schema.optional(Schema.Array(Schema.String)),
      can_query_by: Schema.optional(Schema.Array(Schema.String)),
      count: Schema.optional(Schema.Number),
      next: Schema.optional(
        Schema.Struct({
          offset: Schema.optional(Schema.Number),
        }),
      ),
      parent: Schema.optional(
        Schema.Struct({
          id: Schema.String,
          type: Schema.String,
        }),
      ),
      total_count: Schema.optional(Schema.Number),
    }),
  ),
})

export type PcoWebhookSubscriptionListResponse = typeof PcoWebhookSubscriptionListResponse.Type

/**
 * Response schema for getting a single webhook subscription
 */
export const PcoWebhookSubscriptionResponse = Schema.Struct({
  data: PcoWebhookSubscription,
  included: Schema.optional(Schema.Array(Schema.Unknown)),
  meta: Schema.optional(Schema.Unknown),
})

export type PcoWebhookSubscriptionResponse = typeof PcoWebhookSubscriptionResponse.Type

/**
 * Request schema for creating a webhook subscription
 */
export const PcoWebhookSubscriptionCreateRequest = Schema.Struct({
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

export type PcoWebhookSubscriptionCreateRequest = typeof PcoWebhookSubscriptionCreateRequest.Type

/**
 * Request schema for updating a webhook subscription
 */
export const PcoWebhookSubscriptionUpdateRequest = Schema.Struct({
  data: Schema.Struct({
    attributes: Schema.optional(
      Schema.Struct({
        active: Schema.optional(Schema.Boolean),
        name: Schema.optional(Schema.String),
      }),
    ),
    id: Schema.String,
    relationships: Schema.optional(
      Schema.Struct({
        webhook_events: Schema.optional(
          Schema.Struct({
            data: Schema.Array(
              Schema.Struct({
                id: Schema.String,
                type: Schema.Literal('WebhookEvent'),
              }),
            ),
          }),
        ),
      }),
    ),
    type: Schema.Literal('Subscription'),
  }),
})

export type PcoWebhookSubscriptionUpdateRequest = typeof PcoWebhookSubscriptionUpdateRequest.Type
