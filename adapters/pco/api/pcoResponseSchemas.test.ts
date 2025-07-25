import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  mkPcoCollectionSchema,
  mkPcoPayloadSchema,
  mkPcoSingleSchema,
  type PcoBuildPayloadSchemaType,
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

    const result = Schema.decodeUnknownSync(collectionSchema)(sampleCollection)
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

    const result = Schema.decodeUnknownSync(collectionSchema)(sampleCollectionWithIncludes)
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

    const result = Schema.decodeUnknownSync(collectionSchema)(minimalCollection)
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

    expect(() => Schema.decodeUnknownSync(collectionSchema)(invalidCollection)).toThrow()
  }),
)

// mkPcoSingleSchema tests
effect('mkPcoSingleSchema: creates schema for single resource without entity registry', () =>
  Effect.gen(function* () {
    const singleSchema = mkPcoSingleSchema(PersonSchema)

    const sampleSingle = {
      data: samplePerson,
    }

    const result = Schema.decodeUnknownSync(singleSchema)(sampleSingle)
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

    const result = Schema.decodeUnknownSync(singleSchema)(sampleSingleWithIncludes)
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

    const result = Schema.decodeUnknownSync(singleSchema)(sampleSingleEmptyIncludes)
    expect(result.data).toEqual(samplePerson)
    expect(result.included).toHaveLength(0)
  }),
)

// mkPcoPayloadSchema tests
effect('mkPcoPayloadSchema: creates POST payload schema without id field', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
      method: 'POST', // Required fields for POST
    })

    const postPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(postPayload)
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.first_name).toBe('Jane')
    expect(result.data.attributes.last_name).toBe('Smith')
    expect('id' in result.data).toBe(false) // POST should not have id
  }),
)

effect('mkPcoPayloadSchema: POST schema filters out id field when present', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
      method: 'POST',
    })

    const postPayloadWithId = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        id: '123', // This should be filtered out, not cause an error
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(postPayloadWithId)
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.first_name).toBe('Jane')
    expect(result.data.attributes.last_name).toBe('Smith')
    expect('id' in result.data).toBe(false) // id should be filtered out
  }),
)

effect('mkPcoPayloadSchema: creates PATCH payload schema with id field', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name', 'email'],
      makeOptional: true,
      method: 'PATCH', // Optional fields for PATCH
    })

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

    const result = Schema.decodeUnknownSync(payloadSchema)(patchPayload)
    expect(result.data.type).toBe('Person')
    expect(result.data.id).toBe('123') // PATCH should have id
    expect(result.data.attributes.first_name).toBe('Jane')
    expect('last_name' in result.data.attributes).toBe(false)
    expect('email' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: PATCH schema requires id field', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: true,
      method: 'PATCH',
    })

    const patchPayloadWithoutId = {
      data: {
        attributes: {
          first_name: 'Jane',
        },
        type: 'Person',
        // Missing required id field
      },
    }

    expect(() => Schema.decodeUnknownSync(payloadSchema)(patchPayloadWithoutId)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: validates entity type literal', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
    })

    const invalidPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        }, // Wrong type
        type: 'Address',
      },
    }

    expect(() => Schema.decodeUnknownSync(payloadSchema)(invalidPayload)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: POST schema requires specified fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false, // Required fields
    })

    const incompletePayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          // Missing required last_name
        },
        type: 'Person',
      },
    }

    expect(() => Schema.decodeUnknownSync(payloadSchema)(incompletePayload)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: PATCH schema allows partial updates', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name', 'email'],
      makeOptional: true, // Optional fields
    })

    const partialPayload = {
      data: {
        attributes: {
          email: 'newemail@example.com', // Only updating email
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(partialPayload)
    expect(result.data.attributes.email).toBe('newemail@example.com')
    expect('first_name' in result.data.attributes).toBe(false)
    expect('last_name' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: handles empty attributes for PATCH', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: true, // Optional fields
    })

    const emptyAttributesPayload = {
      data: {
        attributes: {},
        id: '123',
        type: 'Person', // No attributes to update
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(emptyAttributesPayload)
    expect(result.data.type).toBe('Person')
    expect(result.data.id).toBe('123')
    expect(Object.keys(result.data.attributes)).toHaveLength(0)
  }),
)

effect('mkPcoPayloadSchema: validates data structure', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
    })

    const invalidStructure = {
      attributes: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
      // Missing data wrapper
      type: 'Person',
    }

    expect(() => Schema.decodeUnknownSync(payloadSchema)(invalidStructure)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: picks only specified fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person', // Only pick first_name
      fields: ['first_name'],
      makeOptional: false,
    })

    const payloadWithExtraFields = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith', // This should be ignored, not rejected
        },
        id: '456',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(payloadWithExtraFields)
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

    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonUpdateSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name', 'email', 'status'],
      makeOptional: true, // PATCH - optional fields
    })

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

    const result = Schema.decodeUnknownSync(payloadSchema)(realUpdatePayload)
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

    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: ComplexAttributesSchema,
      entityType: 'ComplexEntity',
      fields: ['name', 'metadata', 'tags'],
      makeOptional: false,
    })

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
        id: '789',
        type: 'ComplexEntity',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(complexPayload)
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

    expect(() => Schema.decodeUnknownSync(collectionSchema)(invalidData)).toThrow()
  }),
)

