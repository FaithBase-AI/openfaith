import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BaseEmail,
  Email,
  OfEntity,
  OfFieldName,
  OfPartialTransformer,
  OfTransformer,
} from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoEmailAttributes = Schema.Struct({
  address: Schema.String.annotations({
    [OfFieldName]: 'address',
  }),
  blocked: Schema.Boolean.annotations({
    [OfFieldName]: 'blocked',
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  location: Schema.NullOr(
    Schema.Union(Schema.Literal('Home', 'Work', 'Other'), Schema.String),
  ).annotations({
    [OfFieldName]: 'location',
  }),
  primary: Schema.Boolean.annotations({
    [OfFieldName]: 'primary',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
})
export type PcoEmailAttributes = typeof PcoEmailAttributes.Type

export const pcoEmailTransformer = pcoToOf(PcoEmailAttributes, BaseEmail, 'email')

export const pcoEmailPartialTransformer = pcoToOf(
  Schema.partial(PcoEmailAttributes),
  Schema.partial(Schema.Struct(BaseEmail.fields)),
  'email',
)

export const PcoEmail = mkPcoEntity({
  attributes: PcoEmailAttributes,
  links: Schema.Struct({
    self: Schema.String,
  }),
  relationships: Schema.Struct({
    person: Schema.Struct({
      data: Schema.Struct({
        id: Schema.String,
        type: Schema.Literal('Person'),
      }),
    }),
  }),
  type: 'Email',
}).annotations({
  [OfEntity]: Email,
  title: 'pco-email',
  [OfTransformer]: pcoEmailTransformer,
  [OfPartialTransformer]: pcoEmailPartialTransformer,
})

export type PcoEmail = typeof PcoEmail.Type
