import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const addressesTable = pgTable(
  'addresses',
  (d) => ({
    // Use the standard base entity fields (id, orgId, externalIds, system fields)
    ...dbBaseEntityFields(d, 'address'),

    // Address-specific fields    city: d.text(),
    countryCode: d.text(),
    countryName: d.text(),
    location: d.text(),
    primary: d.boolean().notNull().default(false),
    state: d.text(),
    streetLine1: d.text(),
    streetLine2: d.text(),
    type: d.text().notNull().default('default'),
    zip: d.text(),
  }),
  (x) => [index('addressOrgIdIdx').on(x.orgId)],
)

export const Address = createSelectSchema(addressesTable)
export type Address = typeof Address.Type

export const NewAddress = createInsertSchema(addressesTable)
export type NewAddress = typeof NewAddress.Type
