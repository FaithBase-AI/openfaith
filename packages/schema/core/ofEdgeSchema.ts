import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseEdge = Schema.Struct({
  ...BaseSystemFieldsSchema.fields,
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
})
export type BaseEdge = typeof BaseEdge.Type

export const Edge = Schema.Struct({
  ...BaseEdge.fields,
  ...IdentificationFieldsSchema.fields,
})

export type Edge = typeof Edge.Type
