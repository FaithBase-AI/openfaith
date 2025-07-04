import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const peopleRelations = relations(peopleTable, ({ one, many }) => ({
  // People can have many external links
  externalLinks: many(externalLinksTable, {
    relationName: 'personExternalLinks',
  }),
  // People belong to an organization
  org: one(orgsTable, {
    fields: [peopleTable.orgId],
    references: [orgsTable.id],
  }),
}))
