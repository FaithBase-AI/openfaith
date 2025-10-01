import { type FieldConfig, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export class BaseFolder extends BaseSystemFields.extend<BaseFolder>('BaseFolder')({
  _tag: Schema.Literal('folder').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  color: Schema.String.annotations({
    description: 'Color hint for UI display of the folder',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        order: 3,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  description: Schema.String.annotations({
    description: "Optional longer description of the folder's purpose",
    [OfUiConfig]: {
      table: {
        order: 2,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  folderType: Schema.String.annotations({
    description:
      'User-defined or application-defined semantic meaning for this folder (e.g., "service_type", "group_category", "document_library")',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 5,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  icon: Schema.String.annotations({
    description: 'Icon hint for UI display of the folder',
    [OfUiConfig]: {
      table: {
        order: 0,
        width: 60,
      },
    },
  }).pipe(Schema.NullOr),
  name: Schema.String.annotations({
    description: 'The display name of the folder',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 1,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  orderingKey: Schema.String.annotations({
    description:
      'Optional manual sorting key for folders within the same parent or items within this folder',
    [OfUiConfig]: {
      table: {
        order: 6,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  parentFolderId: Schema.String.annotations({
    description:
      'Foreign key to parent folder ID. If null, this is a root-level folder. If populated, creates a hierarchy.',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 4,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
}) {}

export class Folder extends BaseFolder.extend<Folder>('Folder')(BaseIdentifiedEntity.fields, [
  {
    [OfUiConfig]: {
      navigation: {
        description: 'Organize content with hierarchical folders',
        enabled: true,
        icon: 'folderPlusIcon',
        module: 'collection',
        order: 3,
        title: 'Folders',
      },
    } satisfies FieldConfig,
    title: 'Folder',
  },
]) {}