effect('mkPcoSingleSchema: fails with invalid data structure', () =>
  Effect.gen(function* () {
    const singleSchema = mkPcoSingleSchema(PersonSchema)

    const invalidData = {
      data: ['should be object, not array'],
    } as const

    expect(() => Schema.decodeUnknownSync(singleSchema)(invalidData)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: fails with missing required data field', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name'],
      makeOptional: false,
    })

    const invalidPayload = {
      attributes: {
        first_name: 'Jane',
      },
      // Missing data field
      type: 'Person',
    }

    expect(() => Schema.decodeUnknownSync(payloadSchema)(invalidPayload)).toThrow()
  }),
)

// Roundtrip tests
effect('mkPcoPayloadSchema: POST and PATCH schemas work with same data structure', () =>
  Effect.gen(function* () {
    const postSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false, // Required fields
    })

    const patchSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: true, // Optional fields
    })

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
    const postResult = Schema.decodeUnknownSync(postSchema)(fullPayload)
    const patchResult = Schema.decodeUnknownSync(patchSchema)(fullPayload)

    expect(postResult.data.attributes.first_name).toBe('Jane')
    expect(postResult.data.attributes.last_name).toBe('Smith')
    expect(patchResult.data.attributes.first_name).toBe('Jane')
    expect(patchResult.data.attributes.last_name).toBe('Smith')
  }),
)

effect('mkPcoPayloadSchema: encodes back to original structure', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
    })

    const originalPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
          last_name: 'Smith',
        },
        id: '123',
        type: 'Person',
      },
    } as const

    const decoded = Schema.decodeUnknownSync(payloadSchema)(originalPayload)
    const encoded = Schema.encodeSync(payloadSchema)(decoded)

    expect(encoded).toEqual(originalPayload)
  }),
)

// PcoBuildPayloadSchemaType tests
effect('PcoBuildPayloadSchemaType: creates correct type for POST payload without id', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
      email?: string
      status: 'active' | 'inactive'
    }

    type PostPayloadType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      [],
      'Person',
      false,
      'POST'
    >

    const postPayload: PostPayloadType = {
      data: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe',
        },
        type: 'Person',
        // No id field for POST
      },
    }

    expect(postPayload.data.type).toBe('Person')
    expect(postPayload.data.attributes.first_name).toBe('John')
    expect(postPayload.data.attributes.last_name).toBe('Doe')
    // POST payload should not have id field
    expect('id' in postPayload.data).toBe(false)
  }),
)

