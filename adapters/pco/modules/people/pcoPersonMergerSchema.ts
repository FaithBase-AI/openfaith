import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPersonMergerAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  person_to_keep_id: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'personToKeepId',
    [OfCustomField]: true,
  }),
  person_to_remove_id: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'personToRemoveId',
    [OfCustomField]: true,
  }),
})
export type PcoPersonMergerAttributes = typeof PcoPersonMergerAttributes.Type

export const PcoPersonMerger = mkPcoEntity({
  attributes: PcoPersonMergerAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    person_to_keep: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
    person_to_remove: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'PersonMerger',
}).annotations({ [OfSkipEntity]: true, identifier: 'pco-person-merger' })
export type PcoPersonMerger = typeof PcoPersonMerger.Type
