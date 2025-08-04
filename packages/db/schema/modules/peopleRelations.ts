import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const peopleRelations = relations(peopleTable, ({ many, one }) => ({
  // People belong to an organization
  org: one(orgsTable, {
    fields: [peopleTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'PersonSourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'PersonTargetEdges',
  }),
}))
