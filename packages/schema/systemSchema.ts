import { Schema } from 'effect'
import { CustomFieldSchema } from './customFieldsSchema'

export const BaseSystemFieldsSchema = Schema.Struct({
  customFields: Schema.Array(CustomFieldSchema).annotations({
    description: 'The custom fields for the record',
  }),
  externalIds: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.String,
    }),
  ).annotations({
    description: 'The external ids for the record (e.g. PCO, CCB, etc.)',
  }),
  createdAt: Schema.String.annotations({
    description: 'The datetime the record was created',
  }),
  createdBy: Schema.String.annotations({
    description: 'The typeid of the user who created the record',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  updatedAt: Schema.String.annotations({
    description: 'The datetime the record was updated',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  updatedBy: Schema.String.annotations({
    description: 'The typeid of the user who updated the record',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  deletedAt: Schema.String.annotations({
    description: 'The datetime the record was deleted',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  deletedBy: Schema.String.annotations({
    description: 'The typeid of the user who deleted the record',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  status: Schema.Literal('active', 'inactive').annotations({
    description: 'The status of the record',
  }),
  tags: Schema.Array(Schema.String).annotations({
    description: 'The tags for the record',
  }),
})

export const IdentificationFieldsSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: 'The typeid for the record',
  }),
  orgId: Schema.String.annotations({
    description: 'The typeid for the organization',
  }),
})
