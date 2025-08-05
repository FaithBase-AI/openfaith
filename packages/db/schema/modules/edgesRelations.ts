import { addressesTable } from '@openfaith/db/schema/modules/addressSchema'
import { campusesTable } from '@openfaith/db/schema/modules/campusesSchema'
import { edgesTable, entityRelationshipsTable } from '@openfaith/db/schema/modules/edgesSchema'
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
    relationName: 'AddressSourceEdges',
  }),
  sourceCampus: one(campusesTable, {
    fields: [edgesTable.sourceEntityId],
    references: [campusesTable.id],
    relationName: 'CampusSourceEdges',
  }),
  sourceFolder: one(foldersTable, {
    fields: [edgesTable.sourceEntityId],
    references: [foldersTable.id],
    relationName: 'FolderSourceEdges',
  }),
  sourceOrg: one(orgsTable, {
    fields: [edgesTable.sourceEntityId],
    references: [orgsTable.id],
    relationName: 'OrgSourceEdges',
  }),
  sourcePerson: one(peopleTable, {
    fields: [edgesTable.sourceEntityId],
    references: [peopleTable.id],
    relationName: 'PersonSourceEdges',
  }),
  sourcePhoneNumber: one(phoneNumbersTable, {
    fields: [edgesTable.sourceEntityId],
    references: [phoneNumbersTable.id],
    relationName: 'PhoneNumberSourceEdges',
  }),
  sourceUser: one(usersTable, {
    fields: [edgesTable.sourceEntityId],
    references: [usersTable.id],
    relationName: 'UserSourceEdges',
  }),

  // Target entity relations
  targetAddress: one(addressesTable, {
    fields: [edgesTable.targetEntityId],
    references: [addressesTable.id],
    relationName: 'AddressTargetEdges',
  }),
  targetCampus: one(campusesTable, {
    fields: [edgesTable.targetEntityId],
    references: [campusesTable.id],
    relationName: 'CampusTargetEdges',
  }),
  targetFolder: one(foldersTable, {
    fields: [edgesTable.targetEntityId],
    references: [foldersTable.id],
    relationName: 'FolderTargetEdges',
  }),
  targetOrg: one(orgsTable, {
    fields: [edgesTable.targetEntityId],
    references: [orgsTable.id],
    relationName: 'OrgTargetEdges',
  }),
  targetPerson: one(peopleTable, {
    fields: [edgesTable.targetEntityId],
    references: [peopleTable.id],
    relationName: 'PersonTargetEdges',
  }),
  targetPhoneNumber: one(phoneNumbersTable, {
    fields: [edgesTable.targetEntityId],
    references: [phoneNumbersTable.id],
    relationName: 'PhoneNumberTargetEdges',
  }),
  targetUser: one(usersTable, {
    fields: [edgesTable.targetEntityId],
    references: [usersTable.id],
    relationName: 'UserTargetEdges',
  }),
}))

export const entityRelationshipsRelations = relations(entityRelationshipsTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [entityRelationshipsTable.orgId],
    references: [orgsTable.id],
  }),
}))
