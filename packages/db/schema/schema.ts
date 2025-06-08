import { adapterTokenRelations } from '@openfaith/db/schema/adaptersRelations'
import { adapterTokenTable } from '@openfaith/db/schema/adaptersSchema'
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
import { jwksTable, usersTable, verificationsTable } from '@openfaith/db/schema/usersSchema'

export const schema = {
  adapterTokenRelations,
  adapterTokenTable,
  invitationsRelations,
  invitationsTable,
  jwksTable,
  orgSettingsRelations,
  orgSettingsTable,
  orgsRelations,
  orgsTable,
  orgUsersRelations,
  orgUsersTable,
  usersRelations,
  usersTable,
  verificationsTable,
}
export type Schema = typeof schema
