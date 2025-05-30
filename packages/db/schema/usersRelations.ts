import { invitationsTable, orgUsersTable } from '@openfaith/db/schema/orgsSchema'
import { accountsTable, usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  account: one(accountsTable, {
    fields: [usersTable.id],
    references: [accountsTable.userId],
  }),
  orgUsers: many(orgUsersTable),
  sentInvitations: many(invitationsTable),
}))

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}))
