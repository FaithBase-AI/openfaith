import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { BasePhoneNumber } from '@openfaith/schema'
import { Schema } from 'effect'

export const PCOPhoneNumberAttributes = Schema.Struct({
  carrier: Schema.NullOr(Schema.String),
  country_code: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  e164: Schema.NullOr(Schema.String),
  international: Schema.NullOr(Schema.String),
  location: Schema.NullOr(
    Schema.Union(
      Schema.Literal('Mobile', 'Home', 'Work', 'Other', 'Pager', 'Fax', 'Skype'),
      Schema.String,
    ),
  ),
  national: Schema.NullOr(Schema.String),
  number: Schema.String,
  primary: Schema.Boolean,
  updated_at: Schema.NullOr(Schema.String),
})
export type PCOPhoneNumberAttributes = typeof PCOPhoneNumberAttributes.Type

export const pcoPhoneNumberTransformer = pcoToOf(PCOPhoneNumberAttributes, BasePhoneNumber)

export const PCOPhoneNumber = Schema.Struct({
  type: Schema.Literal('PhoneNumber'),
  id: Schema.String,
  attributes: PCOPhoneNumberAttributes,
  relationships: Schema.Struct({
    person: Schema.Struct({
      data: Schema.Struct({
        type: Schema.Literal('Person'),
        id: Schema.String,
      }),
    }),
  }),
  links: Schema.Struct({
    self: Schema.String,
  }),
})
export type PCOPhoneNumber = typeof PCOPhoneNumber.Type
