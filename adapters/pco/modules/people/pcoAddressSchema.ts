import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { BaseAddress, OfFieldName } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoAddressAttributes = Schema.Struct({
  city: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'city',
  }),
  country_code: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'countryCode',
  }),
  country_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'countryName',
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  location: Schema.Literal('Home', 'Work', 'Other').annotations({
    [OfFieldName]: 'location',
  }),
  primary: Schema.Boolean.annotations({
    [OfFieldName]: 'primary',
  }),
  state: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'state',
  }),
  street_line_1: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'streetLine1',
  }),
  street_line_2: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'streetLine2',
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'updatedAt',
  }),
  zip: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'zip',
  }),
})
export type PcoAddressAttributes = typeof PcoAddressAttributes.Type

export const pcoAddressTransformer = pcoToOf(PcoAddressAttributes, BaseAddress)

export const PcoAddress = Schema.Struct({
  attributes: PcoAddressAttributes,
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
  type: Schema.Literal('Address'),
})
export type PcoAddress = typeof PcoAddress.Type
