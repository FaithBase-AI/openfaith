import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoNamePrefixAttributes = Schema.Struct({
  value: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'value',
    [OfCustomField]: true,
  }),
})
export type PcoNamePrefixAttributes = typeof PcoNamePrefixAttributes.Type

export const PcoNamePrefix = mkPcoEntity({
  attributes: PcoNamePrefixAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'NamePrefix',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-name-prefix' })
export type PcoNamePrefix = typeof PcoNamePrefix.Type
