import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { BaseAddress, OFFieldName } from '@openfaith/schema'
import { Schema } from 'effect'

export const PCOAddressAttributes = Schema.Struct({
  city: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'city',
  }),
  country_code: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'countryCode',
  }),
  country_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'countryName',
  }),
  created_at: Schema.String.annotations({
    [OFFieldName]: 'createdAt',
  }),
  location: Schema.Literal('Home', 'Work', 'Other').annotations({
    [OFFieldName]: 'location',
  }),
  primary: Schema.Boolean.annotations({
    [OFFieldName]: 'primary',
  }),
  state: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'state',
  }),
  street_line_1: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'streetLine1',
  }),
  street_line_2: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'streetLine2',
  }),
  updated_at: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'updatedAt',
  }),
  zip: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'zip',
  }),
})
export type PCOAddressAttributes = typeof PCOAddressAttributes.Type

export const pcoAddressTransformer = pcoToOf(PCOAddressAttributes, BaseAddress)

export const PCOAddress = Schema.Struct({
  attributes: PCOAddressAttributes,
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
export type PCOAddress = typeof PCOAddress.Type
