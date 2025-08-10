import { fieldOptionsTable, fieldsTable } from '@openfaith/db/schema/modules/fieldsSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { relations } from 'drizzle-orm'

export const fieldRelations = relations(fieldsTable, ({ one, many }) => ({
  options: many(fieldOptionsTable),
  org: one(orgsTable, {
    fields: [fieldsTable.orgId],
    references: [orgsTable.id],
  }),
}))

export const fieldOptionRelations = relations(fieldOptionsTable, ({ one }) => ({
  field: one(fieldsTable, {
    fields: [fieldOptionsTable.fieldId],
    references: [fieldsTable.id],
  }),
  org: one(orgsTable, {
    fields: [fieldOptionsTable.orgId],
    references: [orgsTable.id],
  }),
}))
