import { sacramentsTable } from '@openfaith/db'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const SacramentType = Schema.Union(
  Schema.Literal('baptismHolySpirit', 'baptismWater', 'salvation'),
  Schema.String,
)

export class BaseSacrament extends BaseSystemFields.extend<BaseSacrament>('BaseSacrament')({
  _tag: Schema.Literal('sacrament').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  administeredBy: Schema.String.annotations({
    description: 'Person ID who administered the sacrament',
    [OfUiConfig]: {
      field: {
        order: 4,
        type: 'singleCombobox',
      },
      table: {
        order: 4,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  occurredAt: Schema.String.annotations({
    description: 'When the sacrament occurred (ISO date or descriptive text)',
    [OfUiConfig]: {
      field: {
        order: 3,
        type: 'date',
      },
      table: {
        cellType: 'date',
        order: 3,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  receivedBy: Schema.String.annotations({
    description: 'Person ID who received the sacrament',
    [OfUiConfig]: {
      field: {
        order: 5,
        type: 'singleCombobox',
      },
      table: {
        order: 5,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  type: SacramentType.annotations({
    [OfUiConfig]: {
      field: {
        options: [
          { label: 'Salvation', value: 'salvation' },
          { label: 'Baptism (Water)', value: 'baptismWater' },
          { label: 'Baptism (Holy Spirit)', value: 'baptismHolySpirit' },
        ],
        order: 2,
        type: 'singleCombobox',
      },
      table: {
        cellType: 'badge',
        filterable: true,
        order: 2,
        sortable: true,
      },
    },
  }),
}) {}

export class Sacrament extends BaseSacrament.extend<Sacrament>('Sacrament')(
  BaseIdentifiedEntity.fields,
  [
    {
      title: 'sacrament',
      [OfTable]: sacramentsTable,
      [OfUiConfig]: {
        navigation: {
          description: 'Record and manage sacraments (system and custom)',
          enabled: true,
          icon: 'sunIcon',
          module: 'directory',
          order: 6,
          title: 'Sacraments',
        },
      } satisfies FieldConfig,
    },
  ],
) {
  get displayName(): string {
    return `Sacrament: ${this.type}`
  }
}
