import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoWebhookSubscription } from '@openfaith/pco/modules/webhooks/pcoWebhookSchema'

/**
 * List all webhook subscriptions
 */
export const listWebhookSubscriptionsDefinition = pcoApiAdapter({
  apiSchema: PcoWebhookSubscription,
  defaultQuery: {
    per_page: 100,
  },
  entity: 'WebhookSubscription',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'webhooks',
  name: 'list',
  path: '/webhooks/v2/subscriptions',
  skipSync: true,
} as const)

/**
 * Get a single webhook subscription by ID
 */
export const getWebhookSubscriptionByIdDefinition = pcoApiAdapter({
  apiSchema: PcoWebhookSubscription,
  entity: 'WebhookSubscription',
  includes: [],
  isCollection: false,
  method: 'GET',
  module: 'webhooks',
  name: 'get',
  path: '/webhooks/v2/subscriptions/:webhookSubscriptionId',
} as const)

/**
 * Create a new webhook subscription
 */
export const createWebhookSubscriptionDefinition = pcoApiAdapter({
  apiSchema: PcoWebhookSubscription,
  creatableFields: ['name', 'url', 'active'],
  entity: 'WebhookSubscription',
  method: 'POST',
  module: 'webhooks',
  name: 'create',
  path: '/webhooks/v2/subscriptions',
} as const)

/**
 * Update an existing webhook subscription
 */
export const updateWebhookSubscriptionDefinition = pcoApiAdapter({
  apiSchema: PcoWebhookSubscription,
  entity: 'WebhookSubscription',
  method: 'PATCH',
  module: 'webhooks',
  name: 'update',
  path: '/webhooks/v2/subscriptions/:webhookSubscriptionId',
  updatableFields: ['name', 'active'],
} as const)

/**
 * Delete a webhook subscription
 */
export const deleteWebhookSubscriptionDefinition = pcoApiAdapter({
  apiSchema: PcoWebhookSubscription,
  entity: 'WebhookSubscription',
  method: 'DELETE',
  module: 'webhooks',
  name: 'delete',
  path: '/webhooks/v2/subscriptions/:webhookSubscriptionId',
} as const)
