import { addressesTable } from '@openfaith/db/schema/modules/addressSchema'
import { campusesTable } from '@openfaith/db/schema/modules/campusesSchema'
import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { foldersTable } from '@openfaith/db/schema/modules/foldersSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { phoneNumbersTable } from '@openfaith/db/schema/modules/phoneNumbersSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const edgeRelations = relations(edgesTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [edgesTable.orgId],
    references: [orgsTable.id],
  }),

  // Source entity relations
  sourceAddress: one(addressesTable, {
    fields: [edgesTable.sourceEntityId],
    references: [addressesTable.id],
  }),
  sourceCampus: one(campusesTable, {
    fields: [edgesTable.sourceEntityId],
    references: [campusesTable.id],
  }),
  sourceFolder: one(foldersTable, {
    fields: [edgesTable.sourceEntityId],
    references: [foldersTable.id],
  }),
  sourceOrg: one(orgsTable, {
    fields: [edgesTable.sourceEntityId],
    references: [orgsTable.id],
  }),
  sourcePerson: one(peopleTable, {
    fields: [edgesTable.sourceEntityId],
    references: [peopleTable.id],
  }),
  sourcePhoneNumber: one(phoneNumbersTable, {
    fields: [edgesTable.sourceEntityId],
    references: [phoneNumbersTable.id],
  }),
  sourceUser: one(usersTable, {
    fields: [edgesTable.sourceEntityId],
    references: [usersTable.id],
  }),

  // Target entity relations
  targetAddress: one(addressesTable, {
    fields: [edgesTable.targetEntityId],
    references: [addressesTable.id],
  }),
  targetCampus: one(campusesTable, {
    fields: [edgesTable.targetEntityId],
    references: [campusesTable.id],
  }),
  targetFolder: one(foldersTable, {
    fields: [edgesTable.targetEntityId],
    references: [foldersTable.id],
  }),
  targetOrg: one(orgsTable, {
    fields: [edgesTable.targetEntityId],
    references: [orgsTable.id],
  }),
  targetPerson: one(peopleTable, {
    fields: [edgesTable.targetEntityId],
    references: [peopleTable.id],
  }),
  targetPhoneNumber: one(phoneNumbersTable, {
    fields: [edgesTable.targetEntityId],
    references: [phoneNumbersTable.id],
  }),
  targetUser: one(usersTable, {
    fields: [edgesTable.targetEntityId],
    references: [usersTable.id],
  }),
}))
