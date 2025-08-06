import { type FieldConfig, OfEntity, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export class BaseEdge extends BaseSystemFields.extend<BaseEdge>('BaseEdge')({
  _tag: Schema.Literal('edge').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  metadata: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }).annotations({
    description:
      'JSONB field to store arbitrary key-value pairs describing the relationship itself',
    [OfUiConfig]: {
      table: {
        order: 5,
        sortable: true,
      },
    },
  }),
  relationshipType: Schema.String.annotations({
    description:
      'A string defining the meaning of the connection (e.g., "member_of", "attended", "suitable_for_group", "mentors")',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 0,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  sourceEntityId: Schema.String.annotations({
    description: 'ID of the starting entity of the relationship',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 1,
        sortable: true,
      },
    },
  }),
  sourceEntityTypeTag: Schema.String.annotations({
    description: 'The _tag of the source entity (e.g., "person", "group")',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 2,
        sortable: true,
      },
    },
  }),
  targetEntityId: Schema.String.annotations({
    description: 'ID of the ending entity of the relationship',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 3,
        sortable: true,
      },
    },
  }),
  targetEntityTypeTag: Schema.String.annotations({
    description: 'The _tag of the target entity (e.g., "person", "group")',
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

export class Edge extends BaseEdge.extend<Edge>('Edge')(BaseIdentifiedEntity.fields, [
  {
    [OfEntity]: 'edge',
    [OfUiConfig]: {
      navigation: {
        description: 'Manage entity relationships and connections',
        enabled: true,
        icon: 'linkIcon',
        module: 'system',
        order: 6,
        title: 'Edges',
      },
    } satisfies FieldConfig,
  },
]) {}
