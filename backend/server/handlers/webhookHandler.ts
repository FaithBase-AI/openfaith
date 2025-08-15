import crypto from 'node:crypto'
import { HttpApiBuilder } from '@effect/platform'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { adapterWebhooksTable } from '@openfaith/db'
import { MainApi, WebhookProcessingError, WebhookVerificationError } from '@openfaith/domain'
import { DBLive } from '@openfaith/server/live/dbLive'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
import { and, eq } from 'drizzle-orm'
import { Array, Effect, Layer, Option, pipe } from 'effect'

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

      const workflowClient = yield* WorkflowClient

      yield* pipe(adapter, (adapterName) => {
        if (adapterName === 'pco') {
          return pipe(
            workflowClient.workflows.PcoWebhookWorkflow({
              payload: {
                body: body as {
                  readonly data: ReadonlyArray<{
                    readonly id: string
                    readonly type: string
                    readonly attributes: {
                      readonly payload: string
                      readonly name: string
                    }
                    readonly relationships?: unknown
                  }>
                },
                headers,
                orgId: verifiedWebhook.orgId,
                webhookId: verifiedWebhook.id,
              },
            }),
            Effect.mapError(
              (error) =>
                new WebhookProcessingError({
                  adapter,
                  message: `Workflow error: ${error}`,
                }),
            ),
          )
        }
        return Effect.fail(
          new WebhookProcessingError({
            adapter,
            message: `No handler implemented for adapter: ${adapter}`,
          }),
        )
      })

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
        message: `Webhook processed for ${adapter}`,
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
