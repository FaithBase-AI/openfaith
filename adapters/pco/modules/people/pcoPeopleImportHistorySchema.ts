import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPeopleImportHistoryAttributes = Schema.Struct({
  conflicting_changes: Schema.NullOr(Schema.Any).annotations({
    [OfFieldName]: 'conflictingChanges',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  kind: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'kind',
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
export type PcoPeopleImportHistoryAttributes = typeof PcoPeopleImportHistoryAttributes.Type

export const PcoPeopleImportHistory = mkPcoEntity({
  attributes: PcoPeopleImportHistoryAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'PeopleImportHistory',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-people-import-history' })
export type PcoPeopleImportHistory = typeof PcoPeopleImportHistory.Type
