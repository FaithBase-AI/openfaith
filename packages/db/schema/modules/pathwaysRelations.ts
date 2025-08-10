import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { fieldsTable } from '@openfaith/db/schema/modules/fieldsSchema'
import { journeysTable, pathwaysTable } from '@openfaith/db/schema/modules/pathwaysSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const pathwayRelations = relations(pathwaysTable, ({ one, many }) => ({
  journeys: many(journeysTable),
  linkedField: one(fieldsTable, {
    fields: [pathwaysTable.linkedFieldId],
    references: [fieldsTable.id],
  }),
  org: one(orgsTable, {
    fields: [pathwaysTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'PathwaySourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'PathwayTargetEdges',
  }),
}))

// pathwayStep relations removed

export const journeyRelations = relations(journeysTable, ({ one, many }) => ({
  org: one(orgsTable, {
    fields: [journeysTable.orgId],
    references: [orgsTable.id],
  }),
  pathway: one(pathwaysTable, {
    fields: [journeysTable.pathwayId],
    references: [pathwaysTable.id],
  }),
  sourceEdges: many(edgesTable, {
    relationName: 'JourneySourceEdges',
  }),
  targetEdges: many(edgesTable, {
    relationName: 'JourneyTargetEdges',
  }),
}))

// stepProgress relations removed
