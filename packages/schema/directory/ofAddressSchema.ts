import { addressesTable } from '@openfaith/db'
import { type FieldConfig, OfEntity, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BaseAddress = BaseSystemFieldsSchema.pipe(
  Schema.extend(
    Schema.TaggedStruct('address', {
      city: Schema.String.annotations({
        description: 'The city of the address',
        [OfUiConfig]: {
          table: {
            filterable: true,
            order: 3,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      countryCode: Schema.String.annotations({
        description: 'The country code of the address',
        [OfUiConfig]: {
          table: {
            order: 6,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      countryName: Schema.String.annotations({
        description: 'The country name of the address',
        [OfUiConfig]: {
          table: {
            filterable: true,
            order: 5,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      location: Schema.String.annotations({
        description: 'The location type of the address (e.g., Home, Work, Other)',
        [OfUiConfig]: {
          table: {
            cellType: 'badge',
            filterable: true,
            order: 1,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      primary: Schema.Boolean.annotations({
        description: 'Whether this is the primary address',
        [OfUiConfig]: {
          table: {
            cellType: 'badge',
            filterable: true,
            order: 0,
            sortable: true,
          },
        },
      }),
      state: Schema.String.annotations({
        description: 'The state or province of the address',
        [OfUiConfig]: {
          table: {
            filterable: true,
            order: 4,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      streetLine1: Schema.String.annotations({
        description: 'The first line of the street address',
        [OfUiConfig]: {
          table: {
            filterable: true,
            order: 2,
            pinned: 'left',
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      streetLine2: Schema.String.annotations({
        description: 'The second line of the street address',
        [OfUiConfig]: {
          table: {
            order: 8,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
      type: Schema.Literal('default').annotations({
        [OfUiConfig]: {
          table: {
            hidden: true,
          },
        },
      }),
      zip: Schema.String.annotations({
        description: 'The postal or ZIP code of the address',
        [OfUiConfig]: {
          table: {
            filterable: true,
            order: 7,
            sortable: true,
          },
        },
      }).pipe(Schema.NullOr),
    }),
  ),
).annotations({
  [OfTable]: addressesTable,
})
export type BaseAddress = typeof BaseAddress.Type

export const Address = BaseAddress.pipe(Schema.extend(IdentificationFieldsSchema)).annotations({
  [OfEntity]: 'address',
  [OfUiConfig]: {
    navigation: {
      description: 'Manage contact addresses',
      enabled: true,
      icon: 'pinIcon',
      module: 'directory',
      order: 4,
      title: 'Addresses',
    },
  } satisfies FieldConfig,
})

export type Address = typeof Address.Type
