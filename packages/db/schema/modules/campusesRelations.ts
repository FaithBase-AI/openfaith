import { campusesTable } from '@openfaith/db/schema/modules/campusesSchema'
import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const campusRelations = relations(campusesTable, ({ one, many }) => ({
  // Campus belongs to an organization
  org: one(orgsTable, {
    fields: [campusesTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'CampusSourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'CampusTargetEdges',
  }),
}))
