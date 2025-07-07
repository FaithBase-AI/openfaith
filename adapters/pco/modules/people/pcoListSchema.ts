import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { BaseFolder, OfEntity, OfFieldName } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoListAttributes = Schema.Struct({
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  // Add any other relevant attributes for a PCO List
})
export type PcoListAttributes = typeof PcoListAttributes.Type

export const pcoListTransformer = pcoToOf(PcoListAttributes, BaseFolder, 'list')

export const PcoList = mkPcoEntity({
  attributes: PcoListAttributes,
  links: Schema.Struct({
    people: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    // Assuming a relationship to people in the list
    people: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'List',
}).annotations({ [OfEntity]: 'folder', folderType: 'pco_list', identifier: 'pco-list' })
export type PcoList = typeof PcoList.Type
