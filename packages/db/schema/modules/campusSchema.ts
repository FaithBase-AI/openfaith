import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const campusesTable = pgTable(
  'campuses',
  (d) => ({
    _tag: d
      .char({ enum: ['campus'], length: 6 })
      .default('campus')
      .notNull(),
    avatarUrl: d.text(),
    churchCenterEnabled: d.boolean(),
    city: d.text(),
    contactEmailAddress: d.text(),
    country: d.text(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    dateFormat: d.integer(),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    description: d.text(),
    externalIds: d
      .jsonb()
      .$type<ReadonlyArray<{ id: string; type: string }>>()
      .notNull()
      .default([]),
    geolocationSetManually: d.boolean(),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    latitude: d.doublePrecision(),
    longitude: d.doublePrecision(),
    name: d.text().notNull(),
    orgId: d.text().notNull(),
    phoneNumber: d.text(),
    state: d.text(),
    status: d
      .text({ enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    street: d.text(),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    timeZone: d.text(),
    timeZoneRaw: d.text(),
    twentyFourHourTime: d.boolean(),
    type: d.text().notNull().default('default'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
    website: d.text(),
    zip: d.text(),
  }),
  (x) => ({
    orgIdIdx: index('campusOrgIdIdx').on(x.orgId),
  }),
)

export const Campus = createSelectSchema(campusesTable)
export type Campus = typeof Campus.Type

export const NewCampus = createInsertSchema(campusesTable)
export type NewCampus = typeof NewCampus.Type
