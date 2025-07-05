import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { BasePhoneNumber, OFSkipField, OfCustomField, OfFieldName } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPhoneNumberAttributes = Schema.Struct({
  carrier: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'carrier',
    [OfCustomField]: true,
  }),
  country_code: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'countryCode',
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  e164: Schema.String.annotations({
    [OfFieldName]: 'number',
  }),
  international: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'international',
    [OfCustomField]: true,
  }),
  location: Schema.NullOr(
    Schema.Union(
      Schema.Literal('Mobile', 'Home', 'Work', 'Other', 'Pager', 'Fax', 'Skype'),
      Schema.String,
    ),
  ).annotations({
    [OfFieldName]: 'location',
  }),
  national: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'national',
    [OfCustomField]: true,
  }),
  number: Schema.String.annotations({
    [OfFieldName]: 'number',
    // We skip because `e164` gives us the number in E.164 format.
    [OFSkipField]: true,
  }),
  primary: Schema.Boolean.annotations({
    [OfFieldName]: 'primary',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
})
export type PcoPhoneNumberAttributes = typeof PcoPhoneNumberAttributes.Type

export const pcoPhoneNumberTransformer = pcoToOf(
  PcoPhoneNumberAttributes,
  BasePhoneNumber,
  'phoneNumber',
)

export const PcoPhoneNumber = Schema.Struct({
  attributes: PcoPhoneNumberAttributes,
  id: Schema.String,
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
  type: Schema.Literal('PhoneNumber'),
})
export type PcoPhoneNumber = typeof PcoPhoneNumber.Type
