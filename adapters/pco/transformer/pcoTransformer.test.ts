import { expect, test } from 'bun:test'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { CustomFieldSchema, OFSkipField, OfCustomField, OfFieldName } from '@openfaith/schema'
import { Schema } from 'effect'

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
    [OFSkipField]: true,
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

test('pcoToOf decode: transforms PCO data to OF format', () => {
  const transformer = pcoToOf(PcoItem, OfItem)
  const result = Schema.decodeSync(transformer)(pcoTestData)

  expect(result).toEqual(ofTestData)
})

test('pcoToOf encode: transforms OF data back to PCO format', () => {
  const transformer = pcoToOf(PcoItem, OfItem)
  const result = Schema.encodeSync(transformer)(ofTestData)

  expect(result).toEqual(pcoTestData)
})

test('pcoToOf handles null values correctly', () => {
  const transformer = pcoToOf(PcoItem, OfItem)

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
})

test('pcoToOf handles missing fields correctly', () => {
  const transformer = pcoToOf(PcoItem, OfItem)

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
})

test('pcoToOf skips fields marked with OFSkipField', () => {
  const transformer = pcoToOf(PcoItemWithSkipField, OfItemWithPhone)

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
})

test('pcoToOf encode works correctly when skipped field exists in original data', () => {
  const transformer = pcoToOf(PcoItemWithSkipField, OfItemWithPhone)

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
})

test('pcoToOf handles multiple skip fields mapping to same target', () => {
  // Test case where multiple fields map to the same target but all except one are skipped
  const PcoMultiSkip = Schema.Struct({
    name_current: Schema.String.annotations({
      [OfFieldName]: 'name',
    }),
    name_v1: Schema.optional(Schema.String).annotations({
      [OfFieldName]: 'name',
      [OFSkipField]: true,
    }),
    name_v2: Schema.optional(Schema.String).annotations({
      [OfFieldName]: 'name',
      [OFSkipField]: true,
    }),
  })

  const OFMultiSkip = Schema.Struct({
    customFields: Schema.Array(CustomFieldSchema),
    name: Schema.String,
  })

  const transformer = pcoToOf(PcoMultiSkip, OFMultiSkip)

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
})
