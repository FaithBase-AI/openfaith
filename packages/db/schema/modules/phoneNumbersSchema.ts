import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const phoneNumbersTable = pgTable(
  'phoneNumbers',
  (d) => ({
    ...dbBaseEntityFields(d, 'phoneNumber'),

    countryCode: d.text(),
    location: d.text(),
    number: d.text(),
    primary: d.boolean().notNull().default(false),
    type: d.text().notNull().default('default'),
  }),
  (x) => ({
    orgIdIdx: index('phoneNumberOrgIdIdx').on(x.orgId),
  }),
)

export const PhoneNumber = createSelectSchema(phoneNumbersTable)
export type PhoneNumber = typeof PhoneNumber.Type

export const NewPhoneNumber = createInsertSchema(phoneNumbersTable)
export type NewPhoneNumber = typeof NewPhoneNumber.Type
