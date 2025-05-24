import { test, expect } from 'bun:test'
import { Schema } from 'effect'
import { pcoToOf } from './pcoTransformer'
import { CustomFieldSchema } from '@openfaith/schema/customFieldsSchema'
import { OFCustomField } from '@openfaith/schema'
import { OFFieldName } from '@openfaith/schema'

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
