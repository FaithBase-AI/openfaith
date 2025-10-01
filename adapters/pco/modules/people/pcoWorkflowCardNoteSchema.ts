import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoWorkflowCardNoteAttributes = Schema.Struct({
  created_at: Schema.String.annotations({ [OfFieldName]: 'createdAt' }),
  note: Schema.String.annotations({ [OfFieldName]: 'note' }),
})
export type PcoWorkflowCardNoteAttributes = typeof PcoWorkflowCardNoteAttributes.Type

export const PcoWorkflowCardNote = mkPcoEntity({
  attributes: PcoWorkflowCardNoteAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    note_category: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('NoteCategory'),
        }),
      ),
    }),
  }),
  type: 'WorkflowCardNote',
}).annotations({
  [OfSkipEntity]: true,
  title: 'pco-workflow-card-note',
})
export type PcoWorkflowCardNote = typeof PcoWorkflowCardNote.Type
