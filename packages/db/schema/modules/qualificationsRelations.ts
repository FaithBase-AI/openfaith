import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { qualificationsTable } from '@openfaith/db/schema/modules/qualificationsSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const qualificationRelations = relations(qualificationsTable, ({ one, many }) => ({
  org: one(orgsTable, {
    fields: [qualificationsTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'QualificationSourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'QualificationTargetEdges',
  }),
}))
