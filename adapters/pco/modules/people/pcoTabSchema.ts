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

export const PcoTabAttributes = Schema.Struct({
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  // Add any other relevant attributes for a PCO Tab
})
export type PcoTabAttributes = typeof PcoTabAttributes.Type

export const pcoTabTransformer = pcoToOf(PcoTabAttributes, BaseFolder, 'tab')

export const pcoTabPartialTransformer = pcoToOf(
  Schema.partial(PcoTabAttributes),
  Schema.partial(BaseFolder),
  'tab',
)

export const PcoTab = mkPcoEntity({
  attributes: PcoTabAttributes,
  links: Schema.Struct({
    field_definitions: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    // Assuming a relationship to field definitions within this tab
    field_definitions: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('FieldDefinition'),
        }),
      ),
    }),
  }),
  type: 'Tab',
}).annotations({
  [OfEntity]: 'folder',
  [OfFolderType]: 'pco_custom_field_tab',
  [OfIdentifier]: 'pco-tab',
  [OfTransformer]: pcoTabTransformer,
  [OfPartialTransformer]: pcoTabPartialTransformer,
})
export type PcoTab = typeof PcoTab.Type