effect('PcoBuildPayloadSchemaType: creates correct type for PATCH payload with id field', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
      email?: string
      status: 'active' | 'inactive'
    }

    type PatchPayloadType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name', 'email'],
      [],
      'Person',
      true,
      'PATCH'
    >

    const patchPayload: PatchPayloadType = {
      data: {
        attributes: {
          first_name: 'Jane',
        },
        id: '456',
        type: 'Person',
      },
    }

    expect(patchPayload.data.type).toBe('Person')
    expect(patchPayload.data.attributes.first_name).toBe('Jane')
    expect(patchPayload.data.id).toBe('456')
  }),
)

effect('PcoBuildPayloadSchemaType: handles special fields correctly', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
      email?: string
    }

    type PayloadWithSpecialType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      ['custom_field'],
      'Person',
      false
    >

    const payloadWithSpecial: PayloadWithSpecialType = {
      data: {
        attributes: {
          custom_field: 'special value',
          first_name: 'John',
          last_name: 'Doe',
        },
        id: '789',
        type: 'Person',
      },
    }

    expect(payloadWithSpecial.data.attributes.first_name).toBe('John')
    expect(payloadWithSpecial.data.attributes.last_name).toBe('Doe')
    expect(payloadWithSpecial.data.attributes.custom_field).toBe('special value')
  }),
)

effect('PcoBuildPayloadSchemaType: enforces entity type literal', () =>
  Effect.gen(function* () {
    type PersonFields = {
      name: string
    }

    type PersonPayloadType = PcoBuildPayloadSchemaType<PersonFields, ['name'], [], 'Person', false>

    const personPayload: PersonPayloadType = {
      data: {
        attributes: {
          name: 'John',
        },
        id: '123',
        type: 'Person',
      },
    }

    expect(personPayload.data.type).toBe('Person')
  }),
)

effect('PcoBuildPayloadSchemaType: works with complex nested attributes', () =>
  Effect.gen(function* () {
    type ComplexFields = {
      name: string
      metadata: {
        priority: number
        source: string
      }
      tags: Array<string>
    }

    type ComplexPayloadType = PcoBuildPayloadSchemaType<
      ComplexFields,
      ['name', 'metadata'],
      ['custom_tag'],
      'ComplexEntity',
      false
    >

    const complexPayload: ComplexPayloadType = {
      data: {
        attributes: {
          custom_tag: 'important',
          metadata: {
            priority: 1,
            source: 'api',
          },
          name: 'Test Entity',
        },
        id: '999',
        type: 'ComplexEntity',
      },
    }

    expect(complexPayload.data.attributes.name).toBe('Test Entity')
    expect(complexPayload.data.attributes.metadata.priority).toBe(1)
    expect(complexPayload.data.attributes.metadata.source).toBe('api')
    expect(complexPayload.data.attributes.custom_tag).toBe('important')
  }),
)

effect('PcoBuildPayloadSchemaType: optional fields work correctly with PATCH', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
      email?: string
      phone?: string
    }

    type PatchPayloadType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name', 'email', 'phone'],
      [],
      'Person',
      true
    >

    const minimalPatch: PatchPayloadType = {
      data: {
        attributes: {},
        id: '123',
        type: 'Person',
      },
    }

    const partialPatch: PatchPayloadType = {
      data: {
        attributes: {
          email: 'new@example.com',
        },
        id: '123',
        type: 'Person',
      },
    }

    expect(minimalPatch.data.type).toBe('Person')
    expect(Object.keys(minimalPatch.data.attributes)).toHaveLength(0)
    expect(partialPatch.data.attributes.email).toBe('new@example.com')
  }),
)

effect('PcoBuildPayloadSchemaType: matches mkPcoPayloadSchema runtime behavior', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
      email?: string
    }

    type TypedPayload = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      [],
      'Person',
      false
    >

    const runtimeSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
    })

    const testPayload: TypedPayload = {
      data: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe',
        },
        id: '123',
        type: 'Person',
      },
    }

    const runtimeResult = Schema.decodeUnknownSync(runtimeSchema)(testPayload)
    expect(runtimeResult.data.type).toBe('Person')
    expect(runtimeResult.data.attributes.first_name).toBe('John')
    expect(runtimeResult.data.attributes.last_name).toBe('Doe')
    expect(runtimeResult.data.id).toBe('123')
  }),
)

