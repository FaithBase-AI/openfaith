import { circlesTable } from '@openfaith/db/schema/modules/circlesSchema'
import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const circleRelations = relations(circlesTable, ({ one, many }) => ({
  // Circle belongs to an organization
  org: one(orgsTable, {
    fields: [circlesTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'CircleSourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'CircleTargetEdges',
  }),
}))
