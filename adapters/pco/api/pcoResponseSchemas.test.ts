import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  mkPcoCollectionSchema,
  mkPcoPayloadSchema,
  mkPcoSingleSchema,
} from '@openfaith/pco/api/pcoResponseSchemas'
import { Effect, Schema } from 'effect'

// Test schemas for our tests
const PersonSchema = Schema.Struct({
  attributes: Schema.Struct({
    email: Schema.optional(Schema.String),
    first_name: Schema.String,
    last_name: Schema.String,
  }),
  id: Schema.String,
  type: Schema.Literal('Person'),
})

const AddressSchema = Schema.Struct({
  attributes: Schema.Struct({
    city: Schema.String,
    street: Schema.String,
  }),
  id: Schema.String,
  type: Schema.Literal('Address'),
})

const PersonAttributesSchema = Schema.Struct({
  email: Schema.optional(Schema.String),
  first_name: Schema.String,
  last_name: Schema.String,
})

// Test data
const samplePerson = {
  attributes: {
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
  },
  id: '123',
  type: 'Person' as const,
}

const sampleAddress = {
  attributes: {
    city: 'Anytown',
    street: '123 Main St',
  },
  id: '456',
  type: 'Address' as const,
}

// mkPcoCollectionSchema tests
effect('mkPcoCollectionSchema: creates schema for collection without entity registry', () =>
  Effect.gen(function* () {
    const collectionSchema = mkPcoCollectionSchema(PersonSchema)

    const sampleCollection = {
      data: [samplePerson],
      included: [],
      links: {
        next: 'https://api.planningcenteronline.com/people/v2/people?offset=25',
        self: 'https://api.planningcenteronline.com/people/v2/people',
      },
      meta: {
        can_include: ['addresses'],
        can_order_by: ['first_name', 'last_name'],
        can_query_by: ['first_name', 'last_name'],
        count: 1,
        total_count: 100,
      },
    }

    const result = Schema.decodeSync(collectionSchema)(sampleCollection) as any
    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toEqual(samplePerson)
    expect(result.links.self).toBe('https://api.planningcenteronline.com/people/v2/people')
    expect(result.meta.count).toBe(1)
    expect(result.meta.total_count).toBe(100)
  }),
)

effect('mkPcoCollectionSchema: creates schema for collection with entity registry', () =>
  Effect.gen(function* () {
    const entityRegistry = Schema.Union(PersonSchema, AddressSchema)
    const collectionSchema = mkPcoCollectionSchema(PersonSchema, entityRegistry)

    const sampleCollectionWithIncludes = {
      data: [samplePerson],
      included: [sampleAddress],
      links: {
        self: 'https://api.planningcenteronline.com/people/v2/people',
      },
      meta: {
        count: 1,
        total_count: 1,
      },
    }

    const result = Schema.decodeSync(collectionSchema)(sampleCollectionWithIncludes) as any
    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toEqual(samplePerson)
    expect(result.included).toHaveLength(1)
    expect(result.included[0]).toEqual(sampleAddress)
  }),
)

effect('mkPcoCollectionSchema: handles optional fields correctly', () =>
  Effect.gen(function* () {
    const collectionSchema = mkPcoCollectionSchema(PersonSchema)

    const minimalCollection = {
      data: [samplePerson],
      included: [],
      links: {
        self: 'https://api.planningcenteronline.com/people/v2/people',
      },
      meta: {
        count: 1,
        total_count: 1,
      },
    }

    const result = Schema.decodeSync(collectionSchema)(minimalCollection) as any
    expect(result.data).toHaveLength(1)
    expect(result.links.next).toBeUndefined()
    expect(result.meta.can_include).toBeUndefined()
    expect(result.meta.next).toBeUndefined()
    expect(result.meta.prev).toBeUndefined()
    expect(result.meta.parent).toBeUndefined()
  }),
)

effect('mkPcoCollectionSchema: validates required fields', () =>
  Effect.gen(function* () {
    const collectionSchema = mkPcoCollectionSchema(PersonSchema)

    const invalidCollection = {
      data: [samplePerson],
      included: [],
      links: {
        self: 'https://api.planningcenteronline.com/people/v2/people',
      },
      // Missing required meta field
    }

    expect(() => Schema.decodeSync(collectionSchema)(invalidCollection)).toThrow()
  }),
)

// mkPcoSingleSchema tests
effect('mkPcoSingleSchema: creates schema for single resource without entity registry', () =>
  Effect.gen(function* () {
    const singleSchema = mkPcoSingleSchema(PersonSchema)

    const sampleSingle = {
      data: samplePerson,
    }

    const result = Schema.decodeSync(singleSchema)(sampleSingle) as any
    expect(result.data).toEqual(samplePerson)
    expect('included' in result).toBe(false)
  }),
)

