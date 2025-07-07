import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoListStarAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
})
export type PcoListStarAttributes = typeof PcoListStarAttributes.Type

export const PcoListStar = mkPcoEntity({
  attributes: PcoListStarAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({}),
  type: 'ListStar',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-list-star' })
export type PcoListStar = typeof PcoListStar.Type
