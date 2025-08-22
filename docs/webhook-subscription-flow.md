# Webhook Subscription Flow Documentation

## Overview

This document describes how webhook subscription and management worked in the previous Steeple/church-health application, providing context for implementing similar functionality in OpenFaith.

## Previous Implementation Architecture

### Key Components

1. **Subscription Chain (`subscribeToPCOWebhooksChainE.ts`)**: An Effect-based chain that orchestrated the webhook subscription process
2. **PCO Webhooks API (`pcoWebhooks.ts`)**: API client for PCO's webhook subscription endpoints
3. **Database Storage**: Webhook configurations stored in the database for verification and management

## PCO Webhook Subscription Flow

### 1. Webhook Subscription Process

The subscription flow typically followed these steps:

```typescript
// Conceptual flow from subscribeToPCOWebhooksChainE.ts
1. Authenticate with PCO using OAuth tokens
2. Fetch existing webhook subscriptions from PCO
3. Compare with desired webhook events
4. Create missing subscriptions
5. Store webhook secrets in database
6. Activate subscriptions
```

### 2. PCO Webhook API Structure

PCO provides a dedicated webhook management API at `https://api.planningcenteronline.com/webhooks/v2/`:

#### Endpoints
- **POST /webhooks/v2/subscriptions**: Create a new webhook subscription
- **GET /webhooks/v2/subscriptions**: List all active subscriptions
- **GET /webhooks/v2/subscriptions/:id**: Get specific subscription details
- **PATCH /webhooks/v2/subscriptions/:id**: Update subscription (activate/deactivate)
- **DELETE /webhooks/v2/subscriptions/:id**: Remove subscription

#### Subscription Payload Structure
```json
{
  "data": {
    "type": "Subscription",
    "attributes": {
      "name": "OpenFaith Person Sync",
      "url": "https://app.openfaith.com/api/webhooks/pco",
      "active": true,
      "application_id": "oauth_app_id"
    },
    "relationships": {
      "webhook_events": {
        "data": [
          { "type": "WebhookEvent", "id": "people.v2.events.person.created" },
          { "type": "WebhookEvent", "id": "people.v2.events.person.updated" },
          { "type": "WebhookEvent", "id": "people.v2.events.person.deleted" }
        ]
      }
    }
  }
}
```

### 3. Event Types

PCO webhook events follow a consistent naming pattern:
- Format: `{product}.{version}.events.{resource}.{action}`
- Example: `people.v2.events.person.created`

Common event categories:
- **Person Events**: created, updated, deleted, merged
- **Contact Info Events**: email/phone/address created, updated, deleted
- **Group Events**: group membership changes
- **Attendance Events**: check-ins and attendance records

### 4. Webhook Verification

PCO uses HMAC-SHA256 for webhook authenticity verification:

1. **Secret Generation**: PCO generates an `authenticity_secret` when creating a subscription
2. **Signature Header**: PCO includes `X-PCO-Webhooks-Authenticity` header with each webhook
3. **Verification Process**:
   ```typescript
   const signature = headers['X-PCO-Webhooks-Authenticity']
   const expectedSignature = crypto
     .createHmac('sha256', authenticitySecret)
     .update(rawBody)
     .digest('hex')
   const isValid = signature === expectedSignature
   ```

### 5. Subscription Management Chain

The `subscribeToPCOWebhooksChainE` chain typically performed these operations:

