import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoReportAttributes = Schema.Struct({
  body: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'body',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
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
export type PcoReportAttributes = typeof PcoReportAttributes.Type

export const PcoReport = mkPcoEntity({
  attributes: PcoReportAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'Report',
}).annotations({ [OfSkipEntity]: true, title: 'pco-report' })
export type PcoReport = typeof PcoReport.Type
