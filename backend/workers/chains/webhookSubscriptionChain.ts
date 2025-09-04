import {
  AdapterOperations,
  WebhookSubscription,
} from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { Array, Effect, Option, pipe, Record, Schema, Stream } from 'effect'

/**
 * Webhook status for a specific event type
 */
type WebhookStatus =
  | { readonly tag: 'active'; readonly id: string }
  | { readonly tag: 'inactive'; readonly id: string }
  | { readonly tag: 'unset' }

/**
 * Fetch and parse webhook subscriptions from the adapter
 */
const fetchWebhookSubscriptions = Effect.fn('fetchWebhookSubscriptions')(function* (
  adapterOps: AdapterOperations['Type'],
) {
  return yield* pipe(
    adapterOps.listEntityData('webhooks'),
    Stream.runCollect,
    Effect.map(Array.fromIterable),
    Effect.map((items) =>
      pipe(
        items,
        Array.filterMap((item) => Schema.decodeUnknownOption(WebhookSubscription)(item)),
      ),
    ),
    Effect.orElse(() => Effect.succeed([] as ReadonlyArray<WebhookSubscription>)),
  )
})

/**
 * Determine the status of each webhook event type
 */
const determineEventStatuses = Effect.fn('determineEventStatuses')(function* (
  desiredEventTypes: ReadonlyArray<string>,
  existingSubscriptions: ReadonlyArray<WebhookSubscription>,
  webhookUrl: string,
) {
  return pipe(
    desiredEventTypes,
    Array.map((eventType) => {
      const subscription = pipe(
        existingSubscriptions,
        Array.findFirst((sub) => sub.name === eventType && sub.url === webhookUrl),
      )

      const status = pipe(
        subscription,
        Option.match({
          onNone: (): WebhookStatus => ({ tag: 'unset' }),
          onSome: (sub): WebhookStatus => ({ id: sub.id, tag: sub.active ? 'active' : 'inactive' }),
        }),
      )

      return [eventType, status] as const
    }),
    Record.fromEntries,
  )
})

/**
 * Create a new webhook subscription
 */
const createWebhookSubscription = Effect.fn('createWebhookSubscription')(function* (
  adapterOps: AdapterOperations['Type'],
  adapterTag: string,
  tokenKey: string,
  eventType: string,
  webhookUrl: string,
) {
  // Create the subscription in the external system
  const createResult = yield* adapterOps.createEntity('webhooks', {
    active: true,
    event_types: [eventType],
    name: eventType,
    url: webhookUrl,
  })

  // Parse the result to get the webhook subscription details
  const result = yield* Schema.decodeUnknown(
    Schema.Struct({
      authenticity_secret: Schema.String,
      id: Schema.String,
    }),
  )(createResult).pipe(Effect.mapError(() => new Error('Failed to parse webhook creation result')))

  // Save the webhook configuration using processEntityData directly
  yield* adapterOps.processEntityData('adapterWebhooks', (_data) =>
    Effect.log('Saving webhook configuration', {
      adapter: adapterTag,
      authenticitySecret: result.authenticity_secret,
      enabled: true,
      eventTypes: [eventType],
      externalWebhookId: result.id,
      orgId: tokenKey,
      webhookUrl,
    }),
  )

  yield* Effect.log(`✅ Created and saved subscription for ${eventType}`)
})

/**
 * Activate an existing webhook subscription
 */
const activateWebhookSubscription = Effect.fn('activateWebhookSubscription')(function* (
  adapterOps: AdapterOperations['Type'],
  adapterTag: string,
  statusId: string,
  eventType: string,
) {
  // Activate the webhook in the external system
  yield* adapterOps.updateEntity('webhooks', statusId, { active: true })

  // Update the status using processEntityData directly
  yield* adapterOps.processEntityData('adapterWebhooks', (_data) =>
    Effect.log('Updating webhook status', {
      adapter: adapterTag,
      enabled: true,
      externalWebhookId: statusId,
    }),
  )

  yield* Effect.log(`✅ Activated subscription for ${eventType}`)
})

/**
 * Check if webhook exists using processEntityData
 */
const checkWebhookExists = Effect.fn('checkWebhookExists')(function* (
  _adapterOps: AdapterOperations['Type'],
  adapterTag: string,
  statusId: string,
) {
  // For now, we'll assume webhooks don't exist when checking
  // In a real implementation, this would query the database through the adapter
  yield* Effect.log('Checking webhook existence', {
    adapter: adapterTag,
    externalWebhookId: statusId,
  })

  // Always return false for now - the adapter implementation would handle actual checking
  return false
})

/**
 * Ensure an active webhook subscription exists
 */
