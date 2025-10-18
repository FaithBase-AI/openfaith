import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BaseCampus,
  Campus,
  OfCustomField,
  OfDefaultValueFn,
  OfEntity,
  OfFieldName,
  OfPartialTransformer,
  OfTransformer,
} from '@openfaith/schema'
import { StringOrNumberToNumber } from '@openfaith/shared'
import { Array, Option, pipe, Record, Schema } from 'effect'
import * as geoTz from 'geo-tz'

// All of this is because PCO has issues when you send back a valid timezone in your post. They return a valid timezone
// when you get an entity, but they only support one of these options for timezones.
const timezoneLookup: Record<string, Array.NonEmptyReadonlyArray<string>> = {
  ['-01:00']: ['Azores', 'Cape Verde Is.'],
  ['-02:00']: ['Greenland', 'Mid-Atlantic'],
  ['-03:00']: ['Brasilia', 'Buenos Aires', 'Montevideo'],
  ['-03:30']: ['Newfoundland'],
  ['-04:00']: [
    'Atlantic Time (Canada)',
    'Caracas',
    'Georgetown',
    'La Paz',
    'Puerto Rico',
    'Santiago',
  ],
  ['-05:00']: ['Eastern Time (US & Canada)'],
  ['-06:00']: ['Central Time (US & Canada)', 'Mexico City', 'Saskatchewan'],
  ['-07:00']: ['Arizona', 'Mountain Time (US & Canada)'],
  ['-08:00']: ['Pacific Time (US & Canada)'],
  ['-09:00']: ['Alaska'],
  ['-10:00']: ['Hawaii'],
  ['-11:00']: ['Midway Island'],
  ['-12:00']: ['International Date Line West'],
  ['+00:00']: ['Edinburgh', 'Lisbon', 'London', 'Monrovia', 'UTC'],
  ['+01:00']: [
    'Amsterdam',
    'Belgrade',
    'Berlin',
    'Bern',
    'Bratislava',
    'Brussels',
    'Budapest',
    'Casablanca',
    'Copenhagen',
    'Dublin',
    'Ljubljana',
    'Madrid',
    'Paris',
    'Prague',
    'Rome',
    'Sarajevo',
    'Skopje',
    'Stockholm',
    'Vienna',
    'Warsaw',
    'West Central Africa',
    'Zagreb',
    'Zurich',
  ],
  ['+02:00']: [
    'Athens',
    'Bucharest',
    'Cairo',
    'Harare',
    'Helsinki',
    'Jerusalem',
    'Kaliningrad',
    'Kyiv',
    'Pretoria',
    'Riga',
    'Sofia',
    'Tallinn',
    'Vilnius',
  ],
  ['+03:00']: [
    'Baghdad',
    'Istanbul',
    'Kuwait',
    'Minsk',
    'Moscow',
    'Nairobi',
    'Riyadh',
    'St. Petersburg',
    'Volgograd',
  ],
  ['+03:30']: ['Tehran'],
  ['+04:00']: ['Abu Dhabi', 'Baku', 'Muscat', 'Samara', 'Tbilisi', 'Yerevan'],
  ['+04:30']: ['Kabul'],
  ['+05:00']: ['Almaty', 'Astana', 'Ekaterinburg', 'Islamabad', 'Karachi', 'Tashkent'],
  ['+05:30']: ['Chennai', 'Kolkata', 'Mumbai', 'New Delhi', 'Sri Jayawardenepura'],
  ['+05:45']: ['Kathmandu'],
  ['+06:00']: ['Dhaka', 'Urumqi'],
  ['+06:30']: ['Rangoon'],
  ['+07:00']: ['Bangkok', 'Hanoi', 'Jakarta', 'Krasnoyarsk', 'Novosibirsk'],
  ['+08:00']: [
    'Beijing',
    'Chongqing',
    'Hong Kong',
    'Irkutsk',
    'Kuala Lumpur',
    'Perth',
    'Singapore',
    'Taipei',
    'Ulaanbaatar',
  ],
  ['+09:00']: ['Osaka', 'Sapporo', 'Seoul', 'Tokyo', 'Yakutsk'],
  ['+09:30']: ['Adelaide', 'Darwin'],
  ['+10:00']: [
    'Brisbane',
    'Canberra',
    'Guam',
    'Hobart',
    'Melbourne',
    'Port Moresby',
    'Sydney',
    'Vladivostok',
  ],
  ['+11:00']: ['Magadan', 'New Caledonia', 'Solomon Is.', 'Srednekolymsk'],
  ['+12:00']: ['Auckland', 'Fiji', 'Kamchatka', 'Marshall Is.', 'Wellington'],
  ['+12:45']: ['Chatham Is.'],
  ['+13:00']: ["Nuku'alofa", 'Samoa', 'Tokelau Is.'],
}

const getTimezoneOffset = (timezone: string): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  })

  const parts = formatter.formatToParts(new Date())
  const offsetPart = parts.find((part) => part.type === 'timeZoneName')

  return offsetPart?.value ?? '+00:00'
}

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
    [OfFieldName]: 'countryCode',
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
  latitude: Schema.NullOr(StringOrNumberToNumber).annotations({
    [OfFieldName]: 'latitude',
  }),
  longitude: Schema.NullOr(StringOrNumberToNumber).annotations({
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
    // We need to get a valid default timezone from the lat / long because PCO only supports one of these options for
    // timezones when you create an entity.
    [OfDefaultValueFn]: (attrs: { latitude: number; longitude: number }) => {
      const timezones = geoTz.find(attrs.latitude, attrs.longitude)

      const timezoneOffset = pipe(
        timezones,
        Array.head,
        Option.getOrElse(() => 'America/New_York'),
        getTimezoneOffset,
      )

      return pipe(
        timezoneLookup,
        Record.get(timezoneOffset),
        Option.map(Array.headNonEmpty),
        Option.getOrElse(() => 'Eastern Time (US & Canada)'),
      )
    },
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

export const pcoCampusPartialTransformer = pcoToOf(
  Schema.partial(PcoCampusAttributes),
  Schema.partial(Schema.Struct(BaseCampus.fields)),
  'campus',
)

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
  [OfEntity]: Campus,
  title: 'pco-campus',
  [OfTransformer]: pcoCampusTransformer,
  [OfPartialTransformer]: pcoCampusPartialTransformer,
})
export type PcoCampus = typeof PcoCampus.Type
