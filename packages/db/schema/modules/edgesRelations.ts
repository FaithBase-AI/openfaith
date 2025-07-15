import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const edgeRelations = relations(edgesTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [edgesTable.orgId],
    references: [orgsTable.id],
  }),
}))
