import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  type PcoPhoneNumberAttributes,
  pcoPhoneNumberTransformer,
} from '@openfaith/pco/modules/people/pcoPhoneNumberSchema'
import { PcoPersonAttributes } from '@openfaith/pco/server'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BasePerson,
  CustomFieldSchema,
  OfCustomField,
  OfFieldName,
  OfSkipField,
} from '@openfaith/schema'
import { Effect, Schema } from 'effect'

const PcoItem = Schema.Struct({
  first_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'firstName',
  }),
  last_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'lastName',
  }),
  middle_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'middleName',
    [OfCustomField]: true,
  }),
})
type PcoItem = typeof PcoItem.Type

const OfItem = Schema.Struct({
  customFields: Schema.Array(CustomFieldSchema),
  firstName: Schema.NullOr(Schema.String),
  lastName: Schema.NullOr(Schema.String),
})
type OfItem = typeof OfItem.Type

// New schema to test OFSkipField functionality
const PcoItemWithSkipField = Schema.Struct({
  // A custom field that should still work normally
  carrier: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'carrier',
    [OfCustomField]: true,
  }),
  // e164 field maps to phoneNumber and should be used
  e164: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'phoneNumber',
  }),
  first_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'firstName',
  }),
  last_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'lastName',
  }),
  // number field also maps to phoneNumber but should be skipped
  number: Schema.optional(Schema.String).annotations({
    [OfFieldName]: 'phoneNumber',
    [OfSkipField]: true,
  }),
})
type PcoItemWithSkipField = typeof PcoItemWithSkipField.Type

const OfItemWithPhone = Schema.Struct({
  customFields: Schema.Array(CustomFieldSchema),
  firstName: Schema.NullOr(Schema.String),
  lastName: Schema.NullOr(Schema.String),
  phoneNumber: Schema.NullOr(Schema.String),
})
type OfItemWithPhone = typeof OfItemWithPhone.Type

const pcoTestData: PcoItem = {
  first_name: 'Foo',
  last_name: 'Bar',
  middle_name: 'Yeet',
}

const ofTestData: OfItem = {
  customFields: [
    {
      _tag: 'string',
      name: 'pco_middle_name',
      source: 'pco',
      value: 'Yeet',
    },
  ],
  firstName: 'Foo',
  lastName: 'Bar',
}

effect('pcoToOf decode: transforms PCO data to OF format', () =>
  Effect.gen(function* () {
    const transformer = pcoToOf(PcoItem, OfItem, 'item')
    const result = Schema.decodeSync(transformer)(pcoTestData)

    expect(result).toEqual(ofTestData)
  }),
)

effect('pcoToOf encode: transforms OF data back to PCO format', () =>
  Effect.gen(function* () {
    const transformer = pcoToOf(PcoItem, OfItem, 'item')
    const result = Schema.encodeSync(transformer)(ofTestData)

    expect(result).toEqual(pcoTestData)
  }),
)

effect('pcoToOf handles null values correctly', () =>
  Effect.gen(function* () {
    const transformer = pcoToOf(PcoItem, OfItem, 'item')

    const pcoWithNulls: PcoItem = {
      first_name: 'Foo',
      last_name: null,
      middle_name: null,
    }

    const expectedOF: OfItem = {
      customFields: [
        {
          _tag: 'string',
          name: 'pco_middle_name',
          source: 'pco',
          value: null,
        },
      ],
      firstName: 'Foo',
      lastName: null,
    }

    const result = Schema.decodeSync(transformer)(pcoWithNulls)
    expect(result).toEqual(expectedOF)
  }),
)

effect('pcoToOf handles missing fields correctly', () =>
  Effect.gen(function* () {
    const transformer = pcoToOf(PcoItem, OfItem, 'item')

    const pcoPartial: PcoItem = {
      first_name: 'Foo',
      last_name: null,
      middle_name: null,
    }

    const result = Schema.decodeSync(transformer)(pcoPartial)

    expect(result.firstName).toBe('Foo')
    expect(result.lastName).toBe(null)
    expect(result.customFields).toEqual([
      {
        _tag: 'string',
        name: 'pco_middle_name',
        source: 'pco',
        value: null,
      },
    ])

    const backToPco = Schema.encodeSync(transformer)(result)
    expect(backToPco).toEqual(pcoPartial)
  }),
)

