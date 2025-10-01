import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

//     "note": "string",
// "created_at": "2000-01-01T12:00:00Z",
// "updated_at": "2000-01-01T12:00:00Z",
// "display_date": "2000-01-01T12:00:00Z",
// "note_category_id": "primary_key",
// "organization_id": "primary_key",
// "person_id": "primary_key",
// "created_by_id": "primary_key"
export const PcoNoteAttributes = Schema.Struct({
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  created_by_id: Schema.String.annotations({
    [OfFieldName]: 'createdById',
  }),
  display_date: Schema.String.annotations({
    [OfFieldName]: 'displayDate',
  }),
  note: Schema.String.annotations({
    [OfFieldName]: 'note',
  }),
  note_category_id: Schema.String.annotations({
    [OfFieldName]: 'noteCategoryId',
  }),
  organization_id: Schema.String.annotations({
    [OfFieldName]: 'organizationId',
  }),
  person_id: Schema.String.annotations({
    [OfFieldName]: 'personId',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
})
export type PcoNoteAttributes = typeof PcoNoteAttributes.Type

export const PcoNote = mkPcoEntity({
  attributes: PcoNoteAttributes,
  links: Schema.Struct({
    category: Schema.optional(Schema.NullOr(Schema.String)),
    person: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    category: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('NoteCategory'),
        }),
      ),
    }),
    person: Schema.Struct({
      data: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('Person'),
      }),
    }),
  }),
  type: 'Note',
}).annotations({ [OfSkipEntity]: true, title: 'pco-note' })
export type PcoNote = typeof PcoNote.Type