effect('mkPcoSingleSchema: creates schema for single resource with entity registry', () =>
  Effect.gen(function* () {
    const entityRegistry = Schema.Union(PersonSchema, AddressSchema)
    const singleSchema = mkPcoSingleSchema(PersonSchema, entityRegistry)

    const sampleSingleWithIncludes = {
      data: samplePerson,
      included: [sampleAddress],
    }

    const result = Schema.decodeSync(singleSchema)(sampleSingleWithIncludes) as any
    expect(result.data).toEqual(samplePerson)
    expect(result.included).toHaveLength(1)
    expect(result.included[0]).toEqual(sampleAddress)
  }),
)

effect('mkPcoSingleSchema: handles empty included array', () =>
  Effect.gen(function* () {
    const entityRegistry = Schema.Union(PersonSchema, AddressSchema)
    const singleSchema = mkPcoSingleSchema(PersonSchema, entityRegistry)

    const sampleSingleEmptyIncludes = {
      data: samplePerson,
      included: [],
    }

    const result = Schema.decodeSync(singleSchema)(sampleSingleEmptyIncludes) as any
    expect(result.data).toEqual(samplePerson)
    expect(result.included).toHaveLength(0)
  }),
)

// mkPcoPayloadSchema tests
effect('mkPcoPayloadSchema: creates POST payload schema with required fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      false, // Required fields for POST
    )

    const postPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        type: 'Person',
      },
    }

    const result = Schema.decodeSync(payloadSchema)(postPayload) as any
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.first_name).toBe('Jane')
    expect(result.data.attributes.last_name).toBe('Smith')
    expect(result.data.id).toBeUndefined()
  }),
)

effect('mkPcoPayloadSchema: creates PATCH payload schema with optional fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name', 'email'],
      'Person',
      true, // Optional fields for PATCH
    )

    // PATCH payload with only some fields
    const patchPayload = {
      data: {
        attributes: {
          first_name: 'Jane', // Only updating first name
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeSync(payloadSchema)(patchPayload) as any
    expect(result.data.type).toBe('Person')
    expect(result.data.id).toBe('123')
    expect(result.data.attributes.first_name).toBe('Jane')
    expect('last_name' in result.data.attributes).toBe(false)
    expect('email' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: validates entity type literal', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      false,
    )

    const invalidPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        }, // Wrong type
        type: 'Address',
      },
    }

    expect(() => Schema.decodeSync(payloadSchema)(invalidPayload)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: POST schema requires specified fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      false, // Required fields
    )

    const incompletePayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          // Missing required last_name
        },
        type: 'Person',
      },
    }

    expect(() => Schema.decodeSync(payloadSchema)(incompletePayload)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: PATCH schema allows partial updates', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name', 'email'],
      'Person',
      true, // Optional fields
    )

    const partialPayload = {
      data: {
        attributes: {
          email: 'newemail@example.com', // Only updating email
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeSync(payloadSchema)(partialPayload) as any
    expect(result.data.attributes.email).toBe('newemail@example.com')
    expect('first_name' in result.data.attributes).toBe(false)
    expect('last_name' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: handles empty attributes for PATCH', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      true, // Optional fields
    )

    const emptyAttributesPayload = {
      data: {
        attributes: {},
        id: '123',
        type: 'Person', // No attributes to update
      },
    }

    const result = Schema.decodeSync(payloadSchema)(emptyAttributesPayload) as any
    expect(result.data.type).toBe('Person')
    expect(result.data.id).toBe('123')
    expect(Object.keys(result.data.attributes)).toHaveLength(0)
  }),
)

effect('mkPcoPayloadSchema: validates data structure', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      false,
    )

    const invalidStructure = {
      attributes: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
      // Missing data wrapper
      type: 'Person',
    }

    expect(() => Schema.decodeSync(payloadSchema)(invalidStructure)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: picks only specified fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name'], // Only pick first_name
      'Person',
      false,
    )

    const payloadWithExtraFields = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith', // This should be ignored, not rejected
        },
        type: 'Person',
      },
    }

    const result = Schema.decodeSync(payloadSchema)(payloadWithExtraFields) as any
    expect(result.data.attributes.first_name).toBe('Jane')
    expect('last_name' in result.data.attributes).toBe(false) // Should be filtered out
  }),
)

