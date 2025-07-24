import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { getEntityId } from '@openfaith/shared/getIds'
import { arrayToCommaSeparatedString, EdgeDirectionSchema } from '@openfaith/shared/schema'
import { Effect, Schema } from 'effect'

// Helper function to decode using the schema
const getEdgeDirection = (idA: string, idB: string) =>
  Schema.decodeUnknownSync(EdgeDirectionSchema)({ idA, idB }) as {
    source: string
    target: string
  }

// Different alpha ranges tests
effect('A-M vs N-Z: A-M should be source', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('abc123', 'xyz789')
    expect(result).toEqual({ source: 'abc123', target: 'xyz789' })
  }),
)

effect('N-Z vs A-M: A-M should be source', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('xyz789', 'abc123')
    expect(result).toEqual({ source: 'abc123', target: 'xyz789' })
  }),
)

effect('Edge case: m vs n', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('m123', 'n456')
    expect(result).toEqual({ source: 'm123', target: 'n456' })
  }),
)

effect('Edge case: a vs z', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('a123', 'z456')
    expect(result).toEqual({ source: 'a123', target: 'z456' })
  }),
)

// Same alpha range tests
effect('Both A-M: lexicographic order', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('abc123', 'def456')
    expect(result).toEqual({ source: 'abc123', target: 'def456' })
  }),
)

effect('Both N-Z: lexicographic order', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('xyz789', 'uvw012')
    expect(result).toEqual({ source: 'uvw012', target: 'xyz789' })
  }),
)

effect('Both A-M: reverse lexicographic order', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('def456', 'abc123')
    expect(result).toEqual({ source: 'abc123', target: 'def456' })
  }),
)

effect('Both N-Z: reverse lexicographic order', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('uvw012', 'xyz789')
    expect(result).toEqual({ source: 'uvw012', target: 'xyz789' })
  }),
)

// Self-linking tests
effect('Identical IDs should allow self-linking', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('abc123', 'abc123')
    expect(result).toEqual({ source: 'abc123', target: 'abc123' })
  }),
)

effect('Self-linking with different ID patterns', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('xyz789', 'xyz789')
    expect(result).toEqual({ source: 'xyz789', target: 'xyz789' })
  }),
)

effect('Self-linking with entity IDs', () =>
  Effect.gen(function* () {
    const personId = getEntityId('person')
    const result = getEdgeDirection(personId, personId)
    expect(result).toEqual({ source: personId, target: personId })
  }),
)

// Error cases tests
effect('Empty first ID should fail', () =>
  Effect.gen(function* () {
    expect(() => getEdgeDirection('', 'abc123')).toThrow()
  }),
)

effect('Empty second ID should fail', () =>
  Effect.gen(function* () {
    expect(() => getEdgeDirection('abc123', '')).toThrow()
  }),
)

effect('Both empty IDs should fail', () =>
  Effect.gen(function* () {
    expect(() => getEdgeDirection('', '')).toThrow()
  }),
)

effect('Invalid input type should fail', () =>
  Effect.gen(function* () {
    expect(() => Schema.decodeUnknownSync(EdgeDirectionSchema)({ idA: 123, idB: 'abc' })).toThrow()
  }),
)

effect('Missing field should fail', () =>
  Effect.gen(function* () {
    expect(() => Schema.decodeUnknownSync(EdgeDirectionSchema)({ idA: 'abc123' })).toThrow()
  }),
)

// Encoding (reverse transformation) tests
effect('Should encode back to input format', () =>
  Effect.gen(function* () {
    const encoded = Schema.encodeSync(EdgeDirectionSchema)({
      source: 'abc123',
      target: 'xyz789',
    })
    expect(encoded).toEqual({ idA: 'abc123', idB: 'xyz789' })
  }),
)

effect('Should handle reverse encoding', () =>
  Effect.gen(function* () {
    const encoded = Schema.encodeSync(EdgeDirectionSchema)({
      source: 'xyz789',
      target: 'abc123',
    })
    expect(encoded).toEqual({ idA: 'xyz789', idB: 'abc123' })
  }),
)

effect('Should encode self-linking', () =>
  Effect.gen(function* () {
    const encoded = Schema.encodeSync(EdgeDirectionSchema)({
      source: 'abc123',
      target: 'abc123',
    })
    expect(encoded).toEqual({ idA: 'abc123', idB: 'abc123' })
  }),
)

