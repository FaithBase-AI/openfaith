import { phoneNumbersTable } from '@openfaith/db'
import { type FieldConfig, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import { BaseIdentifiedEntity, BaseSystemFields } from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

// Clean BasePhoneNumber class for transformers (no system fields, no extensions)
export class BasePhoneNumber extends BaseSystemFields.extend<BasePhoneNumber>('BasePhoneNumber')({
  _tag: Schema.Literal('phoneNumber').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
  countryCode: Schema.String.annotations({
    description: 'The country code of the phone number',
    [OfUiConfig]: {
      table: {
        order: 3,
        sortable: true,
      },
    },
  }),
  location: Schema.String.annotations({
    description: 'The location type of the phone number (e.g., Mobile, Home, Work)',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 2,
        sortable: true,
      },
    },
  }).pipe(Schema.NullOr),
  number: Schema.String.annotations({
    description: 'The phone number',
    [OfUiConfig]: {
      table: {
        filterable: true,
        order: 1,
        pinned: 'left',
        sortable: true,
      },
    },
  }),
  primary: Schema.Boolean.annotations({
    description: 'Whether this is the primary phone number',
    [OfUiConfig]: {
      table: {
        cellType: 'badge',
        filterable: true,
        order: 0,
        sortable: true,
      },
    },
  }),
  type: Schema.Literal('default').annotations({
    [OfUiConfig]: {
      table: {
        hidden: true,
      },
    },
  }),
}) {}

// Full PhoneNumber class that extends BasePhoneNumber and then extends BaseIdentifiedEntity
export class PhoneNumber extends BasePhoneNumber.extend<PhoneNumber>('PhoneNumber')(
  BaseIdentifiedEntity.fields,
  [
    // Annotations for the class
    {
      title: 'phoneNumber',
      [OfTable]: phoneNumbersTable,
      [OfUiConfig]: {
        navigation: {
          description: 'Manage contact phone numbers',
          enabled: true,
          icon: 'phoneIcon',
          module: 'directory',
          order: 5,
          title: 'Phone Numbers',
        },
      } satisfies FieldConfig,
    },
  ],
) {
  get displayName(): string {
    const number = this.number || ''
    const location = this.location || ''

    if (number) {
      return location ? `${location}: ${number}` : number
    }
    return `Phone ${this.id}`
  }
}
