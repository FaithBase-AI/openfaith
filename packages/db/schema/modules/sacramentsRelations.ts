import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { sacramentsTable } from '@openfaith/db/schema/modules/sacramentsSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const sacramentsRelations = relations(sacramentsTable, ({ one, many }) => ({
  administeredBy: one(peopleTable, {
    fields: [sacramentsTable.administeredBy],
    references: [peopleTable.id],
    relationName: 'SacramentAdministeredBy',
  }),
  org: one(orgsTable, {
    fields: [sacramentsTable.orgId],
    references: [orgsTable.id],
  }),
  receivedBy: one(peopleTable, {
    fields: [sacramentsTable.receivedBy],
    references: [peopleTable.id],
    relationName: 'SacramentReceivedBy',
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'SacramentSourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'SacramentTargetEdges',
  }),
}))
