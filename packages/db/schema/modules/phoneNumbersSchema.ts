import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const phoneNumbersTable = pgTable(
  'phoneNumbers',
  (d) => ({
    _tag: d
      .char({ enum: ['phoneNumber'], length: 11 })
      .default('phoneNumber')
      .notNull(),
    countryCode: d.text(),
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
    number: d.text(),
    orgId: d.text().notNull(),
    primary: d.boolean().notNull().default(false),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull().default('default'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    orgIdIdx: index('phoneNumberOrgIdIdx').on(x.orgId),
  }),
)

export const PhoneNumber = createSelectSchema(phoneNumbersTable)
export type PhoneNumber = typeof PhoneNumber.Type

export const NewPhoneNumber = createInsertSchema(phoneNumbersTable)
export type NewPhoneNumber = typeof NewPhoneNumber.Type
