import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { OfTransformer } from '@openfaith/schema'
import { Effect, Option, Schema } from 'effect'
import {
  getPcoPersonTransformer,
  getTransformer,
  PcoPerson,
  pcoPersonTransformer,
} from './pcoPersonSchema'

effect('Transformer annotation: can attach and retrieve transformer from schema', () =>
  Effect.gen(function* () {
    // Test that the transformer is attached to the schema
    const retrievedTransformer = getPcoPersonTransformer()

    // Should be Some(transformer)
    expect(Option.isSome(retrievedTransformer)).toBe(true)

    // Extract the transformer and verify it's the same reference
    const transformer = Option.getOrThrow(retrievedTransformer)
    expect(transformer).toBe(pcoPersonTransformer)
  }),
)

effect('Transformer annotation: generic getTransformer function works', () =>
  Effect.gen(function* () {
    // Test the generic function with PcoPerson schema
    const retrievedTransformer = getTransformer(PcoPerson)

    expect(Option.isSome(retrievedTransformer)).toBe(true)

    const transformer = Option.getOrThrow(retrievedTransformer)
    expect(transformer).toBe(pcoPersonTransformer)
  }),
)

effect('Transformer annotation: returns None for schema without transformer', () =>
  Effect.gen(function* () {
    // Test with a schema that doesn't have the transformer annotation
    const simpleSchema = Schema.String

    const retrievedTransformer = getTransformer(simpleSchema)

    // Should be None since String schema doesn't have our annotation
    expect(Option.isNone(retrievedTransformer)).toBe(true)
  }),
)

effect('Type validation: transformer has correct type structure', () =>
  Effect.gen(function* () {
    const retrievedTransformer = getPcoPersonTransformer()
    const transformer = Option.getOrThrow(retrievedTransformer)

    // Verify the transformer is a function (it should be a transformation schema)
    expect(typeof transformer).toBe('function')

    // Verify it has the expected schema properties
    expect(transformer).toHaveProperty('ast')
    expect(transformer).toHaveProperty('Type')
    expect(transformer).toHaveProperty('Encoded')
  }),
)

effect('Type validation: annotation symbol is correctly defined', () =>
  Effect.gen(function* () {
    // Verify the symbol is properly defined
    expect(typeof OfTransformer).toBe('symbol')
    expect(OfTransformer.toString()).toBe('Symbol(@openfaith/schema/transformer)')
  }),
)

effect('Integration test: transformer can be used for actual transformation', () =>
  Effect.gen(function* () {
    const retrievedTransformer = getPcoPersonTransformer()
    const transformer = Option.getOrThrow(retrievedTransformer)

    // Create a mock PCO person data
    const mockPcoPersonData = {
      accounting_administrator: false,
      anniversary: null,
      avatar: 'https://example.com/avatar.jpg',
      birthdate: null,
      child: false,
      created_at: '2023-01-01T00:00:00Z',
      demographic_avatar_url: 'https://example.com/demo.jpg',
      first_name: 'John',
      gender: null,
      given_name: null,
      grade: null,
      graduation_year: null,
      inactivated_at: null,
      last_name: 'Doe',
      medical_notes: null,
      membership: null,
      middle_name: null,
      name: 'John Doe',
      nickname: null,
      passed_background_check: false,
      people_permissions: null,
      remote_id: null,
      school_type: null,
      site_administrator: false,
      status: 'active' as const,
      updated_at: '2023-01-01T00:00:00Z',
    }

    // Test that the transformer can decode the data
    const result = Schema.decodeUnknownSync(transformer)(mockPcoPersonData)

    // Verify the result has the expected OpenFaith structure
    expect(result).toHaveProperty('firstName', 'John')
    expect(result).toHaveProperty('lastName', 'Doe')
    expect(result).toHaveProperty('status', 'active')
  }),
)

effect('Type safety: annotation approach maintains type safety', () =>
  Effect.gen(function* () {
    // This test verifies that the annotation approach maintains type safety
    // and that the retrieved transformer has the correct type

    const retrievedTransformer = getPcoPersonTransformer()

    // Type-level test: the function should return Option<transformer>
    const _typeTest: Option.Option<typeof pcoPersonTransformer> = retrievedTransformer
    void _typeTest // Prevent unused variable warning

    // Runtime test: verify the transformer is the exact same reference
    if (Option.isSome(retrievedTransformer)) {
      const transformer = retrievedTransformer.value

      // Should be the exact same reference
      expect(transformer === pcoPersonTransformer).toBe(true)

      // Should have the same type signature
      expect(typeof transformer).toBe(typeof pcoPersonTransformer)
    } else {
      throw new Error('Expected transformer to be Some, but got None')
    }
  }),
)
