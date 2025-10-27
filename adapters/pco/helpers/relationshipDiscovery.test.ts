import { describe, expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { discoverPcoRelationships } from '@openfaith/pco/helpers/relationshipDiscovery'
import { Effect } from 'effect'

describe('relationshipDiscovery', () => {
  effect('discovers Person relationships including primary_campus', () =>
    Effect.gen(function* () {
      const relationships = discoverPcoRelationships('Person')

      // Should discover primary_campus relationship
      expect(relationships).toHaveProperty('primary_campus')
      expect(relationships.primary_campus).toBe('campus')
    }),
  )

  effect('discovers PhoneNumber relationships', () =>
    Effect.gen(function* () {
      const relationships = discoverPcoRelationships('PhoneNumber')

      // PhoneNumber should have a person relationship
      expect(relationships).toHaveProperty('person')
      expect(relationships.person).toBe('person')
    }),
  )

  effect('discovers Address relationships', () =>
    Effect.gen(function* () {
      const relationships = discoverPcoRelationships('Address')

      // Address should have a person relationship
      expect(relationships).toHaveProperty('person')
      expect(relationships.person).toBe('person')
    }),
  )

  effect('returns empty object for unknown entity types', () =>
    Effect.gen(function* () {
      const relationships = discoverPcoRelationships('UnknownEntity')

      expect(relationships).toEqual({})
    }),
  )

  effect('skips relationships marked with OfSkipField annotation', () =>
    Effect.gen(function* () {
      const relationships = discoverPcoRelationships('Team')

      // Should discover normal relationships (service_type is a required relationship without OfSkipField)
      expect(relationships).toHaveProperty('service_type')
      expect(relationships.service_type).toBe('servicetype')

      // Should NOT discover relationships marked with OfSkipField
      // The Team schema has a 'default_responds_to' relationship with OfSkipField: true
      expect(relationships).not.toHaveProperty('default_responds_to')

      // Verify it's finding all the expected relationships (5 total, excluding the skipped one)
      const relationshipKeys = Object.keys(relationships)
      expect(relationshipKeys).toHaveLength(5)
      expect(relationshipKeys).toContain('service_type')
      expect(relationshipKeys).toContain('people')
      expect(relationshipKeys).toContain('person_team_position_assignments')
      expect(relationshipKeys).toContain('team_leaders')
      expect(relationshipKeys).toContain('team_positions')
    }),
  )
})
