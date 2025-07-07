import { campusesTable } from '@openfaith/db/schema/modules/campusesSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const campusRelations = relations(campusesTable, ({ one }) => ({
  // Campus belongs to an organization
  org: one(orgsTable, {
    fields: [campusesTable.orgId],
    references: [orgsTable.id],
  }),
}))
