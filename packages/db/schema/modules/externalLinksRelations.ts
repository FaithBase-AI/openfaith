import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const externalLinksRelations = relations(externalLinksTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [externalLinksTable.orgId],
    references: [orgsTable.id],
  }),
}))
