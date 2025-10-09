import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const campusesTable = pgTable(
  'campuses',
  (d) => ({
    ...dbBaseEntityFields(d, 'campus'),

    avatar: d.text(),
    city: d.text().notNull(),
    country: d.text(),
    description: d.text(),
    latitude: d.doublePrecision(),
    longitude: d.doublePrecision(),
    name: d.text().notNull(),
    state: d.text().notNull(),
    street: d.text().notNull(),
    type: d.text().notNull().default('default'),
    url: d.text(),
    zip: d.text().notNull(),
  }),
  (x) => ({
    orgIdIdx: index('campusOrgIdIdx').on(x.orgId),
  }),
)

export const Campus = createSelectSchema(campusesTable)
export type Campus = typeof Campus.Type

export const NewCampus = createInsertSchema(campusesTable)
export type NewCampus = typeof NewCampus.Type
