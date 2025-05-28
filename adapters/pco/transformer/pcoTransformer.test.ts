import { expect, test } from 'bun:test'
import { pcoToOf } from '@openfaith/pco/transformer/pcoTransformer'
import { CustomFieldSchema, OFCustomField, OFFieldName, OFSkipField } from '@openfaith/schema'
import { Schema } from 'effect'

const PCOItem = Schema.Struct({
  first_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'firstName',
  }),
  last_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'lastName',
  }),
  middle_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'middleName',
    [OFCustomField]: true,
  }),
})
type PCOItem = typeof PCOItem.Type

const OFItem = Schema.Struct({
  firstName: Schema.NullOr(Schema.String),
  lastName: Schema.NullOr(Schema.String),
  customFields: Schema.Array(CustomFieldSchema),
})
type OFItem = typeof OFItem.Type

// New schema to test OFSkipField functionality
const PCOItemWithSkipField = Schema.Struct({
  first_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'firstName',
  }),
  last_name: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'lastName',
  }),
  // e164 field maps to phoneNumber and should be used
  e164: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'phoneNumber',
  }),
  // number field also maps to phoneNumber but should be skipped
  number: Schema.optional(Schema.String).annotations({
    [OFFieldName]: 'phoneNumber',
    [OFSkipField]: true,
  }),
  // A custom field that should still work normally
  carrier: Schema.NullOr(Schema.String).annotations({
    [OFFieldName]: 'carrier',
    [OFCustomField]: true,
  }),
})
type PCOItemWithSkipField = typeof PCOItemWithSkipField.Type

const OFItemWithPhone = Schema.Struct({
  firstName: Schema.NullOr(Schema.String),
  lastName: Schema.NullOr(Schema.String),
  phoneNumber: Schema.NullOr(Schema.String),
  customFields: Schema.Array(CustomFieldSchema),
})
type OFItemWithPhone = typeof OFItemWithPhone.Type

const pcoTestData: PCOItem = {
  first_name: 'Foo',
  middle_name: 'Yeet',
  last_name: 'Bar',
}

const ofTestData: OFItem = {
  firstName: 'Foo',
  lastName: 'Bar',
  customFields: [
    {
      _tag: 'string',
      source: 'pco',
      name: 'pco_middle_name',
      value: 'Yeet',
    },
  ],
}

test('pcoToOf decode: transforms PCO data to OF format', () => {
  const transformer = pcoToOf(PCOItem, OFItem)
  const result = Schema.decodeSync(transformer)(pcoTestData)

  expect(result).toEqual(ofTestData)
})

test('pcoToOf encode: transforms OF data back to PCO format', () => {
  const transformer = pcoToOf(PCOItem, OFItem)
  const result = Schema.encodeSync(transformer)(ofTestData)

  expect(result).toEqual(pcoTestData)
})

test('pcoToOf handles null values correctly', () => {
  const transformer = pcoToOf(PCOItem, OFItem)

  const pcoWithNulls: PCOItem = {
    first_name: 'Foo',
    middle_name: null,
    last_name: null,
  }

  const expectedOF: OFItem = {
    firstName: 'Foo',
    lastName: null,
    customFields: [
      {
        _tag: 'string',
        source: 'pco',
        name: 'pco_middle_name',
        value: null,
      },
    ],
  }

  const result = Schema.decodeSync(transformer)(pcoWithNulls)
  expect(result).toEqual(expectedOF)
})

test('pcoToOf handles missing fields correctly', () => {
  const transformer = pcoToOf(PCOItem, OFItem)

  const pcoPartial: PCOItem = {
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
      source: 'pco',
      name: 'pco_middle_name',
      value: null,
    },
  ])

  const backToPco = Schema.encodeSync(transformer)(result)
  expect(backToPco).toEqual(pcoPartial)
})

test('pcoToOf skips fields marked with OFSkipField', () => {
  const transformer = pcoToOf(PCOItemWithSkipField, OFItemWithPhone)

  const pcoTestData: PCOItemWithSkipField = {
    first_name: 'John',
    last_name: 'Doe',
    e164: '+1234567890', // This should be used for phoneNumber
    number: '123-456-7890', // This should be skipped
    carrier: 'Verizon',
  }

  const expectedOF: OFItemWithPhone = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890', // Should come from e164, not number
    customFields: [
      {
        _tag: 'string',
        source: 'pco',
        name: 'pco_carrier',
        value: 'Verizon',
      },
    ],
  }

  const result = Schema.decodeSync(transformer)(pcoTestData)
  expect(result).toEqual(expectedOF)
})

test('pcoToOf encode works correctly when skipped field exists in original data', () => {
  const transformer = pcoToOf(PCOItemWithSkipField, OFItemWithPhone)

  const ofData: OFItemWithPhone = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    customFields: [
      {
        _tag: 'string',
        source: 'pco',
        name: 'pco_carrier',
        value: 'Verizon',
      },
    ],
  }

  const result = Schema.encodeSync(transformer)(ofData)

  // The result should only contain the non-skipped fields
  // The 'number' field should not be present since it was marked as skip
  expect(result).toEqual({
    first_name: 'John',
    last_name: 'Doe',
    e164: '+1234567890',
    carrier: 'Verizon',
  })

  // Verify that the skipped 'number' field is not in the result
  expect('number' in result).toBe(false)
})

test('pcoToOf handles multiple skip fields mapping to same target', () => {
  // Test case where multiple fields map to the same target but all except one are skipped
  const PCOMultiSkip = Schema.Struct({
    name_v1: Schema.optional(Schema.String).annotations({
      [OFFieldName]: 'name',
      [OFSkipField]: true,
    }),
    name_v2: Schema.optional(Schema.String).annotations({
      [OFFieldName]: 'name',
      [OFSkipField]: true,
    }),
    name_current: Schema.String.annotations({
      [OFFieldName]: 'name',
    }),
  })

  const OFMultiSkip = Schema.Struct({
    name: Schema.String,
    customFields: Schema.Array(CustomFieldSchema),
  })

  const transformer = pcoToOf(PCOMultiSkip, OFMultiSkip)

  const pcoData = {
    name_v1: 'Old Name 1',
    name_v2: 'Old Name 2',
    name_current: 'Current Name',
  }

  const result = Schema.decodeSync(transformer)(pcoData)

  expect(result).toEqual({
    name: 'Current Name', // Should only use the non-skipped field
    customFields: [],
  })

  // Encode back should only include the non-skipped field
  const encoded = Schema.encodeSync(transformer)(result)
  expect(encoded).toEqual({
    name_current: 'Current Name',
  })
})
