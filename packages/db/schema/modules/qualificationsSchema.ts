import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const qualificationsTable = pgTable(
  'qualifications',
  (d) => ({
    ...dbBaseEntityFields(d, 'qualification'),

    description: d.text(),
    key: d.text().notNull(),
    name: d.text().notNull(),
    type: d.text().notNull().default('default'),
  }),
  (x) => ({
    keyIdx: index('qualificationKeyIdx').on(x.orgId, x.key),
    nameIdx: index('qualificationNameIdx').on(x.name),
    orgIdIdx: index('qualificationOrgIdIdx').on(x.orgId),
  }),
)

export const Qualification = createSelectSchema(qualificationsTable)
export type Qualification = typeof Qualification.Type

export const NewQualification = createInsertSchema(qualificationsTable)
export type NewQualification = typeof NewQualification.Type
