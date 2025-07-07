import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { OfFieldName } from '@openfaith/schema'
import { Schema } from 'effect'

export const PcoCampusAttributes = Schema.Struct({
  avatar_url: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'avatarUrl',
  }),
  church_center_enabled: Schema.NullOr(Schema.Boolean).annotations({
    [OfFieldName]: 'churchCenterEnabled',
  }),
  city: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'city',
  }),
  contact_email_address: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'contactEmailAddress',
  }),
  country: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'country',
  }),
  created_at: Schema.String.annotations({
    [OfFieldName]: 'createdAt',
  }),
  date_format: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'dateFormat',
  }),
  description: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'description',
  }),
  geolocation_set_manually: Schema.NullOr(Schema.Boolean).annotations({
    [OfFieldName]: 'geolocationSetManually',
  }),
  latitude: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'latitude',
  }),
  longitude: Schema.NullOr(Schema.Number).annotations({
    [OfFieldName]: 'longitude',
  }),
  name: Schema.String.annotations({
    [OfFieldName]: 'name',
  }),
  phone_number: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'phoneNumber',
  }),
  state: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'state',
  }),
  street: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'street',
  }),
  time_zone: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'timeZone',
  }),
  time_zone_raw: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'timeZoneRaw',
  }),
  twenty_four_hour_time: Schema.NullOr(Schema.Boolean).annotations({
    [OfFieldName]: 'twentyFourHourTime',
  }),
  updated_at: Schema.String.annotations({
    [OfFieldName]: 'updatedAt',
  }),
  website: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'website',
  }),
  zip: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'zip',
  }),
})
export type PcoCampusAttributes = typeof PcoCampusAttributes.Type

export const pcoCampusTransformer = pcoToOf(PcoCampusAttributes, Schema.Struct({}), 'campus')

export const PcoCampus = Schema.Struct({
  attributes: PcoCampusAttributes,
  id: Schema.String,
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
  type: Schema.Literal('Campus'),
})
export type PcoCampus = typeof PcoCampus.Type
