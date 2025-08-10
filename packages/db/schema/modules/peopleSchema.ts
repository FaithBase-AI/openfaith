import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const peopleTable = pgTable(
  'people',
  (d) => ({
    ...dbBaseEntityFields(d, 'person'),

    anniversary: d.text(),
    avatar: d.text(),
    birthdate: d.text(),
    firstName: d.text(),
    gender: d.text({ enum: ['male', 'female'] }),
    lastName: d.text(),
    membership: d.text(),
    middleName: d.text(),
    name: d.text(),
    type: d.text().notNull().default('default'),
  }),
  (x) => [index('peopleOrgIdIdx').on(x.orgId)],
)

export const Person = createSelectSchema(peopleTable)
export type Person = typeof Person.Type

export const NewPerson = createInsertSchema(peopleTable)
export type NewPerson = typeof NewPerson.Type
