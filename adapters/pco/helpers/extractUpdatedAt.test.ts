import { describe, expect, test } from 'bun:test'
import { extractPcoUpdatedAt } from '@openfaith/pco/helpers/extractUpdatedAt'
import { Option } from 'effect'

describe('extractPcoUpdatedAt', () => {
  test('should extract updated_at from valid PCO response', () => {
    const response = {
      data: {
        attributes: {
          name: 'John Doe',
          updated_at: '2023-12-01T10:30:00Z',
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isSome(result)).toBe(true)
    expect(Option.getOrNull(result)).toBe('2023-12-01T10:30:00Z')
  })

  test('should return None when data is missing', () => {
    const response = {
      meta: { count: 1 },
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isNone(result)).toBe(true)
  })

  test('should return None when attributes is missing', () => {
    const response = {
      data: {
        id: '123',
        type: 'Person',
      },
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isNone(result)).toBe(true)
  })

  test('should return None when updated_at is missing', () => {
    const response = {
      data: {
        attributes: {
          name: 'John Doe',
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isNone(result)).toBe(true)
  })

  test('should return None when updated_at is null', () => {
    const response = {
      data: {
        attributes: {
          name: 'John Doe',
          updated_at: null,
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isNone(result)).toBe(true)
  })

  test('should return None when updated_at is undefined', () => {
    const response = {
      data: {
        attributes: {
          name: 'John Doe',
          updated_at: undefined,
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isNone(result)).toBe(true)
  })

  test('should handle invalid response structure gracefully', () => {
    const invalidResponses = [null, undefined, 'string', 123, [], { invalid: 'structure' }]

    for (const response of invalidResponses) {
      const result = extractPcoUpdatedAt(response)
      expect(Option.isNone(result)).toBe(true)
    }
  })

  test('should handle nested null values', () => {
    const response = {
      data: null,
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isNone(result)).toBe(true)
  })

  test('should handle nested undefined values', () => {
    const response = {
      data: {
        attributes: null,
      },
    }

    const result = extractPcoUpdatedAt(response)

    expect(Option.isNone(result)).toBe(true)
  })
})
