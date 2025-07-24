import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { getEntityId, getIdType } from '@openfaith/shared/getIds'
import { mkEntityType } from '@openfaith/shared/string'
import { Effect } from 'effect'

// Test getIdType function
effect('getIdType should extract type from ID correctly', () =>
  Effect.gen(function* () {
    // Test basic ID format
    expect(getIdType('user_123abc')).toBe('user')
    expect(getIdType('person_456def')).toBe('person')
    expect(getIdType('group_789ghi')).toBe('group')
    expect(getIdType('address_012jkl')).toBe('address')
    expect(getIdType('organization_345mno')).toBe('organization')
  }),
)

// Test getIdType with different ID formats
effect('getIdType should handle various ID formats', () =>
  Effect.gen(function* () {
    // Test with multiple underscores
    expect(getIdType('user_profile_123')).toBe('user')
    expect(getIdType('admin_user_456')).toBe('admin')

    // Test with single character type
    expect(getIdType('a_123')).toBe('a')
    expect(getIdType('x_456')).toBe('x')

    // Test with longer type names
    expect(getIdType('organization_member_789')).toBe('organization')
    expect(getIdType('church_management_system_012')).toBe('church')
  }),
)

// Test getIdType edge cases
effect('getIdType should handle edge cases', () =>
  Effect.gen(function* () {
    // Test ID without underscore (should return the whole string)
    expect(getIdType('nounderscore')).toBe('nounderscore')

    // Test empty string
    expect(getIdType('')).toBe('')

    // Test ID starting with underscore
    expect(getIdType('_123')).toBe('')

    // Test ID with only underscore
    expect(getIdType('_')).toBe('')
  }),
)

// Test getEntityId function
effect('getEntityId should generate correct entity IDs', () =>
  Effect.gen(function* () {
    // Test basic entity names
    const personId = getEntityId('person')
    const groupId = getEntityId('group')
    const addressId = getEntityId('address')

    // All IDs should be strings
    expect(typeof personId).toBe('string')
    expect(typeof groupId).toBe('string')
    expect(typeof addressId).toBe('string')

    // All IDs should contain underscores (typeid format)
    expect(personId).toContain('_')
    expect(groupId).toContain('_')
    expect(addressId).toContain('_')

    // IDs should start with the singularized entity name
    expect(personId.startsWith('person_')).toBe(true)
    expect(groupId.startsWith('group_')).toBe(true)
    expect(addressId.startsWith('address_')).toBe(true)
  }),
)

// Test getEntityId with plural entity names
effect('getEntityId should singularize plural entity names', () =>
  Effect.gen(function* () {
    // Test plurals that should be singularized
    const peopleId = getEntityId('people')
    const groupsId = getEntityId('groups')
    const addressesId = getEntityId('addresses')
    const childrenId = getEntityId('children')

    // Should be singularized
    expect(peopleId.startsWith('person_')).toBe(true)
    expect(groupsId.startsWith('group_')).toBe(true)
    expect(addressesId.startsWith('address_')).toBe(true)
    expect(childrenId.startsWith('child_')).toBe(true)
  }),
)

// Test getEntityId with case transformations
effect('getEntityId should handle case transformations correctly', () =>
  Effect.gen(function* () {
    // Test snake_case to PascalCase transformation
    const userProfileId = getEntityId('user_profile')
    const churchMemberId = getEntityId('church_member')
    const organizationSettingId = getEntityId('organization_setting')

    // Should transform snake_case to PascalCase, then lowercase, then singularize
    expect(userProfileId.startsWith('userprofile_')).toBe(true)
    expect(churchMemberId.startsWith('churchmember_')).toBe(true)
    expect(organizationSettingId.startsWith('organizationsetting_')).toBe(true)
  }),
)

// Test getEntityId with mixed case inputs
effect('getEntityId should handle mixed case inputs', () =>
  Effect.gen(function* () {
    // Test various case formats
    const camelCaseId = getEntityId('userProfile')
    const pascalCaseId = getEntityId('UserProfile')
    const upperCaseId = getEntityId('USER_PROFILE')
    const mixedCaseId = getEntityId('User_Profile')

    // All should be normalized to lowercase
    expect(camelCaseId.startsWith('userprofile_')).toBe(true)
    expect(pascalCaseId.startsWith('userprofile_')).toBe(true)
    expect(upperCaseId.startsWith('userprofile_')).toBe(true)
    expect(mixedCaseId.startsWith('userprofile_')).toBe(true)
  }),
)

