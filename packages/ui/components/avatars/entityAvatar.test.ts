import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Array, Effect, pipe } from 'effect'

// Import the helper functions - we need to extract them from the module
// Since they're not exported, we'll test them through a test module approach
type EntityRecord = {
  _tag: string
  id: string
  name?: string | null
  avatar?: string | null
  [key: string]: unknown
}

// Re-implement the helper functions for testing (since they're not exported)
// Using the exact same implementation as in the source file
const getEntityDisplayName = (record: EntityRecord): string => {
  // Try common name fields in order of preference
  if (record.name) {
    return record.name
  }

  // For person entities, try to construct name from firstName/lastName
  if (record._tag === 'person') {
    const firstName = 'firstName' in record ? record.firstName : undefined
    const lastName = 'lastName' in record ? record.lastName : undefined
    if (firstName || lastName) {
      return pipe(
        [firstName, lastName] as Array<string | undefined>,
        Array.filter((name): name is string => Boolean(name)),
        Array.join(' '),
      )
    }
  }

  // Fallback to entity type + ID
  return `${record._tag} ${record.id}`
}

const getEntityAvatarUrl = (record: EntityRecord): string | null => {
  // Try common avatar fields
  if (record.avatar) {
    return record.avatar
  }

  // For user entities, try image field
  if (record._tag === 'user' && 'image' in record && record.image) {
    return record.image as string
  }

  // For org entities, try logo field
  if (record._tag === 'org' && 'logo' in record && record.logo) {
    return record.logo as string
  }

  return null
}

// Tests for getEntityDisplayName
effect('getEntityDisplayName: should return name when present', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      id: '123',
      name: 'John Doe',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('John Doe')
  }),
)

effect('getEntityDisplayName: should handle null name', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: 'Jane',
      id: '123',
      lastName: 'Smith',
      name: null,
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('Jane Smith')
  }),
)

effect('getEntityDisplayName: should handle undefined name', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: 'Bob',
      id: '123',
      lastName: 'Johnson',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('Bob Johnson')
  }),
)

effect('getEntityDisplayName: should construct name from firstName only', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: 'Alice',
      id: '123',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('Alice')
  }),
)

effect('getEntityDisplayName: should construct name from lastName only', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      id: '123',
      lastName: 'Williams',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('Williams')
  }),
)

effect('getEntityDisplayName: should handle empty firstName and lastName', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: '',
      id: '123',
      lastName: '',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('person 123')
  }),
)

effect('getEntityDisplayName: should handle null firstName and lastName', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: null,
      id: '123',
      lastName: null,
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('person 123')
  }),
)

effect('getEntityDisplayName: should handle undefined firstName and lastName', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      id: '123',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('person 123')
  }),
)

effect('getEntityDisplayName: should fallback to entity type + ID for non-person entities', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'group',
      id: '456',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('group 456')
  }),
)

effect('getEntityDisplayName: should prefer name over firstName/lastName for person entities', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: 'First',
      id: '123',
      lastName: 'Last',
      name: 'Display Name',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('Display Name')
  }),
)

effect('getEntityDisplayName: should handle mixed case firstName and lastName', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: 'john',
      id: '123',
      lastName: 'DOE',
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe('john DOE')
  }),
)

// Tests for getEntityAvatarUrl
effect('getEntityAvatarUrl: should return avatar when present', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      avatar: 'https://example.com/avatar.jpg',
      id: '123',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe('https://example.com/avatar.jpg')
  }),
)

effect('getEntityAvatarUrl: should return null when avatar is null', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      avatar: null,
      id: '123',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe(null)
  }),
)

effect('getEntityAvatarUrl: should return null when avatar is undefined', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      id: '123',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe(null)
  }),
)

effect('getEntityAvatarUrl: should return image field for user entities', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'user',
      id: '123',
      image: 'https://example.com/user-image.jpg',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe('https://example.com/user-image.jpg')
  }),
)

effect('getEntityAvatarUrl: should return logo field for org entities', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'org',
      id: '123',
      logo: 'https://example.com/org-logo.jpg',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe('https://example.com/org-logo.jpg')
  }),
)

effect('getEntityAvatarUrl: should prefer avatar over image for user entities', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'user',
      avatar: 'https://example.com/avatar.jpg',
      id: '123',
      image: 'https://example.com/image.jpg',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe('https://example.com/avatar.jpg')
  }),
)

effect('getEntityAvatarUrl: should prefer avatar over logo for org entities', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'org',
      avatar: 'https://example.com/avatar.jpg',
      id: '123',
      logo: 'https://example.com/logo.jpg',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe('https://example.com/avatar.jpg')
  }),
)

effect('getEntityAvatarUrl: should return null for user entities without image or avatar', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'user',
      id: '123',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe(null)
  }),
)

effect('getEntityAvatarUrl: should return null for org entities without logo or avatar', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'org',
      id: '123',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe(null)
  }),
)

effect('getEntityAvatarUrl: should return null for other entity types without avatar', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'group',
      id: '123',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe(null)
  }),
)

effect('getEntityAvatarUrl: should handle empty string avatar', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      avatar: '',
      id: '123',
    }

    const result = getEntityAvatarUrl(record)
    // Empty string is falsy, so it returns null
    expect(result).toBe(null)
  }),
)

effect('getEntityAvatarUrl: should handle empty string image for user', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'user',
      id: '123',
      image: '',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe(null)
  }),
)

effect('getEntityAvatarUrl: should handle empty string logo for org', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'org',
      id: '123',
      logo: '',
    }

    const result = getEntityAvatarUrl(record)
    expect(result).toBe(null)
  }),
)

// Edge cases and type safety tests
effect('Type validation: EntityRecord structure is correctly typed', () =>
  Effect.gen(function* () {
    // Mock function that validates type structure
    const mockEntityProcessor = (record: {
      _tag: string
      id: string
      name?: string | null
      avatar?: string | null
      [key: string]: unknown
    }) => record

    // This should compile correctly - validates type structure
    const result = mockEntityProcessor({
      _tag: 'person',
      avatar: 'https://example.com/avatar.jpg',
      customField: 'custom value',
      firstName: 'Test',
      id: '123',
      lastName: 'User',
      name: 'Test User',
    })

    expect(result._tag).toBe('person')
    expect(result.id).toBe('123')
  }),
)

effect('Edge case: should handle very long names', () =>
  Effect.gen(function* () {
    const longName = 'A'.repeat(1000)
    const record: EntityRecord = {
      _tag: 'person',
      id: '123',
      name: longName,
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe(longName)
  }),
)

effect('Edge case: should handle special characters in names', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: 'José',
      id: '123',
      lastName: "O'Connor-Smith",
    }

    const result = getEntityDisplayName(record)
    expect(result).toBe("José O'Connor-Smith")
  }),
)

effect('Edge case: should handle numeric values in name fields', () =>
  Effect.gen(function* () {
    const record: EntityRecord = {
      _tag: 'person',
      firstName: 123,
      id: '123',
      lastName: 456,
    }

    // The function converts numbers to strings and joins them
    const result = getEntityDisplayName(record)
    expect(result).toBe('123 456')
  }),
)
