import { adapterWebhooksTable } from '@openfaith/db'
import { OfTable } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

// Webhook verification methods enum
export const WebhookVerificationMethod = Schema.Literal(
  'hmac-sha256',
  'hmac-sha1',
  'signature-header',
  'token-based',
)
export type WebhookVerificationMethod = typeof WebhookVerificationMethod.Type

// Base webhook configuration for transformers (with system fields, no identification fields)
export class BaseAdapterWebhook extends BaseSystemFields.extend<BaseAdapterWebhook>(
  'BaseAdapterWebhook',
)({
  _tag: Schema.Literal('adapterWebhook'),
  adapter: Schema.String.annotations({
    description: 'The adapter name: pco, ccb, tithely, etc.',
  }),
  authenticitySecret: Schema.String.annotations({
    description: 'Secret used for webhook verification',
  }),
  enabled: Schema.Boolean.annotations({
    description: 'Whether this webhook is active',
  }),
  eventType: Schema.String.annotations({
    description: 'The event type this webhook listens for',
  }),
  lastProcessedAt: Schema.optional(Schema.Date).annotations({
    description: 'Last time a webhook was successfully processed',
  }),
  lastReceivedAt: Schema.optional(Schema.Date).annotations({
    description: 'Last time a webhook was received',
  }),
  verificationMethod: WebhookVerificationMethod.annotations({
    description: 'Method used to verify webhook authenticity',
  }),
  webhookUrl: Schema.String.annotations({
    description: 'The URL where we receive webhooks',
  }),
}) {}

// Full AdapterWebhook class that extends BaseAdapterWebhook and then extends BaseIdentifiedEntity
export class AdapterWebhook extends BaseAdapterWebhook.extend<AdapterWebhook>('AdapterWebhook')(
  BaseIdentifiedEntity.fields,
  [
    {
      title: 'adapterWebhook',
      [OfTable]: adapterWebhooksTable,
    },
  ],
) {}