// Test getEntityId uniqueness
effect('getEntityId should generate unique IDs', () =>
  Effect.gen(function* () {
    // Generate multiple IDs for the same entity
    const id1 = getEntityId('person')
    const id2 = getEntityId('person')
    const id3 = getEntityId('person')

    // All should be different (typeid generates unique IDs)
    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)

    // But all should have the same prefix
    const prefix1 = id1.split('_')[0] || ''
    const prefix2 = id2.split('_')[0] || ''
    const prefix3 = id3.split('_')[0] || ''
    expect(prefix1).toBe(prefix2)
    expect(prefix2).toBe(prefix3)
  }),
)

// Test getEntityId with valid entity names
effect('getEntityId should handle valid entity names', () =>
  Effect.gen(function* () {
    // Test entities with valid characters (letters and underscores only)
    const entity1Id = getEntityId('user_profile')
    const entity2Id = getEntityId('test_entity')
    const entity3Id = getEntityId('organization_member')

    // Should generate valid IDs
    expect(typeof entity1Id).toBe('string')
    expect(typeof entity2Id).toBe('string')
    expect(typeof entity3Id).toBe('string')

    expect(entity1Id).toContain('_')
    expect(entity2Id).toContain('_')
    expect(entity3Id).toContain('_')
  }),
)

// Test roundtrip: getEntityId -> getIdType
effect('getIdType should extract type from getEntityId result', () =>
  Effect.gen(function* () {
    // Test that we can extract the type from generated IDs
    const entities = ['person', 'group', 'address', 'organization', 'user_profile']

    for (const entity of entities) {
      const generatedId = getEntityId(entity)
      const extractedType = getIdType(generatedId)

      // The extracted type should match the expected singularized, transformed entity name
      const expectedType = mkEntityType(entity)

      expect(extractedType).toBe(expectedType)
    }
  }),
)

// Test getEntityId with minimal valid inputs
effect('getEntityId should handle minimal valid inputs', () =>
  Effect.gen(function* () {
    // Test single character (valid for TypeID)
    const singleCharId = getEntityId('a')
    expect(typeof singleCharId).toBe('string')
    expect(singleCharId).toContain('_')
    expect(singleCharId.startsWith('a_')).toBe(true)

    // Test short valid entity name
    const shortId = getEntityId('user')
    expect(typeof shortId).toBe('string')
    expect(shortId).toContain('_')
    expect(shortId.startsWith('user_')).toBe(true)
  }),
)

// Test ID format consistency
effect('generated IDs should follow typeid format', () =>
  Effect.gen(function* () {
    const testEntities = ['person', 'group', 'address', 'organization']

    for (const entity of testEntities) {
      const id = getEntityId(entity)

      // Should match typeid format: prefix_randomstring
      const parts = id.split('_')
      expect(parts.length).toBeGreaterThanOrEqual(2)

      // First part should be the type
      const firstPart = parts[0]
      expect(firstPart).toBeTruthy()
      if (firstPart) {
        expect(firstPart.length).toBeGreaterThan(0)
      }

      // Second part should be the random portion
      const secondPart = parts[1]
      expect(secondPart).toBeTruthy()
      if (secondPart) {
        expect(secondPart.length).toBeGreaterThan(0)
      }

      // Should only contain valid characters (alphanumeric and underscore)
      expect(id).toMatch(/^[a-z0-9_]+$/)
    }
  }),
)

// Test consistency between multiple calls
effect('getEntityId should be consistent for same input format', () =>
  Effect.gen(function* () {
    // Test that the same entity name produces IDs with the same prefix
    const ids = Array.from({ length: 5 }, () => getEntityId('person'))

    // All should have the same prefix
    const prefixes = ids.map((id) => id.split('_')[0] || '')
    const uniquePrefixes = [...new Set(prefixes)]

    expect(uniquePrefixes.length).toBe(1)
    expect(uniquePrefixes[0]).toBe('person')
  }),
)
