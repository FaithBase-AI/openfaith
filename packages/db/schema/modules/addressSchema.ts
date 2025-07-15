import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const addressesTable = pgTable(
  'addresses',
  (d) => ({
    _tag: d
      .char({ enum: ['address'], length: 7 })
      .default('address')
      .$type<'address'>()
      .notNull(),
    city: d.text(),
    countryCode: d.text(),
    countryName: d.text(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    location: d.text(),
    orgId: d.text().notNull(),
    primary: d.boolean().notNull().default(false),
    state: d.text(),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    streetLine1: d.text(),
    streetLine2: d.text(),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull().default('default'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
    zip: d.text(),
  }),
  (x) => ({
    orgIdIdx: index('addressOrgIdIdx').on(x.orgId),
  }),
)

export const Address = createSelectSchema(addressesTable)
export type Address = typeof Address.Type

export const NewAddress = createInsertSchema(addressesTable)
export type NewAddress = typeof NewAddress.Type
