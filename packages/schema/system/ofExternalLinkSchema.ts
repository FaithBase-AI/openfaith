import { externalLinksTable } from '@openfaith/db/schema/modules/externalLinksSchema'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { TimestampToIsoString } from '@openfaith/shared/date'
import { Schema } from 'effect'

// Custom base class for external links (similar to edges, doesn't need customFields)
export class BaseExternalLinkSystemFields extends Schema.Class<BaseExternalLinkSystemFields>(
  'BaseExternalLinkSystemFields',
)({
  createdAt: TimestampToIsoString.annotations({
    description: 'The datetime the external link was created',
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
  deletedAt: TimestampToIsoString.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The datetime the external link was deleted',
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
    description: 'The entity type that triggered the deletion (e.g., "person", "group")',
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
    description: 'The organization this external link belongs to',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    } satisfies FieldConfig,
  }),
  updatedAt: TimestampToIsoString.pipe(Schema.NullOr, Schema.optional).annotations({
    description: 'The datetime the external link was last updated',
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
}) {}

export class BaseExternalLink extends BaseExternalLinkSystemFields.extend<BaseExternalLink>(
  'BaseExternalLink',
)({
  _tag: Schema.Literal('externalLink').annotations({
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    },
  }),
  adapter: Schema.String.annotations({
    description: 'The external system adapter (e.g., "pco", "ccb", "breeze")',
    [OfUiConfig]: {
      field: {
        order: 1,
      },
      table: {
        cellType: 'badge',
        filterable: true,
        order: 0,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  entityId: Schema.String.annotations({
    description: 'The OpenFaith entity ID being linked',
    [OfUiConfig]: {
      field: {
        order: 3,
      },
      table: {
        filterable: true,
        order: 2,
        sortable: true,
      },
    },
  }),
  entityType: Schema.String.annotations({
    description: 'The type of OpenFaith entity being linked',
    [OfUiConfig]: {
      field: {
        order: 4,
      },
      table: {
        cellType: 'badge',
        filterable: true,
        order: 3,
        sortable: true,
      },
    },
  }),
  externalId: Schema.String.annotations({
    description: 'The ID in the external system',
    [OfUiConfig]: {
      field: {
        order: 2,
      },
      table: {
        filterable: true,
        order: 1,
        sortable: true,
      },
    },
  }),
  lastProcessedAt: TimestampToIsoString.annotations({
    description: 'The datetime when this link was last processed for sync',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        cellType: 'datetime',
        order: 5,
        sortable: true,
      },
    },
  }),
  syncing: Schema.Boolean.annotations({
    description: 'Whether this external link is currently being synced',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        cellType: 'badge',
        filterable: true,
        order: 4,
        sortable: true,
      },
    },
  }),
}) {}

export class ExternalLink extends BaseExternalLink.extend<ExternalLink>('ExternalLink')({}, [
  {
    title: 'externalLink',
    [OfTable]: externalLinksTable,
    [OfUiConfig]: {
      navigation: {
        description: 'Manage external system links and sync tracking',
        enabled: true,
        icon: 'linkIcon',
        module: 'system',
        order: 7,
        title: 'External Links',
      },
    } satisfies FieldConfig,
  },
]) {}