// Roundtrip consistency tests
effect('Decode then encode should be consistent', () =>
  Effect.gen(function* () {
    const original = { idA: 'abc123', idB: 'xyz789' }
    const decoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(original)
    const encoded = Schema.encodeSync(EdgeDirectionSchema)(decoded)

    // Note: The encoded result might not match the original input due to the transformation logic
    // but should be a valid input that produces the same decoded result
    const reDecoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(encoded)
    expect(reDecoded).toEqual(decoded)
  }),
)

effect('Self-linking roundtrip consistency', () =>
  Effect.gen(function* () {
    const original = { idA: 'abc123', idB: 'abc123' }
    const decoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(original)
    const encoded = Schema.encodeSync(EdgeDirectionSchema)(decoded)
    const reDecoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(encoded)

    expect(reDecoded).toEqual(decoded)
    expect(encoded).toEqual(original)
  }),
)

// Alpha range logic tests
effect('Case insensitive: uppercase A-M', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('ABC123', 'xyz789')
    expect(result).toEqual({ source: 'ABC123', target: 'xyz789' })
  }),
)

effect('Case insensitive: uppercase N-Z', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('XYZ789', 'abc123')
    expect(result).toEqual({ source: 'abc123', target: 'XYZ789' })
  }),
)

effect('Mixed case handling', () =>
  Effect.gen(function* () {
    const result = getEdgeDirection('AbC123', 'XyZ789')
    expect(result).toEqual({ source: 'AbC123', target: 'XyZ789' })
  }),
)

// Self-linking scenarios tests
effect('Two person entities should link correctly', () =>
  Effect.gen(function* () {
    const personId1 = getEntityId('person')
    const personId2 = getEntityId('person')

    const result = getEdgeDirection(personId1, personId2)

    // Both should start with 'per_' so they're in the same alpha range
    // The result should be determined by full string comparison
    const expected =
      personId1 < personId2
        ? { source: personId1, target: personId2 }
        : { source: personId2, target: personId1 }

    expect(result).toEqual(expected)
  }),
)

effect('Two address entities should link correctly', () =>
  Effect.gen(function* () {
    const addressId1 = getEntityId('address')
    const addressId2 = getEntityId('address')

    const result = getEdgeDirection(addressId1, addressId2)

    // Both should start with 'add_' so they're in the same alpha range
    // The result should be determined by full string comparison
    const expected =
      addressId1 < addressId2
        ? { source: addressId1, target: addressId2 }
        : { source: addressId2, target: addressId1 }

    expect(result).toEqual(expected)
  }),
)

effect('Same entity type with different alpha ranges', () =>
  Effect.gen(function* () {
    // Create IDs that would be in different ranges if we only looked at first character
    // but are actually the same entity type
    const result = getEdgeDirection('add_123abc', 'add_456xyz')

    // Both start with 'add_' so same range, should use full string comparison
    expect(result).toEqual({ source: 'add_123abc', target: 'add_456xyz' })
  }),
)

effect('Mixed entity types in same alpha range', () =>
  Effect.gen(function* () {
    const addressId = getEntityId('address') // starts with 'add_'
    const result = getEdgeDirection(addressId, 'abc123')

    // Both in A-M range, should use full string comparison
    const expected =
      addressId < 'abc123'
        ? { source: addressId, target: 'abc123' }
        : { source: 'abc123', target: addressId }

    expect(result).toEqual(expected)
  }),
)

// Test arrayToCommaSeparatedString schema transformation
effect('arrayToCommaSeparatedString should decode comma-separated strings to arrays', () =>
  Effect.gen(function* () {
    // Create schema for string literals
    const stringSchema = arrayToCommaSeparatedString(Schema.String)

    // Test basic comma-separated string
    const result1 = Schema.decodeUnknownSync(stringSchema)('apple,banana,cherry')
    expect(result1).toEqual(['apple', 'banana', 'cherry'])

    // Test single item
    const result2 = Schema.decodeUnknownSync(stringSchema)('single')
    expect(result2).toEqual(['single'])

    // Test empty string
    const result3 = Schema.decodeUnknownSync(stringSchema)('')
    expect(result3).toEqual([''])

    // Test with spaces (should preserve them)
    const result4 = Schema.decodeUnknownSync(stringSchema)('item1, item2 , item3')
    expect(result4).toEqual(['item1', ' item2 ', ' item3'])
  }),
)

effect('arrayToCommaSeparatedString should encode arrays to comma-separated strings', () =>
  Effect.gen(function* () {
    const stringSchema = arrayToCommaSeparatedString(Schema.String)

    // Test basic array encoding
    const result1 = Schema.encodeSync(stringSchema)(['apple', 'banana', 'cherry'])
    expect(result1).toBe('apple,banana,cherry')

    // Test single item array
    const result2 = Schema.encodeSync(stringSchema)(['single'])
    expect(result2).toBe('single')

    // Test empty array
    const result3 = Schema.encodeSync(stringSchema)([])
    expect(result3).toBe('')

    // Test array with spaces
    const result4 = Schema.encodeSync(stringSchema)(['item1', ' item2 ', ' item3'])
    expect(result4).toBe('item1, item2 , item3')
  }),
)

