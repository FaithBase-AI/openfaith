import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const sacramentsTable = pgTable(
  'sacraments',
  (d) => ({
    ...dbBaseEntityFields(d, 'sacrament'),

    administeredBy: d.text(),
    occurredAt: d.text(),
    receivedBy: d.text(),
    type: d.text().notNull(),
  }),
  (x) => ({
    administeredByIdx: index('sacramentsAdministeredByIdx').on(x.administeredBy),
    orgIdIdx: index('sacramentsOrgIdIdx').on(x.orgId),
    receivedByIdx: index('sacramentsReceivedByIdx').on(x.receivedBy),
  }),
)

export const Sacrament = createSelectSchema(sacramentsTable)
export type Sacrament = typeof Sacrament.Type

export const NewSacrament = createInsertSchema(sacramentsTable)
export type NewSacrament = typeof NewSacrament.Type
