import { qualificationsTable } from '@openfaith/db'
import { type FieldConfig, OfEntity, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export class BaseQualification extends BaseSystemFields.extend<BaseQualification>(
  'BaseQualification',
)({
  _tag: Schema.Literal('qualification').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  description: Schema.String.pipe(Schema.NullOr).annotations({
    description: 'Optional description',
    [OfUiConfig]: { table: { order: 2, sortable: true } },
  }),
  key: Schema.String.annotations({
    description: 'Stable key within org (e.g., membership, freedom_class)',
    [OfUiConfig]: {
      table: { filterable: true, order: 0, pinned: 'left', sortable: true },
    },
  }),
  name: Schema.String.annotations({
    description: 'Human friendly name',
    [OfUiConfig]: {
      table: { filterable: true, order: 1, pinned: 'left', sortable: true },
    },
  }),
}) {}

export class Qualification extends BaseQualification.extend<Qualification>('Qualification')(
  BaseIdentifiedEntity.fields,
  [
    {
      [OfEntity]: 'qualification',
      [OfTable]: qualificationsTable,
      [OfUiConfig]: {
        navigation: {
          description: 'Define achievements/awards used for gating (e.g., Membership)',
          enabled: false,
          icon: 'badgeCheckIcon',
          module: 'domain',
          order: 11,
          title: 'Qualifications',
        },
      } satisfies FieldConfig,
    },
  ],
) {}
