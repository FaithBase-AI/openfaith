import { adapterTokenRelations } from '@openfaith/db/schema/adaptersRelations'
import { adapterTokenTable } from '@openfaith/db/schema/adaptersSchema'
import { externalLinksRelations } from '@openfaith/db/schema/modules/externalLinksRelations'
import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { peopleRelations } from '@openfaith/db/schema/modules/peopleRelations'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
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
  externalLinksRelations,
  externalLinksTable,
  invitationsRelations,
  invitationsTable,
  jwksTable,
  orgSettingsRelations,
  orgSettingsTable,
  orgsRelations,
  orgsTable,
  orgUsersRelations,
  orgUsersTable,
  peopleRelations,
  peopleTable,
  usersRelations,
  usersTable,
  verificationsTable,
}
export type Schema = typeof schema
