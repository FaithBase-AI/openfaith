import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BasePhoneNumber = Schema.TaggedStruct('phoneNumber', {
  ...BaseSystemFieldsSchema.fields,
  countryCode: Schema.String.annotations({
    description: 'The country code of the phone number',
  }),
  location: Schema.String.annotations({
    description: 'The location type of the phone number (e.g., Mobile, Home, Work)',
  }).pipe(Schema.NullOr),
  number: Schema.String.annotations({
    description: 'The phone number',
  }),
  primary: Schema.Boolean.annotations({
    description: 'Whether this is the primary phone number',
  }),
  type: Schema.Literal('default'),
})
export type BasePhoneNumber = typeof BasePhoneNumber.Type

export const PhoneNumber = Schema.Struct({
  ...BasePhoneNumber.fields,
  ...IdentificationFieldsSchema.fields,
})
export type PhoneNumber = typeof PhoneNumber.Type
