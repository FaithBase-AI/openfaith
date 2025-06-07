import { pgTable } from '@openfaith/db/_table'
import { primaryKey } from 'drizzle-orm/pg-core'

export const adapterTokenTable = pgTable(
  'adapterTokens',
  (d) => ({
    _tag: d
      .char({ enum: ['adapterToken'], length: 12 })
      .default('adapterToken')
      .notNull(),
    accessToken: d.text().notNull(),
    adapter: d.text().notNull(),
    createdAt: d.timestamp().notNull(),
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
