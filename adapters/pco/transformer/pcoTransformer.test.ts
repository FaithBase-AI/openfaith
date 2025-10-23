import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  type PcoPhoneNumberAttributes,
  pcoPhoneNumberTransformer,
} from '@openfaith/pco/modules/people/pcoPhoneNumberSchema'
import { PcoPersonAttributes, pcoPersonPartialTransformer } from '@openfaith/pco/server'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import {
  BasePerson,
  CustomFieldSchema,
  OfCustomField,
  OfDefaultValueFn,
  OfFieldName,
  OfSkipField,
} from '@openfaith/schema'
import { Array, Effect, pipe, Record, Schema, SchemaAST } from 'effect'

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

effect('pcoToOf encode: provides null for missing optional nullable fields', () =>
  Effect.gen(function* () {
    // Test schema with optional fields on OF side but required nullable on PCO side
    const PcoWithNullable = Schema.Struct({
      avatar_url: Schema.NullOr(Schema.String).annotations({
        [OfFieldName]: 'avatar',
      }),
      name: Schema.String.annotations({
        [OfFieldName]: 'name',
      }),
    })

    const OfWithOptional = Schema.Struct({
      avatar: Schema.NullOr(Schema.String).pipe(Schema.optional),
      customFields: Schema.Array(CustomFieldSchema),
      name: Schema.String,
    })

    const transformer = pcoToOf(PcoWithNullable, OfWithOptional, 'withNullable')

    // OF data without the optional avatar field
    const ofData = {
      customFields: [],
      name: 'Test Campus',
      // avatar is missing (optional field)
    }

    // When encoding to PCO, avatar_url should be provided as null
    const result = Schema.encodeSync(transformer)(ofData)

    expect(result).toEqual({
      avatar_url: null,
      name: 'Test Campus',
    })
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

effect('pcoToOf: full PcoPersonAttributes bidirectional transformation test', () =>
  Effect.gen(function* () {
    // Test data representing a full PcoPersonAttributes object - properly typed
    const fullPcoPersonData = {
      accounting_administrator: true,
      anniversary: '2020-06-15',
      avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JD.png',
      birthdate: '1990-03-22',
      child: false,
      created_at: '2020-05-03T12:19:13Z',
      demographic_avatar_url: 'https://avatars.planningcenteronline.com/uploads/initials/JD.png',
      first_name: 'John',
      gender: 'Male' as const, // This matches the literal type
      given_name: 'Johnny',
      grade: 12 as const,
      graduation_year: 2025,
      inactivated_at: null,
      last_name: 'Doe',
      medical_notes: 'No known allergies',
      membership: 'Member',
      middle_name: 'William',
      name: 'John William Doe',
      nickname: 'JD',
      passed_background_check: true,
      people_permissions: 'Editor' as const,
      remote_id: 'external-123',
      school_type: 'High School',
      site_administrator: false,
      status: 'active' as const,
      updated_at: '2025-06-18T15:30:50Z',
    } satisfies PcoPersonAttributes

    // Use the actual transformer
    const transformer = pcoToOf(PcoPersonAttributes, BasePerson, 'person')

    console.log('Starting decode test...')

    // Test decode (PCO → OF)
    const decodedResult = Schema.decodeSync(transformer, { errors: 'all' })(fullPcoPersonData)

    console.log('Decoded result:', JSON.stringify(decodedResult, null, 2))

    // Verify some key transformations
    expect(decodedResult._tag).toBe('person')
    expect(decodedResult.firstName).toBe('John')
    expect(decodedResult.lastName).toBe('Doe')
    expect(decodedResult.middleName).toBe('William')
    expect(decodedResult.gender).toBe('male') // Should be transformed from 'Male' to 'male'
    expect(decodedResult.status).toBe('active')

    // Check that custom fields are properly created
    expect(Array.isArray(decodedResult.customFields)).toBe(true)

    // Find specific custom fields
    const accountingAdminField = pipe(
      decodedResult.customFields,
      Array.findFirst((cf) => cf.name === 'pco_accounting_administrator'),
    )
    expect(accountingAdminField._tag).toBe('Some')
    if (accountingAdminField._tag === 'Some') {
      expect(accountingAdminField.value.value).toBe(true)
      expect(accountingAdminField.value._tag).toBe('boolean')
    }

    const givenNameField = pipe(
      decodedResult.customFields,
      Array.findFirst((cf) => cf.name === 'pco_given_name'),
    )
    expect(givenNameField._tag).toBe('Some')
    if (givenNameField._tag === 'Some') {
      expect(givenNameField.value.value).toBe('Johnny')
      expect(givenNameField.value._tag).toBe('string')
    }

    console.log('Starting encode test...')

    // Test encode (OF → PCO) - this is where we might see annotation issues
    const encodedResult = Schema.encodeSync(transformer, { errors: 'all' })(decodedResult)

    console.log('Encoded result:', JSON.stringify(encodedResult, null, 2))

    // Verify round-trip accuracy for standard fields
    expect(encodedResult.first_name).toBe('John')
    expect(encodedResult.last_name).toBe('Doe')
    expect(encodedResult.middle_name).toBe('William')
    expect(encodedResult.status).toBe('active')
    expect(encodedResult.anniversary).toBe('2020-06-15')
    expect(encodedResult.birthdate).toBe('1990-03-22')

    // Verify custom fields were properly restored
    expect(encodedResult.accounting_administrator).toBe(true)
    expect(encodedResult.given_name).toBe('Johnny')
    expect(encodedResult.grade).toBe(12)
    expect(encodedResult.graduation_year).toBe(2025)
    expect(encodedResult.medical_notes).toBe('No known allergies')
    expect(encodedResult.nickname).toBe('JD')
    expect(encodedResult.passed_background_check).toBe(true)
    expect(encodedResult.people_permissions).toBe('Editor')
    expect(encodedResult.remote_id).toBe('external-123')
    expect(encodedResult.school_type).toBe('High School')
    expect(encodedResult.site_administrator).toBe(false)

    // Check that non-custom fields don't appear in the encoded result unnecessarily
    expect('customFields' in encodedResult).toBe(false)
    expect('_tag' in encodedResult).toBe(false)
    expect('tags' in encodedResult).toBe(false)
    expect('type' in encodedResult).toBe(false)
  }),
)

effect('pcoPersonPartialTransformer: simple encoding test (firstName -> first_name)', () =>
  Effect.gen(function* () {
    // Test the exact issue: {firstName: "George"} should become {first_name: "George"}
    const input = { firstName: 'George' }

    console.log('Input:', JSON.stringify(input, null, 2))

    try {
      const result = Schema.encodeSync(pcoPersonPartialTransformer)(input)
      console.log('Encoded result:', JSON.stringify(result, null, 2))

      // This should work but currently fails
      expect((result as any).first_name).toBe('George')
    } catch (error) {
      console.log('Encoding error:', error)
      throw error
    }
  }),
)

effect('pcoToOf: test union type annotations with people_permissions field', () =>
  Effect.gen(function* () {
    // Specifically test the people_permissions field which has a union type
    // Schema.Union(Schema.Literal('Manager', 'Editor'), Schema.String)
    // Use partial transformer for minimal test data
    const testData = {
      first_name: 'Test',
      last_name: 'User',
      people_permissions: 'Manager' as const,
    }

    console.log('Testing union type field transformation...')

    const decoded = Schema.decodeSync(pcoPersonPartialTransformer)(testData)

    console.log('Decoded result:', JSON.stringify(decoded, null, 2))

    // Should be a custom field since it has OfCustomField: true
    const customFields = decoded.customFields || []
    const permissionsField = pipe(
      customFields,
      Array.findFirst((cf) => cf.name === 'pco_people_permissions'),
    )

    expect(permissionsField._tag).toBe('Some')
    if (permissionsField._tag === 'Some') {
      expect(permissionsField.value.value).toBe('Manager')
      expect(permissionsField.value._tag).toBe('string')
    }

    // Test encoding back
    const encoded = Schema.encodeSync(pcoPersonPartialTransformer)(decoded)
    console.log('Encoded result:', JSON.stringify(encoded, null, 2))
    expect((encoded as any).people_permissions).toBe('Manager')

    // Test with a string value that's not in the literal union
    const testDataCustomString = {
      first_name: 'Test',
      last_name: 'User',
      people_permissions: 'CustomRole',
    }

    const decodedCustom = Schema.decodeSync(pcoPersonPartialTransformer)(testDataCustomString)
    const encodedCustom = Schema.encodeSync(pcoPersonPartialTransformer)(decodedCustom)
    expect((encodedCustom as any).people_permissions).toBe('CustomRole')
  }),
)

effect('pcoToOf handles Schema.optionalWith with default values', () =>
  Effect.gen(function* () {
    // Test schema with optionalWith and default values
    const PcoWithDefaults = Schema.Struct({
      active: Schema.Boolean.annotations({
        [OfFieldName]: 'enabled',
      }),
      adapter: Schema.optionalWith(Schema.String, {
        default: () => 'pco',
      }).annotations({
        [OfFieldName]: 'adapter',
      }),
      name: Schema.String.annotations({
        [OfFieldName]: 'name',
      }),
      verification_method: Schema.optionalWith(Schema.String, {
        default: () => 'hmac-sha256',
      }).annotations({
        [OfFieldName]: 'verificationMethod',
      }),
    })

    const OfWithDefaults = Schema.Struct({
      adapter: Schema.String,
      customFields: Schema.Array(CustomFieldSchema),
      enabled: Schema.Boolean,
      name: Schema.String,
      verificationMethod: Schema.String,
    })

    // Debug: Let's check the AST structure
    console.log('PcoWithDefaults AST fields:')
    const fields = extractFields(PcoWithDefaults)
    Object.entries(fields).forEach(([key, field]) => {
      console.log(`Field: ${key}`)
      console.log('  AST type:', field.ast._tag)
      console.log('  AST:', JSON.stringify(field.ast, null, 2).slice(0, 200))
      const annotation = SchemaAST.getAnnotation(OfFieldName)(field.ast as SchemaAST.Annotated)
      console.log('  OfFieldName annotation:', annotation)
    })

    const transformer = pcoToOf(PcoWithDefaults, OfWithDefaults, 'itemWithDefaults')

    // Test data without the optional fields (they should get defaults)
    const pcoData = {
      active: true,
      name: 'test-webhook',
      // adapter and verification_method are missing, should use defaults
    }

    const result = Schema.decodeSync(transformer)(pcoData)

    expect(result).toEqual({
      adapter: 'pco',
      customFields: [],
      enabled: true,
      name: 'test-webhook',
      verificationMethod: 'hmac-sha256',
    })

    // Test encode back
    const encoded = Schema.encodeSync(transformer)(result)
    expect(encoded).toEqual({
      active: true,
      adapter: 'pco',
      name: 'test-webhook',
      verification_method: 'hmac-sha256',
    })
  }),
)

effect('pcoToOf encode: campus with missing optional fields (real-world scenario)', () =>
  Effect.gen(function* () {
    // Test the real campus scenario from the issue
    const PcoCampusTest = Schema.Struct({
      avatar_url: Schema.NullOr(Schema.String).annotations({
        [OfFieldName]: 'avatar',
      }),
      city: Schema.NullOr(Schema.String).annotations({
        [OfFieldName]: 'city',
      }),
      created_at: Schema.String.annotations({
        [OfFieldName]: 'createdAt',
      }),
      name: Schema.NullOr(Schema.String).annotations({
        [OfFieldName]: 'name',
      }),
      updated_at: Schema.String.annotations({
        [OfFieldName]: 'updatedAt',
      }),
    })

    const OfCampusTest = Schema.Struct({
      avatar: Schema.NullOr(Schema.String).pipe(Schema.optional),
      city: Schema.NullOr(Schema.String).pipe(Schema.optional),
      createdAt: Schema.String,
      customFields: Schema.Array(CustomFieldSchema),
      name: Schema.String,
      updatedAt: Schema.String,
    })

    const transformer = pcoToOf(PcoCampusTest, OfCampusTest, 'campus')

    const ofCampusData = {
      createdAt: '2025-01-01T00:00:00Z',
      customFields: [],
      name: 'Test Campus',
      updatedAt: '2025-01-01T00:00:00Z',
      // avatar and city are missing (optional fields)
    }

    // When encoding to PCO, nullable fields should be provided as null
    const result = Schema.encodeSync(transformer)(ofCampusData)

    expect(result).toEqual({
      avatar_url: null,
      city: null,
      created_at: '2025-01-01T00:00:00Z',
      name: 'Test Campus',
      updated_at: '2025-01-01T00:00:00Z',
    })
  }),
)

effect('pcoToOf encode: handles missing custom fields with appropriate defaults', () =>
  Effect.gen(function* () {
    // Test schema with required custom fields
    const PcoWithCustomFields = Schema.Struct({
      active: Schema.Boolean.annotations({
        [OfFieldName]: 'active',
        [OfCustomField]: true,
      }),
      count: Schema.Number.annotations({
        [OfFieldName]: 'count',
        [OfCustomField]: true,
      }),
      description: Schema.NullOr(Schema.String).annotations({
        [OfFieldName]: 'description',
        [OfCustomField]: true,
      }),
      name: Schema.String.annotations({
        [OfFieldName]: 'name',
      }),
    })

    const OfWithCustomFields = Schema.Struct({
      customFields: Schema.Array(CustomFieldSchema),
      name: Schema.String,
    })

    const transformer = pcoToOf(PcoWithCustomFields, OfWithCustomFields, 'test')

    // OF data with no custom fields
    const ofData = {
      customFields: [],
      name: 'Test',
    }

    // When encoding to PCO, missing custom fields should get defaults:
    // - Boolean: false
    // - Number: 0
    // - Nullable String: null
    const result = Schema.encodeSync(transformer)(ofData)

    expect(result).toEqual({
      active: false,
      count: 0,
      description: null,
      name: 'Test',
    })
  }),
)

effect('pcoToOf encode: preserves existing custom field values', () =>
  Effect.gen(function* () {
    // Test that existing custom fields are preserved and only missing ones get defaults
    const PcoWithCustomFields = Schema.Struct({
      active: Schema.Boolean.annotations({
        [OfFieldName]: 'active',
        [OfCustomField]: true,
      }),
      count: Schema.Number.annotations({
        [OfFieldName]: 'count',
        [OfCustomField]: true,
      }),
      name: Schema.String.annotations({
        [OfFieldName]: 'name',
      }),
    })

    const OfWithCustomFields = Schema.Struct({
      customFields: Schema.Array(CustomFieldSchema),
      name: Schema.String,
    })

    const transformer = pcoToOf(PcoWithCustomFields, OfWithCustomFields, 'test')

    // OF data with one custom field
    const ofData = {
      customFields: [
        {
          _tag: 'boolean' as const,
          name: 'pco_active',
          source: 'pco' as const,
          value: true,
        },
      ],
      name: 'Test',
    }

    // When encoding to PCO, existing custom field should be preserved,
    // missing ones should get defaults
    const result = Schema.encodeSync(transformer)(ofData)

    expect(result).toEqual({
      active: true,
      count: 0,
      name: 'Test',
    })
  }),
)

effect('pcoToOf: Schema.transform with OfDefaultValueFn when field missing from input', () =>
  Effect.gen(function* () {
    // Test schema simulating the Team scenario:
    // - Input data doesn't have a 'type' field
    // - Schema defines 'type' as a transform that always returns 'team'
    // - Has OfDefaultValueFn annotation
    const PcoWithTransform = Schema.Struct({
      name: Schema.String.annotations({
        [OfFieldName]: 'name',
      }),
      type: Schema.transform(Schema.Any, Schema.Literal('team'), {
        decode: () => 'team' as const,
        encode: () => 'team' as const,
      }).annotations({
        [OfFieldName]: 'type',
        [OfDefaultValueFn]: () => 'team',
      }),
    })

    const OfWithType = Schema.Struct({
      customFields: Schema.Array(CustomFieldSchema),
      name: Schema.String,
      type: Schema.String,
    })

    const transformer = pcoToOf(PcoWithTransform, OfWithType, 'test')

    // Input data does NOT have a 'type' field - cast as any to bypass type checking
    const inputData = {
      name: 'Test Team',
    } as any

    console.log('Input data:', JSON.stringify(inputData, null, 2))

    const result = Schema.decodeSync(transformer)(inputData)

    console.log('Decoded result:', JSON.stringify(result, null, 2))

    // The 'type' field should be 'team', not 'default'
    expect(result.type).toBe('team')
    expect(result.name).toBe('Test Team')
  }),
)

// Helper function to extract fields (copied from pcoTransformer.ts for testing)
const extractFields = (schema: Schema.Schema.Any): Record<string, { ast: SchemaAST.AST }> => {
  const ast = schema.ast

  if (ast._tag === 'TypeLiteral') {
    return pipe(
      (ast as any).propertySignatures,
      Array.map((prop: any) => {
        // Merge annotations from both the property and its type
        const fieldAst = {
          ...prop.type,
          annotations: {
            ...(prop.type.annotations || {}),
            ...(prop.annotations || {}), // Property annotations override type annotations
          },
        } as SchemaAST.AST
        return [prop.name as string, { ast: fieldAst }] as const
      }),
      Record.fromEntries,
    )
  }

  if (ast._tag === 'Transformation' && ast.from._tag === 'TypeLiteral') {
    return pipe(
      (ast.from as any).propertySignatures,
      Array.map((prop: any) => {
        // Merge annotations from both the property and its type
        const fieldAst = {
          ...prop.type,
          annotations: {
            ...(prop.type.annotations || {}),
            ...(prop.annotations || {}), // Property annotations override type annotations
          },
        } as SchemaAST.AST
        return [prop.name as string, { ast: fieldAst }] as const
      }),
      Record.fromEntries,
    )
  }

  // Fallback for Schema.Struct types
  if ('fields' in schema) {
    return (schema as any).fields
  }

  return {}
}
