import { adapterTokenTable } from '@openfaith/db/schema/adaptersSchema'
import { invitationsTable, orgUsersTable } from '@openfaith/db/schema/orgsSchema'
import { usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const usersRelations = relations(usersTable, ({ many }) => ({
  adapterTokens: many(adapterTokenTable),
  orgUsers: many(orgUsersTable),
  sentInvitations: many(invitationsTable),
}))
