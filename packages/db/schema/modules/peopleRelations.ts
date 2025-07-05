import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const peopleRelations = relations(peopleTable, ({ one }) => ({
  // People belong to an organization
  org: one(orgsTable, {
    fields: [peopleTable.orgId],
    references: [orgsTable.id],
  }),
}))
