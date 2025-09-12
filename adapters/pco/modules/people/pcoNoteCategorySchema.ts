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

export const PcoNoteCategoryAttributes = Schema.Struct({
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  // Add any other relevant attributes for a PCO NoteCategory
})
export type PcoNoteCategoryAttributes = typeof PcoNoteCategoryAttributes.Type

export const pcoNoteCategoryTransformer = pcoToOf(
  PcoNoteCategoryAttributes,
  BaseFolder,
  'noteCategory',
)

export const pcoNoteCategoryPartialTransformer = pcoToOf(
  Schema.partial(PcoNoteCategoryAttributes),
  Schema.partial(BaseFolder),
  'noteCategory',
)

export const PcoNoteCategory = mkPcoEntity({
  attributes: PcoNoteCategoryAttributes,
  links: Schema.Struct({
    notes: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    // Assuming a relationship to notes within this category
    notes: Schema.Struct({
      data: Schema.Array(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Note'),
        }),
      ),
    }),
  }),
  type: 'NoteCategory',
}).annotations({
  [OfEntity]: 'folder',
  [OfFolderType]: 'pco_note_category',
  [OfIdentifier]: 'pco-note-category',
  [OfTransformer]: pcoNoteCategoryTransformer,
  [OfPartialTransformer]: pcoNoteCategoryPartialTransformer,
})
export type PcoNoteCategory = typeof PcoNoteCategory.Type
