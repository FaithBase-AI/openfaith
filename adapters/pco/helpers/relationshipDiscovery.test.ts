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
})
