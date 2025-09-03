import { pgTable } from '@openfaith/db/_table'
import type { AdapterSyncItem } from '@openfaith/shared'
import { primaryKey } from 'drizzle-orm/pg-core'

export const adapterDetailsTable = pgTable(
  'adapterDetails',
  (d) => ({
    _tag: d
      .char({ enum: ['adapterDetails'], length: 14 })
      .default('adapterDetails')
      .$type<'adapterDetails'>()
      .notNull(),
    adapter: d.text().notNull(),
    createdAt: d.timestamp({ withTimezone: true }).notNull(),
    enabled: d.boolean().notNull(),
    orgId: d.varchar({ length: 128 }).notNull(),
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
    createdAt: d.timestamp({ withTimezone: true }).notNull(),
    expiresIn: d.integer().notNull(),
    orgId: d.varchar({ length: 128 }).notNull(),
    refreshToken: d.text().notNull(),
    userId: d.varchar({ length: 128 }).notNull(),
  }),
  (x) => ({
    id: primaryKey({
      columns: [x.userId, x.orgId, x.adapter],
      name: 'adapterTokensId',
    }),
  }),
)
