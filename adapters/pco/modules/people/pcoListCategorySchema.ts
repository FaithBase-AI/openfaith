import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BaseFolder,
  OfEntity,
  OfFieldName,
  OfFolderType,
  OfIdentifier,
  OfPartialTransformer,
  OfTransformer,
} from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoListCategoryAttributes = Schema.Struct({
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  // Add any other relevant attributes for a PCO ListCategory
})
export type PcoListCategoryAttributes = typeof PcoListCategoryAttributes.Type

export const pcoListCategoryTransformer = pcoToOf(
  PcoListCategoryAttributes,
  BaseFolder,
  'listCategory',
)

export const pcoListCategoryPartialTransformer = pcoToOf(
  Schema.partial(PcoListCategoryAttributes),
  Schema.partial(Schema.Struct(BaseFolder.fields)),
  'listCategory',
)

export const PcoListCategory = mkPcoEntity({
  attributes: PcoListCategoryAttributes,
  links: Schema.Struct({
    lists: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    // Assuming a relationship to lists within this category
    lists: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('List'),
        }),
      ),
    }),
  }),
  type: 'ListCategory',
}).annotations({
  [OfEntity]: 'folder',
  [OfFolderType]: 'pco_list_category',
  [OfIdentifier]: 'pco-list-category',
  [OfTransformer]: pcoListCategoryTransformer,
  [OfPartialTransformer]: pcoListCategoryPartialTransformer,
})
export type PcoListCategory = typeof PcoListCategory.Type