// Test entity type extraction with real PCO workflow scenario
effect('PcoBuildPayloadSchemaType: works with real PCO workflow scenario', () =>
  Effect.gen(function* () {
    // Simulate the real scenario from pcoSyncEntityWorkflow.ts
    type PersonAttributes = {
      first_name: string
      last_name: string
      avatar: string
      accounting_administrator: boolean
      anniversary: string | null
      birthdate: string | null
      child: boolean
      gender: 'Male' | 'Female' | 'M' | 'F' | null
      grade: number | null
      graduation_year: number | null
      status: 'active' | 'inactive'
    }

    // Test POST payload type (like what would be used in create operations)
    type PostPayloadType = PcoBuildPayloadSchemaType<
      PersonAttributes,
      ['first_name', 'last_name', 'status'],
      [],
      'Person',
      false
    >

    // Test PATCH payload type (like what would be used in update operations)
    type PatchPayloadType = PcoBuildPayloadSchemaType<
      PersonAttributes,
      ['first_name', 'last_name', 'avatar', 'status'],
      [],
      'Person',
      true
    >

    const postPayload: PostPayloadType = {
      data: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe',
          status: 'active',
        },
        id: '123',
        type: 'Person',
      },
    }

    const patchPayload: PatchPayloadType = {
      data: {
        attributes: {
          first_name: 'Jane',
        },
        id: '456',
        type: 'Person',
      },
    }

    expect(postPayload.data.type).toBe('Person')
    expect(postPayload.data.attributes.first_name).toBe('John')
    expect(postPayload.data.attributes.status).toBe('active')

    expect(patchPayload.data.type).toBe('Person')
    expect(patchPayload.data.attributes.first_name).toBe('Jane')
    expect(patchPayload.data.id).toBe('456')
  }),
)

// mkPcoPayloadSchema tests with special parameter
effect('mkPcoPayloadSchema: handles special fields for POST payload', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
      special: ['custom_field', 'external_id'],
    })

    const payloadWithSpecial = {
      data: {
        attributes: {
          custom_field: 'special value',
          external_id: 'ext_123',
          first_name: 'John',
          last_name: 'Doe',
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(payloadWithSpecial)
    expect(result.data.attributes.first_name).toBe('John')
    expect(result.data.attributes.last_name).toBe('Doe')
    expect(result.data.attributes.custom_field).toBe('special value')
    expect(result.data.attributes.external_id).toBe('ext_123')
  }),
)

effect('mkPcoPayloadSchema: handles special fields for PATCH payload', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name', 'email'],
      makeOptional: true,
      special: ['custom_field'],
    })

    const patchPayload = {
      data: {
        attributes: {
          custom_field: 'updated value',
          first_name: 'Jane',
        },
        id: '456',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(patchPayload)
    expect(result.data.attributes.first_name).toBe('Jane')
    expect(result.data.attributes.custom_field).toBe('updated value')
    expect('last_name' in result.data.attributes).toBe(false)
    expect('email' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: special fields are optional when not provided', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
      special: ['custom_field', 'external_id'],
    })

    const payloadWithoutSpecial = {
      data: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe',
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(payloadWithoutSpecial)
    expect(result.data.attributes.first_name).toBe('John')
    expect(result.data.attributes.last_name).toBe('Doe')
    expect('custom_field' in result.data.attributes).toBe(false)
    expect('external_id' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: special fields work with empty regular fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: [],
      makeOptional: true,
      special: ['custom_field'],
    })

    const specialOnlyPayload = {
      data: {
        attributes: {
          custom_field: 'only special field',
        },
        id: '789',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(specialOnlyPayload)
    expect(result.data.attributes.custom_field).toBe('only special field')
    expect(Object.keys(result.data.attributes)).toEqual(['custom_field'])
  }),
)

