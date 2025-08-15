import * as crypto from 'node:crypto'
import { WebhookProcessingError, WebhookVerificationError } from '@openfaith/domain'
import { pcoWebhooks } from '@openfaith/pco/base/pcoEntityManifest'
import { Array, Context, Effect, Layer, Option, pipe } from 'effect'

/**
 * PCO Webhook Service that handles webhook registration and processing for Planning Center Online
 */
export class PcoWebhookService extends Context.Tag('@openfaith/pco/PcoWebhookService')<
  PcoWebhookService,
  {
    readonly register: (
      entityName: string,
      webhookUrl: string,
    ) => Effect.Effect<void, WebhookProcessingError>
    readonly verify: (
      signature: string,
      payload: unknown,
      secret: string,
    ) => Effect.Effect<boolean, WebhookVerificationError>
    readonly process: (
      eventType: string,
      payload: unknown,
    ) => Effect.Effect<void, WebhookProcessingError>
    readonly unregister: (entityName: string) => Effect.Effect<void, WebhookProcessingError>
  }
>() {}

export const PcoWebhookServiceLive = Layer.succeed(PcoWebhookService, {
  process: (eventType: string, payload: unknown) =>
    Effect.gen(function* () {
      // Extract entity name from event type
      const parts = eventType.split('.')
      if (parts.length < 4) {
        return yield* Effect.fail(
          new WebhookProcessingError({
            adapter: 'pco',
            eventType,
            message: `Invalid event type format: ${eventType}`,
          }),
        )
      }

      const entityNameOpt = pipe(parts, Array.get(3))
      const actionOpt = pipe(parts, Array.get(4))

      const entityName = pipe(
        entityNameOpt,
        Option.getOrElse(() => 'unknown'),
      )

      const action = pipe(
        actionOpt,
        Option.getOrElse(() => 'unknown'),
      )

      // Find the webhook definition
      const webhookDefOpt = pipe(
        Object.entries(pcoWebhooks),
        Array.findFirst(([key]) => key === eventType),
        Option.map(([, def]) => def),
      )

      if (Option.isNone(webhookDefOpt)) {
        return yield* Effect.fail(
          new WebhookProcessingError({
            adapter: 'pco',
            eventType,
            message: `No webhook definition found for event: ${eventType}`,
          }),
        )
      }

      // Log processing information
      yield* Effect.log(
        `Processing PCO webhook: ${eventType} for entity: ${entityName}, action: ${action}`,
      )

      // Determine the workflow action based on the webhook action
      const workflowAction = action === 'destroyed' ? 'delete' : 'sync'

      yield* Effect.log(
        `Webhook processed. Entity: ${entityName}, Workflow action: ${workflowAction}`,
      )

      // In a full implementation, this would trigger the sync workflow
      // For now, we just log the intent
      yield* Effect.log({
        adapter: 'pco',
        entityName: entityName.charAt(0).toUpperCase() + entityName.slice(1),
        message: 'Would trigger sync workflow',
        syncType: workflowAction === 'sync' ? 'full' : 'incremental',
        webhookPayload: payload,
      })
    }),
  register: (entityName: string, webhookUrl: string) =>
    Effect.gen(function* () {
      // Find the webhook definitions for this entity
      const webhookDefs = pipe(
        Object.entries(pcoWebhooks),
        Array.filter(([eventType]) => {
          // Extract entity from event type (e.g., "people.v2.events.person.created" -> "person")
          const parts = eventType.split('.')
          const entityPart = parts[3] // "person" in the example
          return entityPart === entityName.toLowerCase()
        }),
        Array.map(([eventType, definition]) => ({
          definition,
          eventType,
        })),
      )

      if (pipe(webhookDefs, Array.length) === 0) {
        return yield* Effect.fail(
          new WebhookProcessingError({
            adapter: 'pco',
            message: `No webhook definitions found for entity: ${entityName}`,
          }),
        )
      }

      // Register each webhook event type
      yield* Effect.forEach(webhookDefs, ({ eventType }) =>
        // In production, this would make an API call to PCO to register the webhook
        Effect.log(`Registered PCO webhook for ${eventType} at ${webhookUrl}`),
      )
    }),

  unregister: (entityName: string) =>
    Effect.gen(function* () {
      // Find all webhook event types for this entity
      const eventTypes = pipe(
        Object.entries(pcoWebhooks),
        Array.filter(([eventType]) => {
          const parts = eventType.split('.')
          const entityPart = parts[3]
          return entityPart === entityName.toLowerCase()
        }),
        Array.map(([eventType]) => eventType),
      )

      if (pipe(eventTypes, Array.length) === 0) {
        return yield* Effect.fail(
          new WebhookProcessingError({
            adapter: 'pco',
            message: `No webhooks found for entity: ${entityName}`,
          }),
        )
      }

      // Unregister each webhook
      yield* Effect.forEach(eventTypes, (eventType) =>
        // In production, this would make an API call to PCO to remove the webhook
        Effect.log(`Unregistered PCO webhook for ${eventType}`),
      )
    }),

  verify: (signature: string, payload: unknown, secret: string) =>
    Effect.gen(function* () {
      // PCO uses HMAC-SHA256 for webhook signatures
      // The signature is in the format: "sha256=<hash>"
      if (!signature.startsWith('sha256=')) {
        return yield* Effect.fail(
          new WebhookVerificationError({
            adapter: 'pco',
            message: 'Invalid signature format - missing sha256= prefix',
          }),
        )
      }

      const expectedSignature = signature.substring(7) // Remove "sha256=" prefix
      const payloadString = JSON.stringify(payload)

      // Calculate HMAC
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(payloadString)
      const calculatedSignature = hmac.digest('hex')

      // Constant-time comparison to prevent timing attacks
      const valid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(calculatedSignature),
      )

      if (!valid) {
        yield* Effect.logWarning('PCO webhook signature verification failed')
      }

      return valid
    }),
})
