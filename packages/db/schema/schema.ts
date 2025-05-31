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
import { usersRelations } from '@openfaith/db/schema/usersRelations'
import { usersTable } from '@openfaith/db/schema/usersSchema'

export const schema = {
  orgsRelations,
  orgUsersRelations,
  invitationsRelations,
  orgSettingsRelations,
  usersRelations,
  usersTable,
  orgsTable,
  orgUsersTable,
  invitationsTable,
  orgSettingsTable,
}
export type Schema = typeof schema
