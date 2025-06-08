import { adapterDetailsTable, adapterTokenTable } from '@openfaith/db/schema/adaptersSchema'
import {
  invitationsTable,
  orgSettingsTable,
  orgsTable,
  orgUsersTable,
} from '@openfaith/db/schema/orgsSchema'
import { usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const orgsRelations = relations(orgsTable, ({ many, one }) => ({
  adapterDetails: many(adapterDetailsTable),
  adapterTokens: many(adapterTokenTable),
  invitations: many(invitationsTable),
  orgUsers: many(orgUsersTable),
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
  sentInvitations: many(invitationsTable),
  user: one(usersTable, {
    fields: [orgUsersTable.userId],
    references: [usersTable.id],
  }),
}))

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
  inviter: one(usersTable, {
    fields: [invitationsTable.inviterId],
    references: [usersTable.id],
  }),
  inviterOrgUser: one(orgUsersTable, {
    fields: [invitationsTable.inviterId],
    references: [orgUsersTable.userId],
  }),
  org: one(orgsTable, {
    fields: [invitationsTable.orgId],
    references: [orgsTable.id],
  }),
}))

export const orgSettingsRelations = relations(orgSettingsTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [orgSettingsTable.orgId],
    references: [orgsTable.id],
  }),
}))
