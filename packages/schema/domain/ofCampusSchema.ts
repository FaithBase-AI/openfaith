import { campusesTable } from '@openfaith/db'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export class BaseCampus extends BaseSystemFields.extend<BaseCampus>('BaseCampus')({
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
      field: {
        hidden: true,
      },
      table: {
        cellType: 'avatar',
        order: 0,
        width: 60,
      },
    },
  }).pipe(Schema.NullOr, Schema.optional),
  city: Schema.String.annotations({
    description: 'City',
    [OfUiConfig]: {
      field: {
        hidden: true,
        order: 5,
      },
      table: {
        filterable: true,
        order: 4,
        sortable: true,
      },
    },
  }),
  country: Schema.String.annotations({
    description: 'Country',
    [OfUiConfig]: {
      field: {
        hidden: true,
        order: 8,
      },
      table: {
        filterable: true,
        order: 6,
        sortable: true,
      },
    },
  }),
  description: Schema.String.annotations({
    description: 'Description of the campus',
    [OfUiConfig]: {
      field: {
        order: 2,
      },
      table: {
        order: 2,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr, Schema.optional),
  latitude: Schema.Number.annotations({
    description: 'Latitude of the campus',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    },
  }).pipe(Schema.NullOr, Schema.optional),
  longitude: Schema.Number.annotations({
    description: 'Longitude of the campus',
    [OfUiConfig]: {
      field: {
        hidden: true,
      },
      table: {
        hidden: true,
      },
    },
  }).pipe(Schema.NullOr, Schema.optional),
  name: Schema.String.annotations({
    description: 'Campus name',
    [OfUiConfig]: {
      field: {
        order: 1,
      },
      table: {
        filterable: true,
        order: 1,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  state: Schema.String.annotations({
    description: 'State',
    [OfUiConfig]: {
      field: {
        hidden: true,
        order: 6,
      },
      table: {
        filterable: true,
        order: 5,
        sortable: true,
      },
    },
  }),
  street: Schema.String.annotations({
    description: 'Street address',
    [OfUiConfig]: {
      field: {
        composite: ['street', 'city', 'state', 'zip', 'country', 'latitude', 'longitude'],
        order: 4,
        placeholder: 'Search for campus address...',
        type: 'addressLocation',
      },
      table: {
        order: 9,
        sortable: true,
      },
    },
  }),
  url: Schema.String.annotations({
    description: 'Website URL',
    [OfUiConfig]: {
      field: {
        order: 3,
      },
      table: {
        order: 11,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr, Schema.optional),
  zip: Schema.String.annotations({
    description: 'Zip code',

    [OfUiConfig]: {
      field: {
        hidden: true,
        order: 7,
      },
      table: {
        filterable: true,
        order: 12,
        sortable: true,
      },
    },
  }),
}) {}

export class Campus extends BaseCampus.extend<Campus>('Campus')(BaseIdentifiedEntity.fields, [
  {
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
  },
]) {}
