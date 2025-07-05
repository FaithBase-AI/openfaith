import { addressesTable } from '@openfaith/db/schema/modules/addressSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const addressRelations = relations(addressesTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [addressesTable.orgId],
    references: [orgsTable.id],
  }),
}))
