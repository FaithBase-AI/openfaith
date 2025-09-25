import { fieldOptionsTable, fieldsTable } from '@openfaith/db'
import { type FieldConfig, OfEntity, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export class BaseField extends BaseSystemFields.extend<BaseField>('BaseField')({
  _tag: Schema.Literal('field').annotations({
    [OfUiConfig]: { table: { hidden: true } },
  }),
  description: Schema.String.pipe(Schema.NullOr),
  entityTag: Schema.String.annotations({
    description: 'Entity tag this field belongs to (person, group, etc.)',
    [OfUiConfig]: {
      table: { cellType: 'badge', filterable: true, order: 2, sortable: true },
    },
  }),
  key: Schema.String.annotations({
    description: 'Programmatic field key (e.g., status, assimilationStatus)',
    [OfUiConfig]: {
      table: { filterable: true, order: 0, pinned: 'left', sortable: true },
    },
  }),
  label: Schema.String.annotations({
    description: 'Display label',
    [OfUiConfig]: { table: { order: 1, pinned: 'left', sortable: true } },
  }),
  source: Schema.String.pipe(Schema.NullOr).annotations({
    description: 'Origin of this field (internal, pco, ccb, etc.)',
    [OfUiConfig]: { table: { order: 3, sortable: true } },
  }),
  type: Schema.Literal('singleSelect').annotations({
    [OfUiConfig]: { table: { cellType: 'badge', order: 4 } },
  }),
}) {}

export class Field extends BaseField.extend<Field>('Field')(BaseIdentifiedEntity.fields, [
  {
    [OfEntity]: 'field',
    [OfTable]: fieldsTable,
    [OfUiConfig]: {
      navigation: {
        description: 'Define selectable fields and options for entities',
        enabled: false,
        icon: 'listChecksIcon',
        module: 'system',
        order: 12,
        title: 'Fields',
      },
    } satisfies FieldConfig,
  },
]) {}

export class BaseFieldOption extends BaseSystemFields.extend<BaseFieldOption>('BaseFieldOption')({
  _tag: Schema.Literal('fieldOption').annotations({
    [OfUiConfig]: { table: { hidden: true } },
  }),
  active: Schema.Boolean.annotations({
    [OfUiConfig]: { table: { cellType: 'badge', order: 3 } },
  }),
  fieldId: Schema.String,
  label: Schema.String.annotations({
    [OfUiConfig]: { table: { order: 1, pinned: 'left', sortable: true } },
  }),
  order: Schema.Number.annotations({
    [OfUiConfig]: { table: { order: 2, sortable: true } },
  }),
  pathwayConfig: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }).annotations({
    [OfUiConfig]: { table: { hidden: true } },
  }),
  value: Schema.String.annotations({
    [OfUiConfig]: { table: { order: 0, pinned: 'left', sortable: true } },
  }),
}) {}

export class FieldOption extends BaseFieldOption.extend<FieldOption>('FieldOption')(
  BaseIdentifiedEntity.fields,
  [
    {
      [OfEntity]: 'fieldOption',
      [OfTable]: fieldOptionsTable,
      [OfUiConfig]: {
        navigation: {
          description: 'Manage selectable options for fields',
          enabled: false,
          icon: 'listPlusIcon',
          module: 'system',
          order: 13,
          title: 'Field Options',
        },
      } satisfies FieldConfig,
    },
  ],
) {}