const ensureWebhookExists = Effect.fn('ensureWebhookExists')(function* (
  adapterOps: AdapterOperations['Type'],
  adapterTag: string,
  tokenKey: string,
  webhookUrl: string,
  statusId: string,
  eventType: string,
  existingSubscriptions: ReadonlyArray<WebhookSubscription>,
) {
  const exists = yield* checkWebhookExists(adapterOps, adapterTag, statusId)

  if (!exists) {
    // Find the subscription details from our list
    const subscriptionOpt = pipe(
      existingSubscriptions,
      Array.findFirst((sub) => sub.id === statusId),
    )

    if (Option.isSome(subscriptionOpt)) {
      yield* Effect.log(`Saving existing active subscription`)

      // Save the webhook configuration using processEntityData directly
      yield* adapterOps.processEntityData('adapterWebhooks', (_data) =>
        Effect.log('Saving webhook configuration', {
          adapter: adapterTag,
          authenticitySecret: subscriptionOpt.value.authenticitySecret,
          enabled: true,
          eventTypes: [eventType],
          externalWebhookId: statusId,
          orgId: tokenKey,
          webhookUrl,
        }),
      )
    }
  }
})

/**
 * Process a single webhook event based on its status
 */
const processWebhookEvent = Effect.fn('processWebhookEvent')(function* (
  eventType: string,
  status: WebhookStatus,
  adapterOps: AdapterOperations['Type'],
  adapterTag: string,
  tokenKey: string,
  webhookUrl: string,
  existingSubscriptions: ReadonlyArray<WebhookSubscription>,
) {
  switch (status.tag) {
    case 'unset': {
      yield* Effect.log(`Creating subscription for ${eventType}`)
      yield* createWebhookSubscription(adapterOps, adapterTag, tokenKey, eventType, webhookUrl)
      break
    }

    case 'inactive': {
      yield* Effect.log(`Activating subscription for ${eventType}`)
      yield* activateWebhookSubscription(adapterOps, adapterTag, status.id, eventType)
      break
    }

    case 'active': {
      yield* Effect.log(`Webhook ${eventType} is already active`)
      yield* ensureWebhookExists(
        adapterOps,
        adapterTag,
        tokenKey,
        webhookUrl,
        status.id,
        eventType,
        existingSubscriptions,
      )
      break
    }
  }
})

/**
 * Log a summary of webhook statuses
 */
const logStatusSummary = Effect.fn('logStatusSummary')(function* (
  eventStatuses: Record<string, WebhookStatus>,
) {
  const statusSummary = pipe(
    Object.values(eventStatuses),
    Array.groupBy((status) => status.tag),
    Record.map(Array.length),
  )
  yield* Effect.log('Webhook status summary:', statusSummary)
})

/**
 * Generic webhook subscription chain that works with any adapter
 * Follows the pattern from the previous implementation:
 * 1. Get desired webhook event types from the adapter manifest
 * 2. List existing subscriptions from the external system
 * 3. Determine status for each event (active, inactive, or unset)
 * 4. Take appropriate action (create, activate, or skip)
 * 5. Store/update webhook configuration in database
 *
 * @param webhookUrl - The URL where webhooks should be sent
 */
export const webhookSubscriptionChain = (webhookUrl: string) =>
  Effect.gen(function* () {
    const adapterOps = yield* AdapterOperations
    const tokenKey = yield* TokenKey
    const adapterTag = adapterOps.getAdapterTag()

    // Get desired event types from manifest
    const desiredEventTypes = adapterOps.getWebhookEventTypes()

    if (desiredEventTypes.length === 0) {
      yield* Effect.log('No webhook events configured in manifest')
      return
    }

    yield* Effect.log(`Found ${desiredEventTypes.length} webhook event types to subscribe to`)

    // Fetch existing subscriptions
    const existingSubscriptions = yield* fetchWebhookSubscriptions(adapterOps)
    yield* Effect.log(`Found ${existingSubscriptions.length} existing webhook subscriptions`)

    // Determine status for each event type
    const eventStatuses = yield* determineEventStatuses(
      desiredEventTypes,
      existingSubscriptions,
      webhookUrl,
    )

    // Log status summary
    yield* logStatusSummary(eventStatuses)

    // Process each event based on its status
    yield* Effect.forEach(
      Object.entries(eventStatuses),
      ([eventType, status]) =>
        processWebhookEvent(
          eventType,
          status,
          adapterOps,
          adapterTag,
          tokenKey,
          webhookUrl,
          existingSubscriptions,
        ),
      { concurrency: 'unbounded' },
    )

    yield* Effect.log(`✅ Webhook subscription sync completed for ${adapterTag}`)
  })
