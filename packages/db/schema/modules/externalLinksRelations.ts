import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const externalLinksRelations = relations(externalLinksTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [externalLinksTable.orgId],
    references: [orgsTable.id],
  }),
  person: one(peopleTable, {
    fields: [externalLinksTable.entityId],
    references: [peopleTable.id],
    relationName: 'PersonExternalLinks',
  }),
}))