```typescript
// Pseudo-code representation of the chain flow
Effect.gen(function* () {
  // 1. Get PCO API client with authentication
  const pcoClient = yield* PcoApiClient
  
  // 2. Define all webhook events to subscribe to
  const desiredEvents = [
    'people.v2.events.person.created',
    'people.v2.events.person.updated',
    'people.v2.events.person.deleted',
    'people.v2.events.person.merged',
    // ... more events
  ]
  
  // 3. Get existing subscriptions
  const existingSubscriptions = yield* pcoClient.webhooks.listSubscriptions()
  
  // 4. Determine which events need new subscriptions
  const existingEventIds = existingSubscriptions.flatMap(sub => 
    sub.relationships.webhook_events.data.map(e => e.id)
  )
  const eventsToSubscribe = desiredEvents.filter(e => !existingEventIds.includes(e))
  
  // 5. Create new subscription if needed
  if (eventsToSubscribe.length > 0) {
    const subscription = yield* pcoClient.webhooks.createSubscription({
      name: `OpenFaith Sync - ${orgId}`,
      url: `${baseUrl}/api/webhooks/pco`,
      active: true,
      events: eventsToSubscribe
    })
    
    // 6. Store webhook configuration in database
    yield* db.insert(adapterWebhooksTable).values({
      adapter: 'pco',
      orgId,
      webhookUrl: subscription.attributes.url,
      externalWebhookId: subscription.id,
      eventTypes: eventsToSubscribe,
      authenticitySecret: subscription.attributes.authenticity_secret,
      verificationMethod: 'hmac-sha256',
      enabled: true
    })
  }
  
  // 7. Activate all subscriptions
  yield* Effect.forEach(existingSubscriptions, (sub) =>
    sub.attributes.active ? Effect.unit :
      pcoClient.webhooks.updateSubscription(sub.id, { active: true })
  )
})
```

### 6. Webhook Delivery Format

PCO delivers webhooks with this structure:

```json
{
  "data": [
    {
      "id": "unique-delivery-id",
      "type": "EventDelivery",
      "attributes": {
        "name": "people.v2.events.person.updated",
        "attempt": 1,
        "payload": "{\"data\":{\"type\":\"Person\",\"id\":\"12345\",\"attributes\":{...}}}"
      },
      "relationships": {
        "subscription": {
          "data": { "type": "Subscription", "id": "subscription-id" }
        }
      }
    }
  ]
}
```

Key points:
- Multiple events can be delivered in a single webhook
- The actual event payload is JSON-stringified in the `payload` field
- Each delivery includes attempt count for retry tracking

### 7. Error Handling and Retries

PCO's webhook delivery system:
- **Retry Policy**: PCO retries failed webhooks with exponential backoff
- **Max Attempts**: Usually 5-10 attempts over 24 hours
- **Success Response**: Must return 2xx status code
- **Timeout**: 30-second timeout for webhook processing
- **Automatic Deactivation**: Subscriptions may be deactivated after repeated failures

### 8. Subscription Lifecycle Management

The previous implementation handled:

1. **Initial Setup**: Subscribe to all required events when org connects PCO
2. **Periodic Verification**: Check subscription status and reactivate if needed
3. **Event Updates**: Add new event types as product evolves
4. **Cleanup**: Remove subscriptions when org disconnects
5. **Migration**: Handle changes in webhook event names or structure

## Implementation Considerations for OpenFaith

### 1. Database Schema
- Store `authenticity_secret` securely (encrypted)
- Track subscription status and last verification time
- Log webhook delivery attempts and failures

### 2. Workflow Integration
- Create `PcoWebhookSubscriptionWorkflow` for initial setup
- Add periodic job to verify subscription health
- Handle subscription updates when entity manifest changes

### 3. Security
- Verify all incoming webhooks using HMAC
- Use environment-specific webhook URLs
- Implement rate limiting for webhook endpoints
- Add request logging for debugging

### 4. Scalability
- Process webhook events asynchronously
- Implement idempotency for webhook processing
- Use database transactions for atomic updates
- Consider queue-based processing for high volume

### 5. Testing
- Mock PCO webhook API responses
- Test HMAC verification logic
- Simulate webhook delivery failures
- Test idempotency with duplicate deliveries

## Next Steps

To implement webhook subscriptions in OpenFaith:

1. **Add PCO Webhook API Client**: Extend `pcoApi.ts` with webhook subscription endpoints
2. **Create Subscription Workflow**: Implement `PcoWebhookSubscriptionWorkflow`
3. **Database Migration**: Add `adapterWebhooks` table
4. **Update Webhook Handler**: Integrate with subscription verification
5. **Add Management UI**: Create interface for viewing/managing subscriptions
6. **Monitoring**: Add metrics for webhook processing success/failure

## References

- [PCO Webhooks Documentation](https://developer.planning.center/docs/#/apps/webhooks)
- [PCO API Authentication](https://developer.planning.center/docs/#/introduction/authentication)
- [Webhook Best Practices](https://developer.planning.center/docs/#/apps/webhooks/best-practices)