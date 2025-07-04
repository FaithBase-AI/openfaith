import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const externalLinksRelations = relations(externalLinksTable, ({ one }) => ({
  // External links belong to an organization
  org: one(orgsTable, {
    fields: [externalLinksTable.orgId],
    references: [orgsTable.id],
  }),
  // External links can relate to people (when entityType is 'person')
  person: one(peopleTable, {
    fields: [externalLinksTable.entityId],
    references: [peopleTable.id],
    relationName: 'personExternalLinks',
  }),
}))
