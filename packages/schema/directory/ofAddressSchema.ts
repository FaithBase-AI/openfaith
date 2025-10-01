import { addressesTable } from '@openfaith/db'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

// Create BaseAddress class with address-specific fields (for transformers)
export class BaseAddress extends BaseSystemFields.extend<BaseAddress>('BaseAddress')({
  _tag: Schema.Literal('address').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
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
}) {}

// Final Address class with identification fields, displayName getter and annotations
export class Address extends BaseAddress.extend<Address>('Address')(BaseIdentifiedEntity.fields, [
  // Annotations for the class
  {
    title: 'address',
    [OfTable]: addressesTable,
    [OfUiConfig]: {
      meta: {
        disableCreate: true,
      },
      navigation: {
        description: 'Manage contact addresses',
        enabled: true,
        icon: 'pinIcon',
        module: 'directory',
        order: 4,
        title: 'Addresses',
      },
    } satisfies FieldConfig,
  },
]) {
  get displayName(): string {
    const streetLine1 = this.streetLine1 || ''
    const city = this.city || ''
    const location = this.location || ''

    if (streetLine1 && city) {
      return `${streetLine1}, ${city}`
    }
    if (streetLine1) {
      return streetLine1
    }
    if (city) {
      return city
    }
    if (location) {
      return `${location} Address`
    }
    return `Address ${this.id}`
  }
}
