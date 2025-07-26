import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoSchoolOptionAttributes = Schema.Struct({
  beginning_grade: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'beginningGrade',
    [OfCustomField]: true,
  }),
  ending_grade: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'endingGrade',
    [OfCustomField]: true,
  }),
  school_types: Schema.Array(Schema.Any).annotations({
    [OfFieldName]: 'schoolTypes',
    [OfCustomField]: true,
  }),
  sequence: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'sequence',
    [OfCustomField]: true,
  }),
  value: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'value',
    [OfCustomField]: true,
  }),
})
export type PcoSchoolOptionAttributes = typeof PcoSchoolOptionAttributes.Type

export const PcoSchoolOption = mkPcoEntity({
  attributes: PcoSchoolOptionAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'SchoolOption',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-school-option' })
export type PcoSchoolOption = typeof PcoSchoolOption.Type
