import { phoneNumbersTable } from '@openfaith/db/schema/modules/phoneNumbersSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const phoneNumbersRelations = relations(phoneNumbersTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [phoneNumbersTable.orgId],
    references: [orgsTable.id],
  }),
}))