// Integration tests with real-world scenarios
effect('mkPcoPayloadSchema: handles real PCO person update scenario', () =>
  Effect.gen(function* () {
    const PersonUpdateSchema = Schema.Struct({
      email: Schema.optional(Schema.String),
      first_name: Schema.String.pipe(Schema.minLength(1)),
      last_name: Schema.String.pipe(Schema.minLength(1)),
      status: Schema.optional(Schema.Literal('active', 'inactive')),
    })

    const payloadSchema = mkPcoPayloadSchema(
      PersonUpdateSchema,
      ['first_name', 'last_name', 'email', 'status'],
      'Person',
      true, // PATCH - optional fields
    )

    const realUpdatePayload = {
      data: {
        attributes: {
          first_name: 'Updated Name',
          // Only updating first_name, other fields remain unchanged
        },
        id: '105820014',
        type: 'Person',
      },
    }

    const result = Schema.decodeSync(payloadSchema)(realUpdatePayload) as any
    expect(result.data.type).toBe('Person')
    expect(result.data.id).toBe('105820014')
    expect(result.data.attributes.first_name).toBe('Updated Name')
    expect('last_name' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: handles complex nested attributes', () =>
  Effect.gen(function* () {
    const ComplexAttributesSchema = Schema.Struct({
      metadata: Schema.optional(
        Schema.Struct({
          priority: Schema.Number,
          source: Schema.String,
        }),
      ),
      name: Schema.String,
      tags: Schema.optional(Schema.Array(Schema.String)),
    })

    const payloadSchema = mkPcoPayloadSchema(
      ComplexAttributesSchema,
      ['name', 'metadata', 'tags'],
      'ComplexEntity',
      false,
    )

    const complexPayload = {
      data: {
        attributes: {
          metadata: {
            priority: 1,
            source: 'api',
          },
          name: 'Test Entity',
          tags: ['important', 'test'],
        },
        type: 'ComplexEntity',
      },
    }

    const result = Schema.decodeSync(payloadSchema)(complexPayload) as any
    expect(result.data.attributes.name).toBe('Test Entity')
    expect(result.data.attributes.metadata?.source).toBe('api')
    expect(result.data.attributes.metadata?.priority).toBe(1)
    expect(result.data.attributes.tags).toEqual(['important', 'test'])
  }),
)

// Error handling tests
effect('mkPcoCollectionSchema: fails with invalid data structure', () =>
  Effect.gen(function* () {
    const collectionSchema = mkPcoCollectionSchema(PersonSchema)

    const invalidData = {
      data: 'not an array',
      included: [],
      links: { self: 'test' },
      meta: { count: 1, total_count: 1 },
    }

    expect(() => Schema.decodeSync(collectionSchema)(invalidData)).toThrow()
  }),
)

effect('mkPcoSingleSchema: fails with invalid data structure', () =>
  Effect.gen(function* () {
    const singleSchema = mkPcoSingleSchema(PersonSchema)

    const invalidData = {
      data: ['should be object, not array'],
    }

    expect(() => Schema.decodeSync(singleSchema)(invalidData)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: fails with missing required data field', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name'],
      'Person',
      false,
    )

    const invalidPayload = {
      attributes: {
        first_name: 'Jane',
      },
      // Missing data field
      type: 'Person',
    }

    expect(() => Schema.decodeSync(payloadSchema)(invalidPayload)).toThrow()
  }),
)

// Roundtrip tests
effect('mkPcoPayloadSchema: POST and PATCH schemas work with same data structure', () =>
  Effect.gen(function* () {
    const postSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      false, // Required fields
    )

    const patchSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      true, // Optional fields
    )

    const fullPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        id: '123',
        type: 'Person',
      },
    }

    // Both schemas should accept the full payload
    const postResult = Schema.decodeSync(postSchema)(fullPayload) as any
    const patchResult = Schema.decodeSync(patchSchema)(fullPayload) as any

    expect(postResult.data.attributes.first_name).toBe('Jane')
    expect(postResult.data.attributes.last_name).toBe('Smith')
    expect(patchResult.data.attributes.first_name).toBe('Jane')
    expect(patchResult.data.attributes.last_name).toBe('Smith')
  }),
)

effect('mkPcoPayloadSchema: encodes back to original structure', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema(
      PersonAttributesSchema,
      ['first_name', 'last_name'],
      'Person',
      false,
    )

    const originalPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        type: 'Person',
      },
    }

    const decoded = Schema.decodeSync(payloadSchema)(originalPayload)
    const encoded = Schema.encodeSync(payloadSchema)(decoded)

    expect(encoded).toEqual(originalPayload)
  }),
)
