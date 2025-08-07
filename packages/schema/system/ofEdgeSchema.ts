import { edgesTable } from '@openfaith/db/schema/modules/edgesSchema'
import { type FieldConfig, OfEntity, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { Schema } from 'effect'

// Custom base class for edges that excludes customFields (which doesn't exist in edges table)
export class BaseEdgeSystemFields extends Schema.Class<BaseEdgeSystemFields>(
  'BaseEdgeSystemFields',
)({
  createdAt: Schema.transform(Schema.Number, Schema.String, {
    decode: (timestamp) => new Date(timestamp).toISOString(),
    encode: (isoString) => new Date(isoString).getTime(),
  }).annotations({
    description: 'The datetime the record was created',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
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
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  deletedAt: Schema.transform(Schema.Number, Schema.String, {
    decode: (timestamp) => new Date(timestamp).toISOString(),
    encode: (isoString) => new Date(isoString).getTime(),
  })
    .pipe(Schema.NullOr, Schema.optional)
    .annotations({
      description: 'The datetime the record was deleted',
      [OfUiConfig]: {
        field: {
          hidden: true,
        },
        table: {
          hidden: true,
        },
      } satisfies FieldConfig,
    }),
  deletedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The typeid of the user who deleted the record',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  orgId: Schema.String.annotations({
    description: 'The organization this record belongs to',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  updatedAt: Schema.transform(Schema.Number, Schema.String, {
    decode: (timestamp) => new Date(timestamp).toISOString(),
    encode: (isoString) => new Date(isoString).getTime(),
  })
    .pipe(Schema.NullOr, Schema.optional)
    .annotations({
      description: 'The datetime the record was last updated',
      [OfUiConfig]: {
        field: {
          hidden: true,
        },
        table: {
          cellType: 'datetime',
          order: 11,
          sortable: true,
        },
      } satisfies FieldConfig,
    }),
  updatedBy: Schema.String.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The typeid of the user who last updated the record',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
}) {}

export class BaseEdge extends BaseEdgeSystemFields.extend<BaseEdge>('BaseEdge')({
  _tag: Schema.Literal('edge').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  metadata: Schema.transform(
    Schema.String,
    Schema.Record({
      key: Schema.String,
      value: Schema.Unknown,
    }),
    {
      decode: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString)
          return typeof parsed === 'object' && parsed !== null ? parsed : {}
        } catch {
          return {}
        }
      },
      encode: (record) => JSON.stringify(record),
    },
  ).annotations({
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

export class Edge extends BaseEdge.extend<Edge>('Edge')({}, [
  {
    [OfEntity]: 'edge',
    [OfTable]: edgesTable,
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
