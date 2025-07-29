import { phoneNumbersTable } from '@openfaith/db'
import { type FieldConfig, OfEntity, OfTable, OfUiConfig } from '@openfaith/schema/shared/schema'
import {
  BaseSystemFieldsSchema,
  IdentificationFieldsSchema,
} from '@openfaith/schema/shared/systemSchema'
import { Schema } from 'effect'

export const BasePhoneNumber = BaseSystemFieldsSchema.pipe(
  Schema.extend(
    Schema.TaggedStruct('phoneNumber', {
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
    }),
  ),
).annotations({
  [OfTable]: phoneNumbersTable,
})
export type BasePhoneNumber = typeof BasePhoneNumber.Type

export const PhoneNumber = BasePhoneNumber.pipe(
  Schema.extend(IdentificationFieldsSchema),
).annotations({
  [OfEntity]: 'phoneNumber',
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
})
export type PhoneNumber = typeof PhoneNumber.Type
