import {
  invitationsTable,
  orgSettingsTable,
  orgsTable,
  orgUsersTable,
} from '@openfaith/db/schema/orgsSchema'
import { usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const orgsRelations = relations(orgsTable, ({ many, one }) => ({
  orgUsers: many(orgUsersTable),
  invitations: many(invitationsTable),
  settings: one(orgSettingsTable, {
    fields: [orgsTable.id],
    references: [orgSettingsTable.orgId],
  }),
}))

export const orgUsersRelations = relations(orgUsersTable, ({ one, many }) => ({
  org: one(orgsTable, {
    fields: [orgUsersTable.orgId],
    references: [orgsTable.id],
  }),
  user: one(usersTable, {
    fields: [orgUsersTable.userId],
    references: [usersTable.id],
  }),
  sentInvitations: many(invitationsTable),
}))

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [invitationsTable.orgId],
    references: [orgsTable.id],
  }),
  inviter: one(usersTable, {
    fields: [invitationsTable.inviterId],
    references: [usersTable.id],
  }),
  inviterOrgUser: one(orgUsersTable, {
    fields: [invitationsTable.inviterId],
    references: [orgUsersTable.userId],
  }),
}))

export const orgSettingsRelations = relations(orgSettingsTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [orgSettingsTable.orgId],
    references: [orgsTable.id],
  }),
}))