effect('pcoToOf skips fields marked with OFSkipField', () =>
  Effect.gen(function* () {
    const transformer = pcoToOf(PcoItemWithSkipField, OfItemWithPhone, 'itemWithPhone')

    const pcoTestData: PcoItemWithSkipField = {
      carrier: 'Verizon',
      e164: '+1234567890',
      first_name: 'John', // This should be used for phoneNumber
      last_name: 'Doe', // This should be skipped
      number: '123-456-7890',
    }

    const expectedOF: OfItemWithPhone = {
      customFields: [
        {
          _tag: 'string',
          name: 'pco_carrier',
          source: 'pco',
          value: 'Verizon',
        },
      ],
      firstName: 'John',
      lastName: 'Doe', // Should come from e164, not number
      phoneNumber: '+1234567890',
    }

    const result = Schema.decodeSync(transformer)(pcoTestData)
    expect(result).toEqual(expectedOF)
  }),
)

effect('pcoToOf encode works correctly when skipped field exists in original data', () =>
  Effect.gen(function* () {
    const transformer = pcoToOf(PcoItemWithSkipField, OfItemWithPhone, 'itemWithPhone')

    const ofData: OfItemWithPhone = {
      customFields: [
        {
          _tag: 'string',
          name: 'pco_carrier',
          source: 'pco',
          value: 'Verizon',
        },
      ],
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
    }

    const result = Schema.encodeSync(transformer)(ofData)

    // The result should only contain the non-skipped fields
    // The 'number' field should not be present since it was marked as skip
    expect(result).toEqual({
      carrier: 'Verizon',
      e164: '+1234567890',
      first_name: 'John',
      last_name: 'Doe',
    })

    // Verify that the skipped 'number' field is not in the result
    expect('number' in result).toBe(false)
  }),
)

effect('pcoToOf handles multiple skip fields mapping to same target', () =>
  Effect.gen(function* () {
    // Test case where multiple fields map to the same target but all except one are skipped
    const PcoMultiSkip = Schema.Struct({
      name_current: Schema.String.annotations({
        [OfFieldName]: 'name',
      }),
      name_v1: Schema.optional(Schema.String).annotations({
        [OfFieldName]: 'name',
        [OfSkipField]: true,
      }),
      name_v2: Schema.optional(Schema.String).annotations({
        [OfFieldName]: 'name',
        [OfSkipField]: true,
      }),
    })

    const OFMultiSkip = Schema.Struct({
      customFields: Schema.Array(CustomFieldSchema),
      name: Schema.String,
    })

    const transformer = pcoToOf(PcoMultiSkip, OFMultiSkip, 'multiSkip')

    const pcoData = {
      name_current: 'Current Name',
      name_v1: 'Old Name 1',
      name_v2: 'Old Name 2',
    }

    const result = Schema.decodeSync(transformer)(pcoData)

    expect(result).toEqual({
      customFields: [], // Should only use the non-skipped field
      name: 'Current Name',
    })

    // Encode back should only include the non-skipped field
    const encoded = Schema.encodeSync(transformer)(result)
    expect(encoded).toEqual({
      name_current: 'Current Name',
    })
  }),
)

