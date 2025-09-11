import { Headers, HttpApiBuilder, HttpServerResponse } from '@effect/platform'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { adapterWebhooksTable } from '@openfaith/db'
import { AppHttpApi } from '@openfaith/domain'
import { pcoEntityManifest } from '@openfaith/pco/server'
import { Array, Effect, Option, pipe, Record, Schema } from 'effect'

export const AdapterWebhooksHandlerLive = HttpApiBuilder.group(AppHttpApi, 'adapter', (handlers) =>
  handlers.handle('webhooks', (input) =>
    Effect.gen(function* () {
      const {
        payload,
        request: { headers },
      } = input

      const rawBody = JSON.stringify(payload)

      const secretOpt = pipe(headers, Headers.get('x-pco-webhooks-authenticity'))
      const webhookName = pipe(headers, Headers.get('x-pco-webhooks-name'))

      if (secretOpt._tag === 'None' || webhookName._tag === 'None') {
        return
      }

      const db = yield* PgDrizzle.PgDrizzle

      const webhooks = yield* db
        .select({
          authenticitySecret: adapterWebhooksTable.authenticitySecret,
          orgId: adapterWebhooksTable.orgId,
        })
        .from(adapterWebhooksTable)

      const orgIdOpt = pipe(
        webhooks,
        Array.findFirst((webhook) => {
          const hasher = new Bun.CryptoHasher('sha256', webhook.authenticitySecret)
          hasher.update(rawBody)
          const computedHash = hasher.digest('hex')

          return computedHash === secretOpt.value
        }),
        Option.map((webhook) => webhook.orgId),
      )

      if (orgIdOpt._tag === 'None') {
        return
      }

      const PcoWebhookPayloadSchema = Schema.Struct({
        data: Schema.Array(
          Schema.Union(
            ...pipe(
              pcoEntityManifest.webhooks,
              Record.values,
              Array.map((x) => x.webhookSchema),
            ),
          ),
        ),
      })

      console.log(payload)

      const data = yield* Schema.decodeUnknown(PcoWebhookPayloadSchema)(payload)

      console.log(data)
    }).pipe(
      Effect.catchTags({
        ParseError: (error) =>
          Effect.gen(function* () {
            yield* Effect.logError('Failed to decode webhook payload', { error })
            return HttpServerResponse.empty()
          }),
        SqlError: (error) =>
          Effect.gen(function* () {
            yield* Effect.logError('Failed to get webhooks', { error })
            return HttpServerResponse.empty()
          }),
      }),
    ),
  ),
)
