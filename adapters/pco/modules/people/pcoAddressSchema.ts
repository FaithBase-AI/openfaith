import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  Address,
  BaseAddress,
  OfEntity,
  OfFieldName,
  OfIdentifier,
  OfPartialTransformer,
  OfTransformer,
} from '@openfaith/schema'
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
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  zip: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'zip',
  }),
})
export type PcoAddressAttributes = typeof PcoAddressAttributes.Type

export const pcoAddressTransformer = pcoToOf(PcoAddressAttributes, BaseAddress, 'address')

export const pcoAddressPartialTransformer = pcoToOf(
  Schema.partial(PcoAddressAttributes),
  Schema.partial(Schema.Struct(BaseAddress.fields)),
  'address',
)

export const PcoAddress = mkPcoEntity({
  attributes: PcoAddressAttributes,
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
  type: 'Address',
}).annotations({
  [OfEntity]: Address,
  [OfIdentifier]: 'pco-address',
  [OfTransformer]: pcoAddressTransformer,
  [OfPartialTransformer]: pcoAddressPartialTransformer,
})

export type PcoAddress = typeof PcoAddress.Type
