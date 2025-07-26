import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoListShareAttributes = Schema.Struct({
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  group: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'group',
    [OfCustomField]: true,
  }),
  name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'name',
    [OfCustomField]: true,
  }),
  permission: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'permission',
    [OfCustomField]: true,
  }),
})
export type PcoListShareAttributes = typeof PcoListShareAttributes.Type

export const PcoListShare = mkPcoEntity({
  attributes: PcoListShareAttributes,
  links: Schema.Struct({}),
  relationships: Schema.Struct({
    person: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Person'),
        }),
      ),
    }),
  }),
  type: 'ListShare',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-list-share' })
export type PcoListShare = typeof PcoListShare.Type
