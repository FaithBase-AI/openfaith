import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPeopleImportConflictAttributes = Schema.Struct({
  conflicting_changes: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'conflictingChanges',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  data: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'data',
    [OfCustomField]: true,
  }),
  ignore: Schema.Boolean.annotations({
    [OfFieldName]: 'ignore',
    [OfCustomField]: true,
  }),
  kind: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'kind',
    [OfCustomField]: true,
  }),
  message: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'message',
    [OfCustomField]: true,
  }),
  name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'name',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoPeopleImportConflictAttributes = typeof PcoPeopleImportConflictAttributes.Type

export const PcoPeopleImportConflict = mkPcoEntity({
  attributes: PcoPeopleImportConflictAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'PeopleImportConflict',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-people-import-conflict' })
export type PcoPeopleImportConflict = typeof PcoPeopleImportConflict.Type
