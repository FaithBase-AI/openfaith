import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoConditionAttributes = Schema.Struct({
  application: Schema.String.annotations({
    [OfFieldName]: 'application',
    [OfCustomField]: true,
  }),
  comparison: Schema.String.annotations({
    [OfFieldName]: 'comparison',
    [OfCustomField]: true,
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  definition_class: Schema.String.annotations({
    [OfFieldName]: 'definitionClass',
    [OfCustomField]: true,
  }),
  definition_identifier: Schema.String.annotations({
    [OfFieldName]: 'definitionIdentifier',
    [OfCustomField]: true,
  }),
  description: Schema.String.annotations({
    [OfFieldName]: 'description',
    [OfCustomField]: true,
  }),
  settings: Schema.String.annotations({
    [OfFieldName]: 'settings',
    [OfCustomField]: true,
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoConditionAttributes = typeof PcoConditionAttributes.Type

export const PcoCondition = mkPcoEntity({
  attributes: PcoConditionAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    created_by: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'Condition',
}).annotations({ [OfSkipEntity]: true, title: 'pco-condition' })
export type PcoCondition = typeof PcoCondition.Type
