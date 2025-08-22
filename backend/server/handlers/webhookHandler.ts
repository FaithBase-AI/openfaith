import crypto from 'node:crypto'
import { HttpApiBuilder } from '@effect/platform'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { adapterWebhooksTable } from '@openfaith/db'
import { MainApi, WebhookProcessingError, WebhookVerificationError } from '@openfaith/domain'
import { PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'
import { DBLive } from '@openfaith/server/live/dbLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { and, eq } from 'drizzle-orm'
import { Array, Effect, Layer, Option, pipe } from 'effect'

// Helper function to get the appropriate adapter layer
const getAdapterLayer = (adapter: string) => {
  switch (adapter) {
    case 'pco':
      return Effect.succeed(PcoAdapterOperationsLayer)
    // case 'ccb':
    //   return Effect.succeed(CcbAdapterOperationsLayer) // Add when CCB adapter is ready
    default:
      return Effect.fail(
        new WebhookProcessingError({
          adapter,
          message: `No adapter layer found for: ${adapter}`,
        }),
      )
  }
}

export const WebhookHandlerLive = HttpApiBuilder.group(MainApi, 'webhooks', (handlers) =>
  handlers.handle('receive', (input) =>
    Effect.gen(function* () {
      const { adapter } = input.urlParams
      const { headers, body, rawBody } = input.payload

      yield* Effect.log(`Received webhook for adapter: ${adapter}`)

      const db = yield* PgDrizzle.PgDrizzle

      const webhookConfigs = yield* Effect.tryPromise({
        catch: (error) =>
          new WebhookProcessingError({
            adapter,
            message: `Failed to query webhook configurations: ${error}`,
          }),
        try: () =>
          db
            .select()
            .from(adapterWebhooksTable)
            .where(
              and(
                eq(adapterWebhooksTable.adapter, adapter),
                eq(adapterWebhooksTable.enabled, true),
              ),
            ),
      })

      const verifiedWebhookOpt = pipe(
        webhookConfigs,
        Array.findFirst((config) =>
          verifyWebhook({
            config,
            headers,
            rawBody,
          }),
        ),
      )

      const verifiedWebhook = yield* pipe(
        verifiedWebhookOpt,
        Option.match({
          onNone: () =>
            Effect.fail(
              new WebhookVerificationError({
                adapter,
                message: 'Failed to verify webhook authenticity',
              }),
            ),
          onSome: (webhook) => Effect.succeed(webhook),
        }),
      )

      // Update last received timestamp
      yield* Effect.tryPromise({
        catch: (error) =>
          new WebhookProcessingError({
            adapter,
            message: `Failed to update lastReceivedAt: ${error}`,
          }),
        try: () =>
          db
            .update(adapterWebhooksTable)
            .set({ lastReceivedAt: new Date() })
            .where(eq(adapterWebhooksTable.id, verifiedWebhook.id)),
      })

      // Get the appropriate adapter layer
      const adapterLayer = yield* getAdapterLayer(adapter)

      // Process webhook through adapter operations
      const adapterOps = yield* pipe(
        AdapterOperations,
        Effect.provide(adapterLayer),
        Effect.provideService(TokenKey, verifiedWebhook.orgId),
      )

      // Process webhook - returns array of sync requests
      const syncRequests = yield* pipe(
        adapterOps.processWebhook(body),
        Effect.mapError(
          (error) =>
            new WebhookProcessingError({
              adapter,
              message: `Failed to process webhook: ${error}`,
            }),
        ),
      )

      // Trigger sync workflows for all requests
      if (syncRequests.length > 0) {
        const workflowClient = yield* WorkflowClient

        yield* pipe(
          syncRequests,
          Array.map((syncRequest) =>
            workflowClient.workflows.ExternalSyncSingleEntityWorkflow({
              payload: {
                entityId: syncRequest.entityId,
                entityType: syncRequest.entityType,
                operation: syncRequest.operation,
                relatedIds: syncRequest.relatedIds,
                tokenKey: verifiedWebhook.orgId,
                webhookData: syncRequest.webhookData, // Pass webhook data for fallback
              },
            }),
          ),
          Effect.all, // Process all in parallel
          Effect.tap((results) =>
            Effect.log(`Triggered ${results.length} entity syncs from webhook`),
          ),
          Effect.mapError(
            (error) =>
              new WebhookProcessingError({
                adapter,
                message: `Workflow error: ${error}`,
              }),
          ),
        )
      } else {
        yield* Effect.log('No sync requests generated from webhook')
      }

      // Update last processed timestamp
      yield* Effect.tryPromise({
        catch: (error) =>
          new WebhookProcessingError({
            adapter,
            message: `Failed to update lastProcessedAt: ${error}`,
          }),
        try: () =>
          db
            .update(adapterWebhooksTable)
            .set({ lastProcessedAt: new Date() })
            .where(eq(adapterWebhooksTable.id, verifiedWebhook.id)),
      })

      return {
        message: `Webhook processed for ${adapter}. Synced ${syncRequests.length} entities.`,
        success: true,
      }
    }),
  ),
).pipe(Layer.provide(DBLive), Layer.provide(WorkflowClient.Default))

const verifyWebhook = ({
  config,
  headers,
  rawBody,
}: {
  config: typeof adapterWebhooksTable.$inferSelect
  headers: Record<string, string>
  rawBody: string
}): boolean => {
  switch (config.verificationMethod) {
    case 'hmac-sha256': {
      const signature = headers['x-webhook-signature'] || headers['x-pco-webhooks-authenticity']
      if (!signature) {
        return false
      }

      const expectedSignature = crypto
        .createHmac('sha256', config.authenticitySecret)
        .update(rawBody)
        .digest('hex')

      return signature === expectedSignature
    }
    case 'hmac-sha1': {
      const signature = headers['x-webhook-signature']
      if (!signature) {
        return false
      }

      const expectedSignature = crypto
        .createHmac('sha1', config.authenticitySecret)
        .update(rawBody)
        .digest('hex')

      return signature === expectedSignature
    }
    default:
      return false
  }
}
