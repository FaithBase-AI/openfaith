import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoRuleAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  subset: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'subset',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoRuleAttributes = typeof PcoRuleAttributes.Type

export const PcoRule = mkPcoEntity({
  attributes: PcoRuleAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'Rule',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-rule' })
export type PcoRule = typeof PcoRule.Type
