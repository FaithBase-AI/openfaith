import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const emailsTable = pgTable(
  'emails',
  (d) => ({
    ...dbBaseEntityFields(d, 'email'),

    address: d.text().notNull(),
    blocked: d.boolean().notNull().default(false),
    location: d.text(),
    primary: d.boolean().notNull().default(false),
    type: d.text().notNull().default('default'),
  }),
  (x) => [index('emailOrgIdIdx').on(x.orgId)],
)

export const Email = createSelectSchema(emailsTable)
export type Email = typeof Email.Type

export const NewEmail = createInsertSchema(emailsTable)
export type NewEmail = typeof NewEmail.Type
