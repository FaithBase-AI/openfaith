import { addressesTable } from '@openfaith/db/schema/modules/addressSchema'
import { campusesTable } from '@openfaith/db/schema/modules/campusesSchema'
import { circlesTable } from '@openfaith/db/schema/modules/circlesSchema'
import { edgesTable, entityRelationshipsTable } from '@openfaith/db/schema/modules/edgesSchema'
import { emailsTable } from '@openfaith/db/schema/modules/emailsSchema'
import { fieldOptionsTable } from '@openfaith/db/schema/modules/fieldsSchema'
import { foldersTable } from '@openfaith/db/schema/modules/foldersSchema'
import { journeysTable, pathwaysTable } from '@openfaith/db/schema/modules/pathwaysSchema'
import { peopleTable } from '@openfaith/db/schema/modules/peopleSchema'
import { phoneNumbersTable } from '@openfaith/db/schema/modules/phoneNumbersSchema'
import { qualificationsTable } from '@openfaith/db/schema/modules/qualificationsSchema'
import { sacramentsTable } from '@openfaith/db/schema/modules/sacramentsSchema'
import { orgsTable } from '@openfaith/db/schema/orgsSchema'
import { usersTable } from '@openfaith/db/schema/usersSchema'
import { relations } from 'drizzle-orm'

export const edgeRelations = relations(edgesTable, ({ one }) => ({
  org: one(orgsTable, {
    fields: [edgesTable.orgId],
    references: [orgsTable.id],
    relationName: 'OrgEdges',
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
  sourceCircle: one(circlesTable, {
    fields: [edgesTable.sourceEntityId],
    references: [circlesTable.id],
    relationName: 'CircleSourceEdges',
  }),
  sourceEmail: one(emailsTable, {
    fields: [edgesTable.sourceEntityId],
    references: [emailsTable.id],
    relationName: 'EmailSourceEdges',
  }),
  sourceFieldOption: one(fieldOptionsTable, {
    fields: [edgesTable.sourceEntityId],
    references: [fieldOptionsTable.id],
    relationName: 'FieldOptionSourceEdges',
  }),
  sourceFolder: one(foldersTable, {
    fields: [edgesTable.sourceEntityId],
    references: [foldersTable.id],
    relationName: 'FolderSourceEdges',
  }),
  sourceJourney: one(journeysTable, {
    fields: [edgesTable.sourceEntityId],
    references: [journeysTable.id],
    relationName: 'JourneySourceEdges',
  }),
  sourceOrg: one(orgsTable, {
    fields: [edgesTable.sourceEntityId],
    references: [orgsTable.id],
    relationName: 'OrgSourceEdges',
  }),
  sourcePathway: one(pathwaysTable, {
    fields: [edgesTable.sourceEntityId],
    references: [pathwaysTable.id],
    relationName: 'PathwaySourceEdges',
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
  sourceQualification: one(qualificationsTable, {
    fields: [edgesTable.sourceEntityId],
    references: [qualificationsTable.id],
    relationName: 'QualificationSourceEdges',
  }),
  sourceSacrament: one(sacramentsTable, {
    fields: [edgesTable.sourceEntityId],
    references: [sacramentsTable.id],
    relationName: 'SacramentSourceEdges',
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
  targetCircle: one(circlesTable, {
    fields: [edgesTable.targetEntityId],
    references: [circlesTable.id],
    relationName: 'CircleTargetEdges',
  }),
  targetEmail: one(emailsTable, {
    fields: [edgesTable.targetEntityId],
    references: [emailsTable.id],
    relationName: 'EmailTargetEdges',
  }),
  targetFieldOption: one(fieldOptionsTable, {
    fields: [edgesTable.targetEntityId],
    references: [fieldOptionsTable.id],
    relationName: 'FieldOptionTargetEdges',
  }),
  targetFolder: one(foldersTable, {
    fields: [edgesTable.targetEntityId],
    references: [foldersTable.id],
    relationName: 'FolderTargetEdges',
  }),
  targetJourney: one(journeysTable, {
    fields: [edgesTable.targetEntityId],
    references: [journeysTable.id],
    relationName: 'JourneyTargetEdges',
  }),
  targetOrg: one(orgsTable, {
    fields: [edgesTable.targetEntityId],
    references: [orgsTable.id],
    relationName: 'OrgTargetEdges',
  }),
  targetPathway: one(pathwaysTable, {
    fields: [edgesTable.targetEntityId],
    references: [pathwaysTable.id],
    relationName: 'PathwayTargetEdges',
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
  targetQualification: one(qualificationsTable, {
    fields: [edgesTable.targetEntityId],
    references: [qualificationsTable.id],
    relationName: 'QualificationTargetEdges',
  }),
  targetSacrament: one(sacramentsTable, {
    fields: [edgesTable.targetEntityId],
    references: [sacramentsTable.id],
    relationName: 'SacramentTargetEdges',
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