effect('mkPcoPayloadSchema: validates special fields are strings', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name'],
      makeOptional: false,
      special: ['custom_field'],
    })

    const invalidSpecialPayload = {
      data: {
        attributes: {
          custom_field: 123,
          first_name: 'John',
        },
        id: '123',
        type: 'Person',
      },
    }

    expect(() => Schema.decodeUnknownSync(payloadSchema)(invalidSpecialPayload)).toThrow()
  }),
)

effect('mkPcoPayloadSchema: special fields work with complex nested attributes', () =>
  Effect.gen(function* () {
    const ComplexSchema = Schema.Struct({
      metadata: Schema.Struct({
        priority: Schema.Number,
        source: Schema.String,
      }),
      name: Schema.String,
    })

    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: ComplexSchema,
      entityType: 'ComplexEntity',
      fields: ['name', 'metadata'],
      makeOptional: false,
      special: ['external_ref', 'sync_token'],
    })

    const complexPayload = {
      data: {
        attributes: {
          external_ref: 'ref_456',
          metadata: {
            priority: 1,
            source: 'api',
          },
          name: 'Test Entity',
          sync_token: 'token_789',
        },
        id: '999',
        type: 'ComplexEntity',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(complexPayload)
    expect(result.data.attributes.name).toBe('Test Entity')
    expect((result.data.attributes.metadata as any).priority).toBe(1)
    expect((result.data.attributes.metadata as any).source).toBe('api')
    expect(result.data.attributes.external_ref).toBe('ref_456')
    expect(result.data.attributes.sync_token).toBe('token_789')
  }),
)

effect('mkPcoPayloadSchema: special fields work with makeOptional=true', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name', 'email'],
      makeOptional: true,
      special: ['custom_field', 'external_id'],
    })

    const minimalPayload = {
      data: {
        attributes: {
          external_id: 'ext_999',
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(minimalPayload)
    expect(result.data.attributes.external_id).toBe('ext_999')
    expect('first_name' in result.data.attributes).toBe(false)
    expect('last_name' in result.data.attributes).toBe(false)
    expect('email' in result.data.attributes).toBe(false)
    expect('custom_field' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: encodes back to original structure with special fields', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
      special: ['custom_field'],
    })

    const originalPayload = {
      data: {
        attributes: {
          custom_field: 'special value',
          first_name: 'Jane',
          last_name: 'Smith',
        },
        id: '123',
        type: 'Person',
      },
    } as const

    const decoded = Schema.decodeUnknownSync(payloadSchema)(originalPayload)
    const encoded = Schema.encodeSync(payloadSchema)(decoded)

    expect(encoded).toEqual(originalPayload)
  }),
)

// Method parameter tests
effect('mkPcoPayloadSchema: POST method excludes id field by default', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
      method: 'POST',
    })

    const postPayload = {
      data: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe',
        },
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(postPayload)
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.first_name).toBe('John')
    expect('id' in result.data).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: PATCH method includes id field by default', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: true,
      method: 'PATCH',
    })

    const patchPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(patchPayload)
    expect(result.data.type).toBe('Person')
    expect(result.data.id).toBe('123')
    expect(result.data.attributes.first_name).toBe('Jane')
  }),
)

effect('mkPcoPayloadSchema: defaults to PATCH behavior when method not specified', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: true,
      // method not specified, should default to PATCH
    })

    const patchPayload = {
      data: {
        attributes: {
          first_name: 'Jane',
        },
        id: '123',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(patchPayload)
    expect(result.data.id).toBe('123') // Should have id like PATCH
  }),
)

effect('mkPcoPayloadSchema: POST with special fields excludes id', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: false,
      method: 'POST',
      special: ['custom_field'],
    })

    const postPayload = {
      data: {
        attributes: {
          custom_field: 'special',
          first_name: 'John',
          last_name: 'Doe',
        },
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(postPayload)
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.custom_field).toBe('special')
    expect('id' in result.data).toBe(false)
  }),
)

