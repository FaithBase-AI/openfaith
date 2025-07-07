import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFormCategoryAttributes = Schema.Struct({
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
export type PcoFormCategoryAttributes = typeof PcoFormCategoryAttributes.Type

export const PcoFormCategory = mkPcoEntity({
  attributes: PcoFormCategoryAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'FormCategory',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-form-category' })

export type PcoFormCategory = typeof PcoFormCategory.Type
