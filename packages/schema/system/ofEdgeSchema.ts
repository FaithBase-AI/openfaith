import { type FieldConfig, OfEntity, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseEdge = BaseSystemFieldsSchema.pipe(
  Schema.extend(
    Schema.Struct({
      _tag: Schema.Literal('edge'),
      metadata: Schema.Record({
        key: Schema.String,
        value: Schema.Unknown,
      }).annotations({
        description:
          'JSONB field to store arbitrary key-value pairs describing the relationship itself',
      }),
      relationshipType: Schema.String.annotations({
        description:
          'A string defining the meaning of the connection (e.g., "member_of", "attended", "suitable_for_group", "mentors")',
      }),
      sourceEntityId: Schema.String.annotations({
        description: 'ID of the starting entity of the relationship',
      }),
      sourceEntityTypeTag: Schema.String.annotations({
        description: 'The _tag of the source entity (e.g., "person", "group")',
      }),
      targetEntityId: Schema.String.annotations({
        description: 'ID of the ending entity of the relationship',
      }),
      targetEntityTypeTag: Schema.String.annotations({
        description: 'The _tag of the target entity (e.g., "person", "group")',
      }),
    }),
  ),
)
export type BaseEdge = typeof BaseEdge.Type

export const Edge = BaseEdge.pipe(Schema.extend(IdentificationFieldsSchema)).annotations({
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
})

export type Edge = typeof Edge.Type
