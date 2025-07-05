import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseAddress = Schema.TaggedStruct('address', {
  ...BaseSystemFieldsSchema.fields,
  city: Schema.String.annotations({
    description: 'The city of the address',
  }).pipe(Schema.NullOr),
  countryCode: Schema.String.annotations({
    description: 'The country code of the address',
  }).pipe(Schema.NullOr),
  countryName: Schema.String.annotations({
    description: 'The country name of the address',
  }).pipe(Schema.NullOr),
  location: Schema.String.annotations({
    description: 'The location type of the address (e.g., Home, Work, Other)',
  }).pipe(Schema.NullOr),
  primary: Schema.Boolean.annotations({
    description: 'Whether this is the primary address',
  }),
  state: Schema.String.annotations({
    description: 'The state or province of the address',
  }).pipe(Schema.NullOr),
  streetLine1: Schema.String.annotations({
    description: 'The first line of the street address',
  }).pipe(Schema.NullOr),
  streetLine2: Schema.String.annotations({
    description: 'The second line of the street address',
  }).pipe(Schema.NullOr),
  type: Schema.Literal('default'),
  zip: Schema.String.annotations({
    description: 'The postal or ZIP code of the address',
  }).pipe(Schema.NullOr),
})
export type BaseAddress = typeof BaseAddress.Type

export const Address = Schema.Struct({
  ...BaseAddress.fields,
  ...IdentificationFieldsSchema.fields,
})

export type Address = typeof Address.Type
