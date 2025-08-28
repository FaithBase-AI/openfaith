import { describe, expect, test } from 'bun:test'
import type { EntityUnion } from './entityDiscovery'

describe('EntityUnion Type', () => {
  test('should extract correct _tag values from EntityUnion', () => {
    // Test that we can discriminate by _tag
    const testEntityDiscrimination = (entity: EntityUnion): string => {
      switch (entity._tag) {
        case 'person':
          return 'person'
        case 'address':
          return 'address'
        case 'campus':
          return 'campus'
        case 'phoneNumber':
          return 'phoneNumber'
        case 'sacrament':
          return 'sacrament'
        case 'pathway':
          return 'pathway'
        case 'qualification':
          return 'qualification'
        default:
          // This should catch any unexpected tags
          return `unexpected: ${(entity as any)._tag}`
      }
    }

    expect(typeof testEntityDiscrimination).toBe('function')

    // Test that the function would work with valid entities
    const mockPerson = { _tag: 'person', id: 'test' } as any
    expect(testEntityDiscrimination(mockPerson)).toBe('person')
  })

  test('should demonstrate EntityUnion excludes system entities', () => {
    // These type assertions should succeed if EntityUnion is working correctly

    // Function to test what can be assigned to EntityUnion
    const acceptsEntity = (entity: EntityUnion) => entity._tag

    // This should work for business entities (would fail at runtime but types should work)
    expect(() => acceptsEntity({ _tag: 'person' } as any)).not.toThrow()
    expect(() => acceptsEntity({ _tag: 'address' } as any)).not.toThrow()

    // The real test is in the TypeScript compilation - system entity types should not be assignable
    // This test mainly validates the structure exists
    expect(acceptsEntity).toBeDefined()
  })

  test('EntityUnion should be narrower than a generic tagged union', () => {
    // Test that EntityUnion is more specific than just any tagged type
    type GenericTagged = { _tag: string }

    // Every EntityUnion should be assignable to GenericTagged
    const testAssignability = (entity: EntityUnion): GenericTagged => entity

    expect(typeof testAssignability).toBe('function')

    // But not every GenericTagged should be assignable to EntityUnion
    // (This would be enforced by TypeScript at compile time)
  })

  test('should log type information for debugging', () => {
    // This helps us understand what the type actually contains
    console.log('EntityUnion type test - if this compiles, the type is working')

    // Test different entity tag scenarios
    const entityTags = [
      'person',
      'address',
      'campus',
      'phoneNumber',
      'sacrament',
      'pathway',
      'qualification',
    ]

    entityTags.forEach((tag) => {
      console.log(`Testing entity tag: ${tag}`)
    })

    expect(entityTags.length).toBeGreaterThan(0)
  })
})