effect('pcoToOf: transforms real PCO person shape to BasePerson (integration test)', () =>
  Effect.gen(function* () {
    const pcoPersonData = {
      accounting_administrator: true,
      anniversary: null,
      avatar: 'https://avatars.planningcenteronline.com/uploads/initials/IF.png',
      birthdate: null,
      child: false,
      created_at: '2020-05-03T12:19:13Z',
      demographic_avatar_url: 'https://avatars.planningcenteronline.com/uploads/initials/IF.png',
      first_name: 'Izak',
      gender: null,
      given_name: null,
      grade: null,
      graduation_year: null,
      inactivated_at: null,
      last_name: 'Filmalter',
      medical_notes: null,
      membership: null,
      middle_name: null,
      name: 'Izak Filmalter',
      nickname: null,
      passed_background_check: false,
      people_permissions: 'Manager',
      remote_id: null,
      school_type: null,
      site_administrator: true,
      status: 'active',
      updated_at: '2025-06-18T15:30:50Z',
    } as const

    // Use the actual transformer from the PCO person schema
    // Import here to avoid circular dependency in test imports
    const transformer = pcoToOf(PcoPersonAttributes, BasePerson, 'person')

    const result = Schema.decodeSync(transformer, { errors: 'all' })(pcoPersonData)

    expect(result).toEqual({
      _tag: 'person',
      anniversary: null,
      avatar: 'https://avatars.planningcenteronline.com/uploads/initials/IF.png',
      birthdate: null,
      createdAt: '2020-05-03T12:19:13Z',
      customFields: [
        {
          _tag: 'boolean',
          name: 'pco_accounting_administrator',
          source: 'pco',
          value: true,
        },
        {
          _tag: 'boolean',
          name: 'pco_child',
          source: 'pco',
          value: false,
        },
        {
          _tag: 'string',
          name: 'pco_demographic_avatar_url',
          source: 'pco',
          value: 'https://avatars.planningcenteronline.com/uploads/initials/IF.png',
        },
        {
          _tag: 'string',
          name: 'pco_given_name',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'number',
          name: 'pco_grade',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'number',
          name: 'pco_graduation_year',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'string',
          name: 'pco_medical_notes',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'string',
          name: 'pco_nickname',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'boolean',
          name: 'pco_passed_background_check',
          source: 'pco',
          value: false,
        },
        {
          _tag: 'string',
          name: 'pco_people_permissions',
          source: 'pco',
          value: 'Manager',
        },
        {
          _tag: 'string',
          name: 'pco_remote_id',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'string',
          name: 'pco_school_type',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'boolean',
          name: 'pco_site_administrator',
          source: 'pco',
          value: true,
        },
      ],
      firstName: 'Izak',
      gender: null,
      inactivatedAt: null,
      lastName: 'Filmalter',
      membership: null,
      middleName: null,
      name: 'Izak Filmalter',
      status: 'active',
      tags: [],
      type: 'default',
      updatedAt: '2025-06-18T15:30:50Z',
    })
  }),
)

effect('pcoToOf: transforms PCO phone number to BasePhoneNumber (integration test)', () =>
  Effect.gen(function* () {
    const pcoPhoneData: PcoPhoneNumberAttributes = {
      carrier: null,
      country_code: 'US',
      created_at: '2025-06-23T19:20:24Z',
      e164: '+17275550198',
      international: '+1 727-555-0198',
      location: 'Mobile',
      national: '(727) 555-0198',
      number: '+17275550198',
      primary: true,
      updated_at: '2025-06-23T19:20:24Z',
    }

    const result = Schema.decodeSync(pcoPhoneNumberTransformer)(pcoPhoneData)

    expect(result).toEqual({
      _tag: 'phoneNumber',
      countryCode: 'US',
      createdAt: '2025-06-23T19:20:24Z',
      customFields: [
        {
          _tag: 'string',
          name: 'pco_carrier',
          source: 'pco',
          value: null,
        },
        {
          _tag: 'string',
          name: 'pco_international',
          source: 'pco',
          value: '+1 727-555-0198',
        },
        {
          _tag: 'string',
          name: 'pco_national',
          source: 'pco',
          value: '(727) 555-0198',
        },
      ],
      location: 'Mobile',
      number: '+17275550198',
      primary: true,
      status: 'active',
      tags: [],
      type: 'default',
      updatedAt: '2025-06-23T19:20:24Z',
    })
  }),
)
