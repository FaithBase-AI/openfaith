import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseAddress = Schema.TaggedStruct('address', {
  ...BaseSystemFieldsSchema.fields,
  city: Schema.String.annotations({
    description: 'The city of the address',
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
  state: Schema.String.annotations({
    description: 'The state or province of the address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  streetLine1: Schema.String.annotations({
    description: 'The first line of the street address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  streetLine2: Schema.String.annotations({
    description: 'The second line of the street address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
  type: Schema.Literal('default'),
  zip: Schema.String.annotations({
    description: 'The postal or ZIP code of the address',
  }).pipe(Schema.optionalWith({ as: 'Option', nullable: true })),
})
export type BaseAddress = typeof BaseAddress.Type

export const Address = Schema.Struct({
  ...BaseAddress.fields,
  ...IdentificationFieldsSchema.fields,
})

export type Address = typeof Address.Type
