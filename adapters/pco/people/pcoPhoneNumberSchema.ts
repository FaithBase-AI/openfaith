import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { BasePhoneNumber, OFCustomField, OFFieldName, OFSkipField } from '@openfaith/schema'
import { Schema } from 'effect'

export const PCOPhoneNumberAttributes = Schema.Struct({
  carrier: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'carrier',
    [OFCustomField]: true,
  }),
  country_code: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'countryCode',
  }),
  created_at: Schema.String.annotations({
    [OFFieldName]: 'createdAt',
  }),
  e164: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'number',
    [OFCustomField]: true,
  }),
  international: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'international',
    [OFCustomField]: true,
  }),
  location: Schema.NullOr(
    Schema.Union(
      Schema.Literal('Mobile', 'Home', 'Work', 'Other', 'Pager', 'Fax', 'Skype'),
      Schema.String,
    ),
  ).annotations({
    [OFFieldName]: 'location',
  }),
  national: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'national',
    [OFCustomField]: true,
  }),
  number: Schema.String.annotations({
    [OFFieldName]: 'number',
    // We skip because `e164` gives us the number in E.164 format.
    [OFSkipField]: true,
  }),
  primary: Schema.Boolean.annotations({
    [OFFieldName]: 'primary',
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'updatedAt',
  }),
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
