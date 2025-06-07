import { adapterTokenTable } from '@openfaith/db/schema/adaptersSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const adapterTokenRelations = relations(adapterTokenTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [adapterTokenTable.orgId],
    references: [orgsTable.id],
  }),
  user: one(usersTable, {
    fields: [adapterTokenTable.userId],
    references: [usersTable.id],
  }),
}))
