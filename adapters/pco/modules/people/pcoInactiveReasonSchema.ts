import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoInactiveReasonAttributes = Schema.Struct({
  value: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'value',
    [OfCustomField]: true,
  }),
})
export type PcoInactiveReasonAttributes = typeof PcoInactiveReasonAttributes.Type

export const PcoInactiveReason = mkPcoEntity({
  attributes: PcoInactiveReasonAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'InactiveReason',
}).annotations({ [OfSkipEntity]: true, title: 'pco-inactive-reason' })
export type PcoInactiveReason = typeof PcoInactiveReason.Type
