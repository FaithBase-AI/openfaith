import { adapterTokenRelations } from '@openfaith/db/schema/adaptersRelations'
import { adapterTokensTable } from '@openfaith/db/schema/adaptersSchema'
import { edgeRelations } from '@openfaith/db/schema/modules/edgesRelations'
import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { externalLinksRelations } from '@openfaith/db/schema/modules/externalLinksRelations'
import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { folderRelations } from '@openfaith/db/schema/modules/foldersRelations'
import { foldersTable } from '@openfaith/db/schema/modules/foldersSchema'
import { peopleRelations } from '@openfaith/db/schema/modules/peopleRelations'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { phoneNumbersRelations } from '@openfaith/db/schema/modules/phoneNumbersRelations'
import { phoneNumbersTable } from '@openfaith/db/schema/modules/phoneNumbersSchema'
import { sacramentsRelations } from '@openfaith/db/schema/modules/sacramentsRelations'
import { sacramentsTable } from '@openfaith/db/schema/modules/sacramentsSchema'
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
  adapterTokenTable: adapterTokensTable,
  edgeRelations,
  edgeTable: edgesTable,
  externalLinksRelations,
  externalLinksTable,
  folderRelations,
  folderTable: foldersTable,
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
  phoneNumbersRelations,
  phoneNumbersTable,
  sacramentsRelations,
  sacramentsTable,
  usersRelations,
  usersTable,
  verificationsTable,
}
export type Schema = typeof schema