effect('arrayToCommaSeparatedString should work with string literals only', () =>
  Effect.gen(function* () {
    // The function only works with strings since it just splits by comma
    const stringSchema = arrayToCommaSeparatedString(Schema.String)

    // Test decoding string numbers (they remain as strings)
    const result1 = Schema.decodeUnknownSync(stringSchema)('1,2,3,4,5')
    expect(result1).toEqual(['1', '2', '3', '4', '5'])

    // Test encoding strings
    const result2 = Schema.encodeSync(stringSchema)(['10', '20', '30'])
    expect(result2).toBe('10,20,30')

    // Test single string
    const result3 = Schema.decodeUnknownSync(stringSchema)('42')
    expect(result3).toEqual(['42'])
  }),
)

effect('arrayToCommaSeparatedString behavior with type casting', () =>
  Effect.gen(function* () {
    // The function splits by comma but does not parse individual elements
    const stringSchema = arrayToCommaSeparatedString(Schema.String)

    // Test that boolean-like strings remain as strings
    const result1 = Schema.decodeUnknownSync(stringSchema)('true,false,true')
    expect(result1).toEqual(['true', 'false', 'true'])

    // Test encoding string representations
    const result2 = Schema.encodeSync(stringSchema)(['false', 'true', 'false'])
    expect(result2).toBe('false,true,false')
  }),
)

effect('arrayToCommaSeparatedString should handle roundtrip consistency', () =>
  Effect.gen(function* () {
    const stringSchema = arrayToCommaSeparatedString(Schema.String)

    // Test roundtrip: string -> array -> string
    const originalString = 'item1,item2,item3'
    const decoded = Schema.decodeUnknownSync(stringSchema)(originalString)
    const encoded = Schema.encodeSync(stringSchema)(decoded)
    expect(encoded).toBe(originalString)

    // Test roundtrip: array -> string -> array
    const originalArray = ['test1', 'test2', 'test3']
    const encodedString = Schema.encodeSync(stringSchema)(originalArray)
    const decodedArray = Schema.decodeUnknownSync(stringSchema)(encodedString)
    expect(decodedArray).toEqual(originalArray)
  }),
)

effect('arrayToCommaSeparatedString should handle edge cases', () =>
  Effect.gen(function* () {
    const stringSchema = arrayToCommaSeparatedString(Schema.String)

    // Test string with commas in values (limitation of this approach)
    const result1 = Schema.decodeUnknownSync(stringSchema)('item,with,comma,another')
    expect(result1).toEqual(['item', 'with', 'comma', 'another'])

    // Test multiple consecutive commas
    const result2 = Schema.decodeUnknownSync(stringSchema)('a,,b,,,c')
    expect(result2).toEqual(['a', '', 'b', '', '', 'c'])

    // Test leading/trailing commas
    const result3 = Schema.decodeUnknownSync(stringSchema)(',start,end,')
    expect(result3).toEqual(['', 'start', 'end', ''])
  }),
)

effect('arrayToCommaSeparatedString should fail with invalid input types', () =>
  Effect.gen(function* () {
    const stringSchema = arrayToCommaSeparatedString(Schema.String)

    // Test that non-string input fails during decode
    expect(() => Schema.decodeUnknownSync(stringSchema)(123)).toThrow()
    expect(() => Schema.decodeUnknownSync(stringSchema)(null)).toThrow()
    expect(() => Schema.decodeUnknownSync(stringSchema)(undefined)).toThrow()
    expect(() => Schema.decodeUnknownSync(stringSchema)({})).toThrow()
  }),
)

effect('arrayToCommaSeparatedString should work with literal schemas', () =>
  Effect.gen(function* () {
    // Test with specific literal values
    const statusSchema = arrayToCommaSeparatedString(
      Schema.Literal('active', 'inactive', 'pending'),
    )

    // Test valid literals
    const result1 = Schema.decodeUnknownSync(statusSchema)('active,inactive,pending')
    expect(result1).toEqual(['active', 'inactive', 'pending'])

    // Test encoding literals
    const result2 = Schema.encodeSync(statusSchema)(['pending', 'active'])
    expect(result2).toBe('pending,active')

    // Test invalid literal should fail
    expect(() => Schema.decodeUnknownSync(statusSchema)('active,invalid,pending')).toThrow()
  }),
)
