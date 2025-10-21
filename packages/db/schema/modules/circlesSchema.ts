import { pgTable } from '@openfaith/db/_table'
import { createInsertSchema, createSelectSchema } from '@openfaith/db/drizzleEffect'
import { dbBaseEntityFields } from '@openfaith/db/schema/shared/dbSystemFields'
import { index } from 'drizzle-orm/pg-core'

export const circlesTable = pgTable(
  'circles',
  (d) => ({
    ...dbBaseEntityFields(d, 'circle'),

    avatar: d.text(),
    description: d.text(),
    name: d.text().notNull(),
    type: d.text().notNull().$type<'group' | 'team'>(),
  }),
  (x) => [index('circleOrgIdIdx').on(x.orgId)],
)

export const Circle = createSelectSchema(circlesTable)
export type Circle = typeof Circle.Type

export const NewCircle = createInsertSchema(circlesTable)
export type NewCircle = typeof NewCircle.Type
