import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const externalLinksRelations = relations(externalLinksTable, ({ one, many }) => ({
  org: one(orgsTable, {
    fields: [externalLinksTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable),
  targetEdges: many(edgesTable),
}))
