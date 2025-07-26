import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { OfCustomField, OfFieldName, OfIdentifier, OfSkipEntity } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoEmailAttributes = Schema.Struct({
  address: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'address',
    [OfCustomField]: true,
  }),
  blocked: Schema.Boolean.annotations({
    [OfFieldName]: 'blocked',
    [OfCustomField]: true,
  }),
  created_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'createdAt',
    [OfCustomField]: true,
  }),
  location: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'location',
    [OfCustomField]: true,
  }),
  primary: Schema.Boolean.annotations({
    [OfFieldName]: 'primary',
    [OfCustomField]: true,
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
    [OfCustomField]: true,
  }),
})
export type PcoEmailAttributes = typeof PcoEmailAttributes.Type

export const PcoEmail = mkPcoEntity({
  attributes: PcoEmailAttributes,
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
  type: 'Email',
}).annotations({ [OfSkipEntity]: true, [OfIdentifier]: 'pco-email' })
export type PcoEmail = typeof PcoEmail.Type
