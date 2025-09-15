import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BasePhoneNumber,
  OfCustomField,
  OfEntity,
  OfFieldName,
  OfIdentifier,
  OfPartialTransformer,
  OfSkipField,
  OfTransformer,
  PhoneNumber,
} from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoPhoneNumberAttributes = Schema.Struct({
  carrier: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'carrier',
    [OfCustomField]: true,
  }),
  country_code: Schema.NullOr(Schema.String)
    .pipe(
      Schema.transform(Schema.String, {
        decode: (value) => value ?? '',
        encode: (value) => value || null,
      }),
    )
    .annotations({
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
    [OfSkipField]: true,
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

export const pcoPhoneNumberPartialTransformer = pcoToOf(
  Schema.partial(PcoPhoneNumberAttributes),
  Schema.partial(Schema.Struct(BasePhoneNumber.fields)),
  'phoneNumber',
)

export const PcoPhoneNumber = mkPcoEntity({
  attributes: PcoPhoneNumberAttributes,
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
  type: 'PhoneNumber',
}).annotations({
  [OfEntity]: PhoneNumber,
  [OfIdentifier]: 'pco-phone-number',
  [OfTransformer]: pcoPhoneNumberTransformer,
  [OfPartialTransformer]: pcoPhoneNumberPartialTransformer,
})
export type PcoPhoneNumber = typeof PcoPhoneNumber.Type
