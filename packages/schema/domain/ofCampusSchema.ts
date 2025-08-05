import { campusesTable } from '@openfaith/db'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseCampus = Schema.asSchema(
  BaseSystemFieldsSchema.pipe(
    Schema.extend(
      Schema.Struct({
        _tag: Schema.Literal('campus').annotations({
          [OfUiConfig]: {
            table: {
              hidden: true,
            },
          },
        }),
        avatar: Schema.String.annotations({
          description: 'Campus avatar URL',
          [OfUiConfig]: {
            table: {
              cellType: 'avatar',
              order: 0,
              width: 60,
            },
          },
        }).pipe(Schema.NullOr),
        city: Schema.String.annotations({
          description: 'City',
          [OfUiConfig]: {
            table: {
              filterable: true,
              order: 4,
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
        country: Schema.String.annotations({
          description: 'Country',
          [OfUiConfig]: {
            table: {
              filterable: true,
              order: 6,
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
        description: Schema.String.annotations({
          description: 'Description of the campus',
          [OfUiConfig]: {
            table: {
              order: 2,
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
        latitude: Schema.Number.annotations({
          description: 'Latitude of the campus',
          [OfUiConfig]: {
            table: {
              hidden: true,
            },
          },
        }).pipe(Schema.NullOr),
        longitude: Schema.Number.annotations({
          description: 'Longitude of the campus',
          [OfUiConfig]: {
            table: {
              hidden: true,
            },
          },
        }).pipe(Schema.NullOr),
        name: Schema.String.annotations({
          description: 'Campus name',
          [OfUiConfig]: {
            table: {
              filterable: true,
              order: 1,
              pinned: 'left',
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
        state: Schema.String.annotations({
          description: 'State',
          [OfUiConfig]: {
            table: {
              filterable: true,
              order: 5,
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
        street: Schema.String.annotations({
          description: 'Street address',
          [OfUiConfig]: {
            table: {
              order: 9,
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
        url: Schema.String.annotations({
          description: 'Website URL',
          [OfUiConfig]: {
            table: {
              order: 11,
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
        zip: Schema.String.annotations({
          description: 'Zip code',
          [OfUiConfig]: {
            table: {
              filterable: true,
              order: 12,
              sortable: true,
            },
          },
        }).pipe(Schema.NullOr),
      }),
    ),
  ),
)
export type BaseCampus = typeof BaseCampus.Type

export const Campus = BaseCampus.pipe(Schema.extend(IdentificationFieldsSchema)).annotations({
  title: 'campus',
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
