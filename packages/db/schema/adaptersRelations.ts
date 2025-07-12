import { adapterDetailsTable, adapterTokensTable } from '@openfaith/db/schema/adaptersSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const adapterDetailsRelations = relations(adapterDetailsTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [adapterDetailsTable.orgId],
    references: [orgsTable.id],
  }),
}))

export const adapterTokenRelations = relations(adapterTokensTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [adapterTokensTable.orgId],
    references: [orgsTable.id],
  }),
  user: one(usersTable, {
    fields: [adapterTokensTable.userId],
    references: [usersTable.id],
  }),
}))
