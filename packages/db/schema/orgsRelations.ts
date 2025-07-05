import { adapterDetailsTable, adapterTokenTable } from '@openfaith/db/schema/adaptersSchema'
import { edgeTable } from '@openfaith/db/schema/modules/edgeSchema'
import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { phoneNumbersTable } from '@openfaith/db/schema/modules/phoneNumbersSchema'
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
  edges: many(edgeTable),
  externalLinks: many(externalLinksTable),
  invitations: many(invitationsTable),
  orgUsers: many(orgUsersTable),
  people: many(peopleTable),
  phoneNumbers: many(phoneNumbersTable),
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
