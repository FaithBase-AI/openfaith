import { describe, expect, test } from 'bun:test'
import { getEntityId } from '@openfaith/shared'
import { Schema } from 'effect'
import { EdgeDirectionSchema } from './edgeSchema'

describe('EdgeDirectionSchema', () => {
  // Helper function to decode using the schema
  const getEdgeDirection = (idA: string, idB: string) =>
    Schema.decodeUnknownSync(EdgeDirectionSchema)({ idA, idB }) as {
      source: string
      target: string
    }

  describe('Different alpha ranges', () => {
    test('A-M vs N-Z: A-M should be source', () => {
      const result = getEdgeDirection('abc123', 'xyz789')
      expect(result).toEqual({ source: 'abc123', target: 'xyz789' })
    })

    test('N-Z vs A-M: A-M should be source', () => {
      const result = getEdgeDirection('xyz789', 'abc123')
      expect(result).toEqual({ source: 'abc123', target: 'xyz789' })
    })

    test('Edge case: m vs n', () => {
      const result = getEdgeDirection('m123', 'n456')
      expect(result).toEqual({ source: 'm123', target: 'n456' })
    })

    test('Edge case: a vs z', () => {
      const result = getEdgeDirection('a123', 'z456')
      expect(result).toEqual({ source: 'a123', target: 'z456' })
    })
  })

  describe('Same alpha range', () => {
    test('Both A-M: lexicographic order', () => {
      const result = getEdgeDirection('abc123', 'def456')
      expect(result).toEqual({ source: 'abc123', target: 'def456' })
    })

    test('Both N-Z: lexicographic order', () => {
      const result = getEdgeDirection('xyz789', 'uvw012')
      expect(result).toEqual({ source: 'uvw012', target: 'xyz789' })
    })

    test('Both A-M: reverse lexicographic order', () => {
      const result = getEdgeDirection('def456', 'abc123')
      expect(result).toEqual({ source: 'abc123', target: 'def456' })
    })

    test('Both N-Z: reverse lexicographic order', () => {
      const result = getEdgeDirection('uvw012', 'xyz789')
      expect(result).toEqual({ source: 'uvw012', target: 'xyz789' })
    })
  })

  describe('Self-linking', () => {
    test('Identical IDs should allow self-linking', () => {
      const result = getEdgeDirection('abc123', 'abc123')
      expect(result).toEqual({ source: 'abc123', target: 'abc123' })
    })

    test('Self-linking with different ID patterns', () => {
      const result = getEdgeDirection('xyz789', 'xyz789')
      expect(result).toEqual({ source: 'xyz789', target: 'xyz789' })
    })

    test('Self-linking with entity IDs', () => {
      const personId = getEntityId('person')
      const result = getEdgeDirection(personId, personId)
      expect(result).toEqual({ source: personId, target: personId })
    })
  })

  describe('Error cases', () => {
    test('Empty first ID should fail', () => {
      expect(() => getEdgeDirection('', 'abc123')).toThrow()
    })

    test('Empty second ID should fail', () => {
      expect(() => getEdgeDirection('abc123', '')).toThrow()
    })

    test('Both empty IDs should fail', () => {
      expect(() => getEdgeDirection('', '')).toThrow()
    })

    test('Invalid input type should fail', () => {
      expect(() =>
        Schema.decodeUnknownSync(EdgeDirectionSchema)({ idA: 123, idB: 'abc' }),
      ).toThrow()
    })

    test('Missing field should fail', () => {
      expect(() => Schema.decodeUnknownSync(EdgeDirectionSchema)({ idA: 'abc123' })).toThrow()
    })
  })

  describe('Encoding (reverse transformation)', () => {
    test('Should encode back to input format', () => {
      const encoded = Schema.encodeSync(EdgeDirectionSchema)({ source: 'abc123', target: 'xyz789' })
      expect(encoded).toEqual({ idA: 'abc123', idB: 'xyz789' })
    })

    test('Should handle reverse encoding', () => {
      const encoded = Schema.encodeSync(EdgeDirectionSchema)({ source: 'xyz789', target: 'abc123' })
      expect(encoded).toEqual({ idA: 'xyz789', idB: 'abc123' })
    })

    test('Should encode self-linking', () => {
      const encoded = Schema.encodeSync(EdgeDirectionSchema)({ source: 'abc123', target: 'abc123' })
      expect(encoded).toEqual({ idA: 'abc123', idB: 'abc123' })
    })
  })

  describe('Roundtrip consistency', () => {
    test('Decode then encode should be consistent', () => {
      const original = { idA: 'abc123', idB: 'xyz789' }
      const decoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(original)
      const encoded = Schema.encodeSync(EdgeDirectionSchema)(decoded)

      // Note: The encoded result might not match the original input due to the transformation logic
      // but should be a valid input that produces the same decoded result
      const reDecoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(encoded)
      expect(reDecoded).toEqual(decoded)
    })

    test('Self-linking roundtrip consistency', () => {
      const original = { idA: 'abc123', idB: 'abc123' }
      const decoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(original)
      const encoded = Schema.encodeSync(EdgeDirectionSchema)(decoded)
      const reDecoded = Schema.decodeUnknownSync(EdgeDirectionSchema)(encoded)

      expect(reDecoded).toEqual(decoded)
      expect(encoded).toEqual(original)
    })
  })

  describe('Alpha range logic', () => {
    test('Case insensitive: uppercase A-M', () => {
      const result = getEdgeDirection('ABC123', 'xyz789')
      expect(result).toEqual({ source: 'ABC123', target: 'xyz789' })
    })

    test('Case insensitive: uppercase N-Z', () => {
      const result = getEdgeDirection('XYZ789', 'abc123')
      expect(result).toEqual({ source: 'abc123', target: 'XYZ789' })
    })

    test('Mixed case handling', () => {
      const result = getEdgeDirection('AbC123', 'XyZ789')
      expect(result).toEqual({ source: 'AbC123', target: 'XyZ789' })
    })
  })

  describe('Self-linking scenarios', () => {
    test('Two person entities should link correctly', () => {
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
    })

    test('Two address entities should link correctly', () => {
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
    })

    test('Same entity type with different alpha ranges', () => {
      // Create IDs that would be in different ranges if we only looked at first character
      // but are actually the same entity type
      const result = getEdgeDirection('add_123abc', 'add_456xyz')

      // Both start with 'add_' so same range, should use full string comparison
      expect(result).toEqual({ source: 'add_123abc', target: 'add_456xyz' })
    })

    test('Mixed entity types in same alpha range', () => {
      const addressId = getEntityId('address') // starts with 'add_'
      const result = getEdgeDirection(addressId, 'abc123')

      // Both in A-M range, should use full string comparison
      const expected =
        addressId < 'abc123'
          ? { source: addressId, target: 'abc123' }
          : { source: 'abc123', target: addressId }

      expect(result).toEqual(expected)
    })
  })
})
