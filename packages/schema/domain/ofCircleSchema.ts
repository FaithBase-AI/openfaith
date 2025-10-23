import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export class BaseCircle extends BaseSystemFields.extend<BaseCircle>('BaseCircle')({
  _tag: Schema.Literal('circle').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  avatar: Schema.String.annotations({
    description: 'Avatar image URL for the circle',
    [OfUiConfig]: {
      table: {
        order: 0,
        width: 60,
      },
    },
  }).pipe(Schema.NullOr, Schema.optional),
  description: Schema.String.annotations({
    description: "Optional longer description of the circle's purpose and activities",
    [OfUiConfig]: {
      table: {
        order: 2,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr, Schema.optional),
  name: Schema.String.annotations({
    description: 'The display name of the circle',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 1,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  type: Schema.Union(Schema.Literal('group', 'team'), Schema.String).annotations({
    description:
      'The type of circle: "group" for fellowship-oriented circles (e.g., small groups, life groups), "team" for function-oriented circles (e.g., service teams, ministry teams)',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 4,
        sortable: true,
      },
    },
  }),
}) {}

export class Circle extends BaseCircle.extend<Circle>('Circle')(BaseIdentifiedEntity.fields, [
  {
    [OfUiConfig]: {
      navigation: {
        description: 'Manage groups and teams of people',
        enabled: true,
        icon: 'usersIcon',
        module: 'domain',
        order: 1,
        title: 'Circles',
      },
    } satisfies FieldConfig,
    title: 'Circle',
  },
]) {}
