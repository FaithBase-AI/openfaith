import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfEdge, OfFieldName, OfIdentifier, OfSkipEntity, OfSkipField } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoFieldDefinitionAttributes = Schema.Struct({
  config: Schema.String.annotations({
    [OfFieldName]: 'config',
  }),
  data_type: Schema.String.annotations({
    [OfFieldName]: 'dataType',
  }),
  deleted_at: Schema.optional(Schema.String).annotations({
    [OfFieldName]: 'deletedAt',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  sequence: Schema.Number.annotations({
    [OfFieldName]: 'sequence',
  }),
  slug: Schema.String.annotations({
    [OfFieldName]: 'slug',
  }),
  tab_id: Schema.optional(Schema.String).annotations({
    [OfSkipField]: true,
    [OfEdge]: 'tabId',
  }),
})
export type PcoFieldDefinitionAttributes = typeof PcoFieldDefinitionAttributes.Type

export const PcoFieldDefinition = mkPcoEntity({
  attributes: PcoFieldDefinitionAttributes,
  links: Schema.Struct({
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    tab: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Tab'),
        }),
      ),
    }),
  }),
  type: 'FieldDefinition',
}).annotations({
  [OfSkipEntity]: true,
  [OfIdentifier]: 'pco-field-definition',
})
export type PcoFieldDefinition = typeof PcoFieldDefinition.Type
