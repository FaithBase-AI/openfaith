import {
  invitationsRelations,
  orgSettingsRelations,
  orgsRelations,
  orgUsersRelations,
} from '@openfaith/db/schema/orgsRelations'
import {
  invitationsTable,
  orgSettingsTable,
  orgsTable,
  orgUsersTable,
} from '@openfaith/db/schema/orgsSchema'
import { accountsRelations, usersRelations } from '@openfaith/db/schema/usersRelations'
import {
  accountsTable,
  jwksTable,
  usersTable,
  verificationsTable,
} from '@openfaith/db/schema/usersSchema'

export const schema = {
  orgsRelations,
  orgUsersRelations,
  invitationsRelations,
  orgSettingsRelations,
  usersRelations,
  accountsRelations,
  usersTable,
  accountsTable,
  verificationsTable,
  jwksTable,
  orgsTable,
  orgUsersTable,
  invitationsTable,
  orgSettingsTable,
}
export type Schema = typeof schema
