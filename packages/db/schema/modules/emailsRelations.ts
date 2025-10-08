import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { emailsTable } from '@openfaith/db/schema/modules/emailsSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const emailsRelations = relations(emailsTable, ({ one, many }) => ({
  org: one(orgsTable, {
    fields: [emailsTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'EmailSourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'EmailTargetEdges',
  }),
}))
