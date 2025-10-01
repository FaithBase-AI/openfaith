import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoNameSuffixAttributes = Schema.Struct({
  value: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'value',
    [OfCustomField]: true,
  }),
})
export type PcoNameSuffixAttributes = typeof PcoNameSuffixAttributes.Type

export const PcoNameSuffix = mkPcoEntity({
  attributes: PcoNameSuffixAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'NameSuffix',
}).annotations({ [OfSkipEntity]: true, title: 'pco-name-suffix' })
export type PcoNameSuffix = typeof PcoNameSuffix.Type
