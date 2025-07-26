import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoMaritalStatusAttributes = Schema.Struct({
  value: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'value',
    [OfCustomField]: true,
  }),
})
export type PcoMaritalStatusAttributes = typeof PcoMaritalStatusAttributes.Type

export const PcoMaritalStatus = mkPcoEntity({
  attributes: PcoMaritalStatusAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'MaritalStatus',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-marital-status' })
export type PcoMaritalStatus = typeof PcoMaritalStatus.Type
