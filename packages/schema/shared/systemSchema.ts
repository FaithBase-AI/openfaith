import { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { Schema } from 'effect'

export const BaseSystemFieldsSchema = Schema.Struct({
  createdAt: Schema.String.annotations({
    description: 'The datetime the record was created',
  }),
  createdBy: Schema.String.annotations({
    description: 'The typeid of the user who created the record',
  }).pipe(Schema.NullOr, Schema.optional),
  customFields: Schema.Array(CustomFieldSchema).annotations({
    description: 'The custom fields for the record',
  }),
  deletedAt: Schema.String.annotations({
    description: 'The datetime the record was deleted',
  }).pipe(Schema.NullOr, Schema.optional),
  deletedBy: Schema.String.annotations({
    description: 'The typeid of the user who deleted the record',
  }).pipe(Schema.NullOr, Schema.optional),
  inactivatedAt: Schema.String.annotations({
    description: 'The datetime the record was inactivated',
  }).pipe(Schema.NullOr, Schema.optional),
  inactivatedBy: Schema.String.annotations({
    description: 'The typeid of the user who inactivated the record',
  }).pipe(Schema.NullOr, Schema.optional),
  status: Schema.Literal('active', 'inactive').annotations({
    description: 'The status of the record',
  }),
  tags: Schema.Array(Schema.String).annotations({
    description: 'The tags for the record',
  }),
  updatedAt: Schema.String.annotations({
    description: 'The datetime the record was updated',
  }).pipe(Schema.NullOr, Schema.optional),
  updatedBy: Schema.String.annotations({
    description: 'The typeid of the user who updated the record',
  }).pipe(Schema.NullOr, Schema.optional),
})

export const IdentificationFieldsSchema = Schema.Struct({
  externalIds: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.String,
    }),
  ).annotations({
    description: 'The external ids for the record (e.g. PCO, CCB, etc.)',
  }),
  id: Schema.String.annotations({
    description: 'The typeid for the record',
  }),
  orgId: Schema.String.annotations({
    description: 'The typeid for the organization',
  }),
})
