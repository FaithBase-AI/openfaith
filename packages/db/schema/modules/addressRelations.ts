import { addressesTable } from '@openfaith/db/schema/modules/addressSchema'
import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const addressRelations = relations(addressesTable, ({ one, many }) => ({
  org: one(orgsTable, {
    fields: [addressesTable.orgId],
    references: [orgsTable.id],
  }),
  sourceEdges: many(edgesTable),
  targetEdges: many(edgesTable),
}))
