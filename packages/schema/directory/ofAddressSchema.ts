import { Schema } from 'effect'
import { BaseSystemFieldsSchema, IdentificationFieldsSchema } from '../systemSchema'

export const BaseAddress = Schema.Struct({
  ...BaseSystemFieldsSchema.fields,
  _tag: Schema.Literal('address'),
  type: Schema.Literal('default'),

  streetLine1: Schema.String.annotations({
    description: 'The first line of the street address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  streetLine2: Schema.String.annotations({
    description: 'The second line of the street address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  city: Schema.String.annotations({
    description: 'The city of the address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  state: Schema.String.annotations({
    description: 'The state or province of the address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  zip: Schema.String.annotations({
    description: 'The postal or ZIP code of the address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  countryCode: Schema.String.annotations({
    description: 'The country code of the address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  countryName: Schema.String.annotations({
    description: 'The country name of the address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  location: Schema.String.annotations({
    description: 'The location type of the address (e.g., Home, Work, Other)',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  primary: Schema.Boolean.annotations({
    description: 'Whether this is the primary address',
  }),
})
export type BaseAddress = typeof BaseAddress.Type

export const Address = Schema.Struct({
  ...BaseAddress.fields,
  ...IdentificationFieldsSchema.fields,
})

export type Address = typeof Address.Type