effect('mkPcoPayloadSchema: PATCH with special fields includes id', () =>
  Effect.gen(function* () {
    const payloadSchema = mkPcoPayloadSchema({
      attributesSchema: PersonAttributesSchema,
      entityType: 'Person',
      fields: ['first_name', 'last_name'],
      makeOptional: true,
      method: 'PATCH',
      special: ['custom_field'],
    })

    const patchPayload = {
      data: {
        attributes: {
          custom_field: 'updated',
          first_name: 'Jane',
        },
        id: '456',
        type: 'Person',
      },
    }

    const result = Schema.decodeUnknownSync(payloadSchema)(patchPayload)
    expect(result.data.type).toBe('Person')
    expect(result.data.id).toBe('456')
    expect(result.data.attributes.custom_field).toBe('updated')
  }),
)

// PcoBuildPayloadSchemaType method parameter tests
effect('PcoBuildPayloadSchemaType: POST method excludes id field in type', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
    }

    type PostPayloadType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      [],
      'Person',
      false,
      'POST'
    >

    const postPayload: PostPayloadType = {
      data: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe',
        },
        type: 'Person',
        // id field should not be available for POST
      },
    }

    expect(postPayload.data.type).toBe('Person')
    expect('id' in postPayload.data).toBe(false)
  }),
)

effect('PcoBuildPayloadSchemaType: PATCH method includes id field in type', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
    }

    type PatchPayloadType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      [],
      'Person',
      true,
      'PATCH'
    >

    const patchPayload: PatchPayloadType = {
      data: {
        attributes: {
          first_name: 'Jane',
        },
        id: '123', // id field should be available for PATCH
        type: 'Person',
      },
    }

    expect(patchPayload.data.type).toBe('Person')
    expect(patchPayload.data.id).toBe('123')
  }),
)

effect('PcoBuildPayloadSchemaType: defaults to PATCH when method not specified', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
    }

    type DefaultPayloadType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      [],
      'Person',
      false
      // method not specified, should default to PATCH
    >

    const defaultPayload: DefaultPayloadType = {
      data: {
        attributes: {
          first_name: 'John',
          last_name: 'Doe',
        },
        id: '123', // Should have id field like PATCH
        type: 'Person',
      },
    }

    expect(defaultPayload.data.id).toBe('123')
  }),
)

effect('PcoBuildPayloadSchemaType: POST with special fields excludes id', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
    }

    type PostWithSpecialType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      ['custom_field'],
      'Person',
      false,
      'POST'
    >

    const postPayload: PostWithSpecialType = {
      data: {
        attributes: {
          custom_field: 'special',
          first_name: 'John',
          last_name: 'Doe',
        },
        type: 'Person',
        // No id field for POST
      },
    }

    expect(postPayload.data.type).toBe('Person')
    expect(postPayload.data.attributes.custom_field).toBe('special')
    expect('id' in postPayload.data).toBe(false)
  }),
)

effect('PcoBuildPayloadSchemaType: PATCH with special fields includes id', () =>
  Effect.gen(function* () {
    type PersonFields = {
      first_name: string
      last_name: string
    }

    type PatchWithSpecialType = PcoBuildPayloadSchemaType<
      PersonFields,
      ['first_name', 'last_name'],
      ['custom_field'],
      'Person',
      true,
      'PATCH'
    >

    const patchPayload: PatchWithSpecialType = {
      data: {
        attributes: {
          custom_field: 'updated',
          first_name: 'Jane',
        },
        id: '456', // id field should be available for PATCH
        type: 'Person',
      },
    }

    expect(patchPayload.data.type).toBe('Person')
    expect(patchPayload.data.id).toBe('456')
    expect(patchPayload.data.attributes.custom_field).toBe('updated')
  }),
)
