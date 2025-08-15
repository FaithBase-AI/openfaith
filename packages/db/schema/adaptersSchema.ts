import { pgTable } from '@openfaith/db/_table'
import type { AdapterSyncItem } from '@openfaith/shared'
import { index, primaryKey } from 'drizzle-orm/pg-core'

export const adapterDetailsTable = pgTable(
  'adapterDetails',
  (d) => ({
    _tag: d
      .char({ enum: ['adapterDetails'], length: 14 })
      .default('adapterDetails')
      .$type<'adapterDetails'>()
      .notNull(),
    adapter: d.text().notNull(),
    createdAt: d.timestamp().notNull(),
    enabled: d.boolean().notNull(),
    orgId: d.text().notNull(),
    syncStatus: d.jsonb().$type<Array<AdapterSyncItem>>().notNull(),
  }),
  (x) => ({
    id: primaryKey({
      columns: [x.orgId, x.adapter],
      name: 'adapterDetailsId',
    }),
  }),
)

export const adapterTokensTable = pgTable(
  'adapterTokens',
  (d) => ({
    _tag: d
      .char({ enum: ['adapterToken'], length: 12 })
      .default('adapterToken')
      .$type<'adapterToken'>()
      .notNull(),
    accessToken: d.text().notNull(),
    adapter: d.text().notNull(),
    createdAt: d.timestamp().notNull(),
    expiresIn: d.integer().notNull(),
    orgId: d.text().notNull(),
    refreshToken: d.text().notNull(),
    userId: d.text().notNull(),
  }),
  (x) => ({
    id: primaryKey({
      columns: [x.userId, x.orgId, x.adapter],
      name: 'adapterTokensId',
    }),
  }),
)

export const adapterWebhooksTable = pgTable(
  'adapterWebhooks',
  (d) => ({
    _tag: d
      .char({ enum: ['adapterWebhook'], length: 14 })
      .default('adapterWebhook')
      .$type<'adapterWebhook'>()
      .notNull(),
    adapter: d.text().notNull(),
    authenticitySecret: d.text().notNull(),
    createdAt: d.timestamp().notNull(),
    enabled: d.boolean().notNull().default(true),
    eventTypes: d.jsonb().$type<Array<string>>().notNull(),
    externalWebhookId: d.text(),
    id: d.text().primaryKey(),
    lastProcessedAt: d.timestamp(),
    lastReceivedAt: d.timestamp(),
    orgId: d.text().notNull(),
    updatedAt: d.timestamp().notNull(),
    verificationMethod: d.text().notNull(),
    webhookUrl: d.text().notNull(),
  }),
  (x) => ({
    orgAdapter: index('webhook_org_adapter_idx').on(x.orgId, x.adapter),
  }),
)
