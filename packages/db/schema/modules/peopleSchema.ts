import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import type { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { index } from 'drizzle-orm/pg-core'

export const peopleTable = pgTable(
  'people',
  (d) => ({
    _tag: d
      .char({ enum: ['person'], length: 6 })
      .default('person')
      .notNull(),
    anniversary: d.text(),
    avatar: d.text(),
    birthdate: d.text(),
    createdAt: d.timestamp().notNull(),
    createdBy: d.text(),
    customFields: d.jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
    deletedAt: d.timestamp(),
    deletedBy: d.text(),
    gender: d.text({ enum: ['male', 'female'] }),
    id: d.text().primaryKey(),
    inactivatedAt: d.timestamp(),
    inactivatedBy: d.text(),
    lastName: d.text(),
    membership: d.text(),
    middleName: d.text(),
    name: d.text(),
    orgId: d.text().notNull(),
    status: d.text({ enum: ['active', 'inactive'] }).notNull(),
    tags: d.jsonb().$type<ReadonlyArray<string>>().notNull().default([]),
    type: d.text().notNull().default('default'),
    updatedAt: d.timestamp(),
    updatedBy: d.text(),
  }),
  (x) => ({
    orgIdIdx: index('peopleOrgIdIdx').on(x.orgId),
  }),
)

export const Person = createSelectSchema(peopleTable)
export type Person = typeof Person.Type

export const NewPerson = createInsertSchema(peopleTable)
export type NewPerson = typeof NewPerson.Type
