import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoCarrierAttributes = Schema.Struct({
  international: Schema.Boolean.annotations({
    [OfFieldName]: 'international',
    [OfCustomField]: true,
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
    [OfCustomField]: true,
  }),
  value: Schema.String.annotations({
    [OfFieldName]: 'value',
    [OfCustomField]: true,
  }),
})
export type PcoCarrierAttributes = typeof PcoCarrierAttributes.Type

export const PcoCarrier = mkPcoEntity({
  attributes: PcoCarrierAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'Carrier',
}).annotations({ [OfSkipEntity]: true, title: 'pco-carrier' })
export type PcoCarrier = typeof PcoCarrier.Type
