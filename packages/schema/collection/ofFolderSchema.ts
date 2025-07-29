import { type FieldConfig, OfEntity, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseFolder = BaseSystemFieldsSchema.pipe(
  Schema.extend(
    Schema.Struct({
      _tag: Schema.Literal('folder'),
      color: Schema.String.annotations({
        description: 'Color hint for UI display of the folder',
      }).pipe(Schema.NullOr),
      description: Schema.String.annotations({
        description: "Optional longer description of the folder's purpose",
      }).pipe(Schema.NullOr),
      folderType: Schema.String.annotations({
        description:
          'User-defined or application-defined semantic meaning for this folder (e.g., "service_type", "group_category", "document_library")',
      }).pipe(Schema.NullOr),
      icon: Schema.String.annotations({
        description: 'Icon hint for UI display of the folder',
      }).pipe(Schema.NullOr),
      name: Schema.String.annotations({
        description: 'The display name of the folder',
      }),
      orderingKey: Schema.String.annotations({
        description:
          'Optional manual sorting key for folders within the same parent or items within this folder',
      }).pipe(Schema.NullOr),
      parentFolderId: Schema.String.annotations({
        description:
          'Foreign key to parent folder ID. If null, this is a root-level folder. If populated, creates a hierarchy.',
      }).pipe(Schema.NullOr),
    }),
  ),
)
export type BaseFolder = typeof BaseFolder.Type

export const Folder = BaseFolder.pipe(Schema.extend(IdentificationFieldsSchema)).annotations({
  [OfEntity]: 'folder',
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
})

export type Folder = typeof Folder.Type
