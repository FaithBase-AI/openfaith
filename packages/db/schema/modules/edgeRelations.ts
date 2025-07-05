import { edgeTable } from '@openfaith/db/schema/modules/edgeSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const edgeRelations = relations(edgeTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [edgeTable.orgId],
    references: [orgsTable.id],
  }),
}))
