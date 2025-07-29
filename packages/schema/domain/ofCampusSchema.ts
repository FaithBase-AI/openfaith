import { campusesTable } from '@openfaith/db'
import { type FieldConfig, OfEntity, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseCampus = Schema.asSchema(
  BaseSystemFieldsSchema.pipe(
    Schema.extend(
      Schema.Struct({
        _tag: Schema.Literal('campus'),
        avatarUrl: Schema.String.annotations({
          description: 'Campus avatar URL',
        }).pipe(Schema.NullOr),
        churchCenterEnabled: Schema.Boolean.annotations({
          description: 'Is Church Center enabled',
        }).pipe(Schema.NullOr),
        city: Schema.String.annotations({
          description: 'City',
        }).pipe(Schema.NullOr),
        contactEmailAddress: Schema.String.annotations({
          description: 'Contact email address',
        }).pipe(Schema.NullOr),
        country: Schema.String.annotations({
          description: 'Country',
        }).pipe(Schema.NullOr),
        dateFormat: Schema.Number.annotations({
          description: 'Date format',
        }).pipe(Schema.NullOr),
        description: Schema.String.annotations({
          description: 'Description of the campus',
        }).pipe(Schema.NullOr),
        geolocationSetManually: Schema.Boolean.annotations({
          description: 'Was geolocation set manually',
        }).pipe(Schema.NullOr),
        latitude: Schema.Number.annotations({
          description: 'Latitude of the campus',
        }).pipe(Schema.NullOr),
        longitude: Schema.Number.annotations({
          description: 'Longitude of the campus',
        }).pipe(Schema.NullOr),
        name: Schema.String.annotations({
          description: 'Campus name',
        }).pipe(Schema.NullOr),
        phoneNumber: Schema.String.annotations({
          description: 'Phone number',
        }).pipe(Schema.NullOr),
        state: Schema.String.annotations({
          description: 'State',
        }).pipe(Schema.NullOr),
        street: Schema.String.annotations({
          description: 'Street address',
        }).pipe(Schema.NullOr),
        timeZone: Schema.String.annotations({
          description: 'Time zone',
        }).pipe(Schema.NullOr),
        timeZoneRaw: Schema.String.annotations({
          description: 'Raw time zone',
        }).pipe(Schema.NullOr),
        twentyFourHourTime: Schema.Boolean.annotations({
          description: 'Whether 24-hour time is used',
        }).pipe(Schema.NullOr),
        website: Schema.String.annotations({
          description: 'Website',
        }).pipe(Schema.NullOr),
        zip: Schema.String.annotations({
          description: 'Zip code',
        }).pipe(Schema.NullOr),
      }),
    ),
  ),
)
export type BaseCampus = typeof BaseCampus.Type

export const Campus = BaseCampus.pipe(Schema.extend(IdentificationFieldsSchema)).annotations({
  [OfEntity]: 'campus',
  [OfTable]: campusesTable,
  [OfUiConfig]: {
    navigation: {
      description: 'Manage church campuses and locations',
      enabled: true,
      icon: 'buildingIcon',
      module: 'domain',
      order: 2,
      title: 'Campuses',
    },
  } satisfies FieldConfig,
})

export type Campus = typeof Campus.Type
