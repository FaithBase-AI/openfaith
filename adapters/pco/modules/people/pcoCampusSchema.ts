import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BaseCampus,
  OfCustomField,
  OfEntity,
  OfFieldName,
  OfIdentifier,
  OfTransformer,
} from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoCampusAttributes = Schema.Struct({
  avatar_url: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'avatar',
  }),
  church_center_enabled: Schema.Boolean.annotations({
    [OfFieldName]: 'churchCenterEnabled',
    [OfCustomField]: true,
  }),
  city: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'city',
  }),
  contact_email_address: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'contactEmailAddress',
    [OfCustomField]: true,
  }),
  country: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'country',
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  date_format: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'dateFormat',
    [OfCustomField]: true,
  }),
  description: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'description',
  }),
  geolocation_set_manually: Schema.Boolean.annotations({
    [OfFieldName]: 'geolocationSetManually',
    [OfCustomField]: true,
  }),
  latitude: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'latitude',
  }),
  longitude: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'longitude',
  }),
  name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'name',
  }),
  phone_number: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'phoneNumber',
    [OfCustomField]: true,
  }),
  state: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'state',
  }),
  street: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'street',
  }),
  time_zone: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'timeZone',
    [OfCustomField]: true,
  }),
  time_zone_raw: Schema.String.annotations({
    description: 'Only available when requested with the `?fields` param',
    [OfFieldName]: 'timeZoneRaw',
    [OfCustomField]: true,
  }).pipe(Schema.optional),
  twenty_four_hour_time: Schema.NullOr(Schema.Boolean).annotations({
    [OfFieldName]: 'twentyFourHourTime',
    [OfCustomField]: true,
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  website: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'url',
  }),
  zip: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'zip',
  }),
})
export type PcoCampusAttributes = typeof PcoCampusAttributes.Type

export const pcoCampusTransformer = pcoToOf(PcoCampusAttributes, BaseCampus, 'campus')

export const PcoCampus = mkPcoEntity({
  attributes: PcoCampusAttributes,
  links: Schema.Struct({
    lists: Schema.optional(Schema.NullOr(Schema.String)),
    organization: Schema.optional(Schema.NullOr(Schema.String)),
    self: Schema.String,
    service_times: Schema.optional(Schema.NullOr(Schema.String)),
  }),
  relationships: Schema.Struct({
    organization: Schema.Struct({
      data: Schema.NullOr(
        Schema.Struct({
          id: Schema.String,
          type: Schema.Literal('Organization'),
        }),
      ),
    }),
  }),
  type: 'Campus',
}).annotations({
  [OfEntity]: 'campus',
  [OfIdentifier]: 'pco-campus',
  [OfTransformer]: pcoCampusTransformer,
})
export type PcoCampus = typeof PcoCampus.Type
