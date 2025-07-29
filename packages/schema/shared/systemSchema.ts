import { CustomFieldSchema } from '@openfaith/schema/shared/customFieldsSchema'
import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { Schema } from 'effect'

export const BaseSystemFieldsSchema = Schema.Struct({
  createdAt: Schema.String.annotations({
    description: 'The datetime the record was created',
    [OfUiConfig]: {
      table: {
        cellType: 'datetime',
        order: 10,
        sortable: true,
      },
    } satisfies FieldConfig,
  }),
  createdBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The typeid of the user who created the record',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  customFields: Schema.Array(CustomFieldSchema).annotations({
    description: 'The custom fields for the record',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  deletedAt: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The datetime the record was deleted',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  deletedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The typeid of the user who deleted the record',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  inactivatedAt: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The datetime the record was inactivated',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  inactivatedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The typeid of the user who inactivated the record',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  status: Schema.Literal('active', 'inactive').annotations({
    description: 'The status of the record',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 5,
        sortable: true,
      },
    } satisfies FieldConfig,
  }),
  tags: Schema.Array(Schema.String).annotations({
    description: 'The tags for the record',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  updatedAt: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The datetime the record was updated',
    [OfUiConfig]: {
      table: {
        cellType: 'datetime',
        order: 11,
        sortable: true,
      },
    } satisfies FieldConfig,
  }),
  updatedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The typeid of the user who updated the record',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
})

export const IdentificationFieldsSchema = Schema.Struct({
  externalIds: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.String,
    }),
  ).annotations({
    description: 'The external ids for the record (e.g. PCO, CCB, etc.)',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  id: Schema.String.annotations({
    description: 'The typeid for the record',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  orgId: Schema.String.annotations({
    description: 'The typeid for the organization',
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
})
