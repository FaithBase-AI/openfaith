import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import {
  type ErrorConfig,
  mkPcoEntityManifest,
  toPcoHttpApiGroup,
} from '@openfaith/pco/api/pcoMkEntityManifest'
import { mkPcoEntity } from '@openfaith/pco/modules/pcoBaseSchema'
import { Array, Effect, pipe, Schema } from 'effect'

// Test schemas using the proper PCO entity structure
const TestPersonAttributes = Schema.Struct({
  email: Schema.optional(Schema.String),
  first_name: Schema.String,
  last_name: Schema.String,
  status: Schema.Literal('active', 'inactive'),
})

const TestPersonSchema = mkPcoEntity({
  attributes: TestPersonAttributes,
  links: Schema.Struct({
    self: Schema.String,
  }),
  relationships: Schema.Struct({}),
  type: 'Person',
})

const TestAddressAttributes = Schema.Struct({
  city: Schema.String,
  state: Schema.optional(Schema.String),
  street: Schema.String,
})

const TestAddressSchema = mkPcoEntity({
  attributes: TestAddressAttributes,
  links: Schema.Struct({
    self: Schema.String,
  }),
  relationships: Schema.Struct({}),
  type: 'Address',
})

// Test endpoint definitions
const listPeopleDefinition = pcoApiAdapter({
  apiSchema: TestPersonSchema,
  defaultQuery: {
    include: ['addresses'],
    per_page: 25,
  },
  entity: 'Person',
  includes: ['addresses'],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  orderableBy: {
    fields: ['first_name', 'last_name'],
    special: ['created_at'],
  },
  path: '/people/v2/people',
  queryableBy: {
    fields: ['first_name', 'last_name'],
    special: ['search_name'],
  },
} as const)

const getPersonDefinition = pcoApiAdapter({
  apiSchema: TestPersonSchema,
  entity: 'Person',
  includes: ['addresses'],
  isCollection: false,
  method: 'GET',
  module: 'people',
  name: 'get',
  path: '/people/v2/people/:personId',
} as const)

const createPersonDefinition = pcoApiAdapter({
  apiSchema: TestPersonSchema,
  creatableFields: {
    fields: ['first_name', 'last_name', 'email'],
    special: ['custom_field'],
  },
  entity: 'Person',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people',
} as const)

const updatePersonDefinition = pcoApiAdapter({
  apiSchema: TestPersonSchema,
  entity: 'Person',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/people/:personId',
  updatableFields: {
    fields: ['first_name', 'last_name', 'email', 'status'],
    special: ['custom_field'],
  },
} as const)

const deletePersonDefinition = pcoApiAdapter({
  apiSchema: TestPersonSchema,
  entity: 'Person',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/people/:personId',
} as const)

const listAddressesDefinition = pcoApiAdapter({
  apiSchema: TestAddressSchema,
  entity: 'Address',
  includes: [],
  isCollection: true,
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/addresses',
} as const)

// Test error configurations
const testErrors: ErrorConfig = {
  400: Schema.Struct({ message: Schema.String }),
  401: Schema.Struct({ error: Schema.String }),
  404: Schema.Struct({ notFound: Schema.Boolean }),
}

// mkPcoEntityManifest tests
effect('mkPcoEntityManifest: creates manifest with single entity and all HTTP methods', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [
        listPeopleDefinition,
        getPersonDefinition,
        createPersonDefinition,
        updatePersonDefinition,
        deletePersonDefinition,
      ],
      errors: testErrors,
    })

    // Test manifest structure
    expect('Person' in manifest).toBe(true)
    expect(manifest.Person.entity).toBe('Person')
    expect(manifest.Person.module).toBe('people')
    expect(manifest.Person.errors).toEqual(testErrors)
    expect(manifest.Person.skipSync).toBe(false)

    // Test endpoints are present
    const personEndpoints = manifest.Person.endpoints
    expect('list' in personEndpoints).toBe(true)
    expect('get' in personEndpoints).toBe(true)
    expect('create' in personEndpoints).toBe(true)
    expect('update' in personEndpoints).toBe(true)
    expect('delete' in personEndpoints).toBe(true)

    // Test endpoint properties
    expect(personEndpoints.list.method).toBe('GET')
    expect(personEndpoints.list.isCollection).toBe(true)
    expect(personEndpoints.get.method).toBe('GET')
    expect(personEndpoints.get.isCollection).toBe(false)
    expect(personEndpoints.create.method).toBe('POST')
    expect(personEndpoints.update.method).toBe('PATCH')
    expect(personEndpoints.delete.method).toBe('DELETE')
  }),
)

effect('mkPcoEntityManifest: creates manifest with multiple entities', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition, listAddressesDefinition],
      errors: testErrors,
    })

    // Test both entities are present
    expect('Person' in manifest).toBe(true)
    expect('Address' in manifest).toBe(true)

    // Test entity properties
    expect(manifest.Person.entity).toBe('Person')
    expect(manifest.Person.module).toBe('people')
    expect(manifest.Address.entity).toBe('Address')
    expect(manifest.Address.module).toBe('people')

    // Test endpoints
    expect('list' in manifest.Person.endpoints).toBe(true)
    expect('list' in manifest.Address.endpoints).toBe(true)
  }),
)

effect('mkPcoEntityManifest: handles GET endpoints with includes correctly', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition, listAddressesDefinition],
      errors: testErrors,
    })

    const listEndpoint = manifest.Person.endpoints.list

    // Test that response schema is created
    expect('response' in listEndpoint).toBe(true)
    expect(listEndpoint.includes).toEqual(['addresses'])
    expect(listEndpoint.isCollection).toBe(true)

    // Test default query
    expect(listEndpoint.defaultQuery).toEqual({
      include: ['addresses'],
      per_page: 25,
    })
  }),
)

effect('mkPcoEntityManifest: handles POST endpoints with payload schema', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [createPersonDefinition],
      errors: testErrors,
    })

    const createEndpoint = manifest.Person.endpoints.create

    // Test that payload schema is created
    expect('payload' in createEndpoint).toBe(true)
    expect('response' in createEndpoint).toBe(true)

    // Test creatable fields
    expect(createEndpoint.creatableFields.fields).toEqual(['first_name', 'last_name', 'email'])
    expect(createEndpoint.creatableFields.special).toEqual(['custom_field'])
  }),
)

effect('mkPcoEntityManifest: handles PATCH endpoints with payload schema', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [updatePersonDefinition],
      errors: testErrors,
    })

    const updateEndpoint = manifest.Person.endpoints.update

    // Test that payload schema is created
    expect('payload' in updateEndpoint).toBe(true)
    expect('response' in updateEndpoint).toBe(true)

    // Test updatable fields
    expect(updateEndpoint.updatableFields.fields).toEqual([
      'first_name',
      'last_name',
      'email',
      'status',
    ])
    expect(updateEndpoint.updatableFields.special).toEqual(['custom_field'])
  }),
)

effect('mkPcoEntityManifest: handles DELETE endpoints correctly', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [deletePersonDefinition],
      errors: testErrors,
    })

    const deleteEndpoint = manifest.Person.endpoints.delete

    // Test that response schema is created
    expect('response' in deleteEndpoint).toBe(true)
    expect(deleteEndpoint.method).toBe('DELETE')
    expect(deleteEndpoint.path).toBe('/people/v2/people/:personId')
  }),
)

effect('mkPcoEntityManifest: creates entity registry correctly', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition, listAddressesDefinition],
      errors: testErrors,
    })

    // Test that both entities have their schemas
    expect(manifest.Person.apiSchema).toBeDefined()
    expect(manifest.Address.apiSchema).toBeDefined()

    // Test schema types (basic structure check)
    const personSchema = manifest.Person.apiSchema
    const addressSchema = manifest.Address.apiSchema

    expect('fields' in personSchema).toBe(true)
    expect('fields' in addressSchema).toBe(true)
  }),
)

effect('mkPcoEntityManifest: handles skipSync flag correctly', () =>
  Effect.gen(function* () {
    // Create endpoint with skipSync
    const skipSyncEndpoint = pcoApiAdapter({
      ...listPeopleDefinition,
      skipSync: true,
    } as const)

    const manifest = mkPcoEntityManifest({
      endpoints: [skipSyncEndpoint],
      errors: testErrors,
    })

    expect(manifest.Person.skipSync).toBe(true)
  }),
)

effect('mkPcoEntityManifest: handles empty includes array', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listAddressesDefinition],
      errors: testErrors,
    })

    const listEndpoint = manifest.Address.endpoints.list

    expect(listEndpoint.includes).toEqual([])
    expect('response' in listEndpoint).toBe(true)
  }),
)

// toPcoHttpApiGroup tests
effect('toPcoHttpApiGroup: creates HttpApiGroup with all endpoints', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [
        listPeopleDefinition,
        getPersonDefinition,
        createPersonDefinition,
        updatePersonDefinition,
        deletePersonDefinition,
      ],
      errors: testErrors,
    })

    const apiGroup = toPcoHttpApiGroup(manifest.Person)

    // Test that it's an HttpApiGroup (which is actually a function in Effect)
    expect(apiGroup).toBeDefined()
    expect(typeof apiGroup).toBe('function')

    // Test that it has the correct entity name
    // Note: We can't easily test internal structure without accessing private properties
    // but we can verify it was created successfully
  }),
)

effect('toPcoHttpApiGroup: applies error configuration', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition],
      errors: testErrors,
    })

    const apiGroup = toPcoHttpApiGroup(manifest.Person)

    // Test that errors are applied (basic structure check)
    expect(apiGroup).toBeDefined()
    expect(manifest.Person.errors).toEqual(testErrors)
  }),
)

// Integration tests with real payload schemas
effect('mkPcoEntityManifest: POST payload schema integration', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [createPersonDefinition],
      errors: testErrors,
    })

    const createEndpoint = manifest.Person.endpoints.create

    // Test that we can create a valid payload using the generated schema
    const testPayload = {
      data: {
        attributes: {
          custom_field: 'special value',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        id: '123',
        type: 'Person',
      },
    }

    // Test that the payload schema can decode the test payload
    const result = Effect.runSync(Schema.decodeUnknown(createEndpoint.payload)(testPayload))
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.first_name).toBe('John')
    expect(result.data.attributes.last_name).toBe('Doe')
    expect(result.data.attributes.email).toBe('john@example.com')
    expect(result.data.attributes.custom_field).toBe('special value')
  }),
)

effect('mkPcoEntityManifest: PATCH payload schema integration', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [updatePersonDefinition],
      errors: testErrors,
    })

    const updateEndpoint = manifest.Person.endpoints.update

    // Test partial update payload (PATCH should allow optional fields)
    const testPayload = {
      data: {
        attributes: {
          first_name: 'Jane', // Only updating first name
        },
        id: '456',
        type: 'Person',
      },
    }

    // Test that the payload schema can decode the partial payload
    const result = Effect.runSync(Schema.decodeUnknown(updateEndpoint.payload)(testPayload))
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.first_name).toBe('Jane')
    expect(result.data.id).toBe('456')

    // Test that other fields are not present (partial update)
    expect('last_name' in result.data.attributes).toBe(false)
    expect('email' in result.data.attributes).toBe(false)
  }),
)

effect('mkPcoEntityManifest: handles complex endpoint combinations', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [
        listPeopleDefinition,
        getPersonDefinition,
        createPersonDefinition,
        updatePersonDefinition,
        deletePersonDefinition,
        listAddressesDefinition,
      ],
      errors: testErrors,
    })

    // Test that we have both entities
    expect(Object.keys(manifest)).toEqual(['Person', 'Address'])

    // Test Person entity has all endpoints
    const personEndpoints = Object.keys(manifest.Person.endpoints)
    expect(personEndpoints).toContain('list')
    expect(personEndpoints).toContain('get')
    expect(personEndpoints).toContain('create')
    expect(personEndpoints).toContain('update')
    expect(personEndpoints).toContain('delete')

    // Test Address entity has list endpoint
    const addressEndpoints = Object.keys(manifest.Address.endpoints)
    expect(addressEndpoints).toContain('list')

    // Test that each entity maintains its own configuration
    expect(manifest.Person.module).toBe('people')
    expect(manifest.Address.module).toBe('people')
    expect(manifest.Person.entity).toBe('Person')
    expect(manifest.Address.entity).toBe('Address')
  }),
)

// Error handling tests
effect('mkPcoEntityManifest: handles minimal endpoint configuration', () =>
  Effect.gen(function* () {
    // Test with minimal endpoint configuration
    const minimalEndpoint = pcoApiAdapter({
      apiSchema: TestPersonSchema,
      entity: 'Person',
      includes: [],
      isCollection: false,
      method: 'GET',
      module: 'people',
      name: 'minimal',
      path: '/people/v2/minimal',
    } as const)

    const manifest = mkPcoEntityManifest({
      endpoints: [minimalEndpoint],
      errors: testErrors,
    })

    expect(manifest.Person).toBeDefined()
    expect(manifest.Person.endpoints.minimal).toBeDefined()
    expect(manifest.Person.endpoints.minimal.method).toBe('GET')
  }),
)

// Performance and edge case tests
effect('mkPcoEntityManifest: handles large number of endpoints efficiently', () =>
  Effect.gen(function* () {
    // Create multiple similar endpoints
    const endpoints = pipe(
      Array.range(1, 10),
      Array.map((i) =>
        pcoApiAdapter({
          apiSchema: TestPersonSchema,
          entity: 'Person',
          includes: [],
          isCollection: false,
          method: 'GET',
          module: 'people',
          name: `endpoint${i}`,
          path: `/people/v2/endpoint${i}`,
        } as const),
      ),
    )

    const manifest = mkPcoEntityManifest({
      endpoints,
      errors: testErrors,
    })

    // Test that all endpoints are present
    const endpointNames = Object.keys(manifest.Person.endpoints)
    expect(endpointNames).toHaveLength(10)

    // Test that each endpoint is properly configured
    for (let i = 1; i <= 10; i++) {
      expect(endpointNames).toContain(`endpoint${i}`)
      expect(manifest.Person.endpoints[`endpoint${i}`]?.method).toBe('GET')
    }
  }),
)

effect('mkPcoEntityManifest: preserves endpoint metadata correctly', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition],
      errors: testErrors,
    })

    const listEndpoint = manifest.Person.endpoints.list

    // Test that all original endpoint properties are preserved
    expect(listEndpoint.entity).toBe('Person')
    expect(listEndpoint.module).toBe('people')
    expect(listEndpoint.name).toBe('list')
    expect(listEndpoint.path).toBe('/people/v2/people')
    expect(listEndpoint.method).toBe('GET')
    expect(listEndpoint.isCollection).toBe(true)

    // Test queryable and orderable fields
    expect(listEndpoint.queryableBy.fields).toEqual(['first_name', 'last_name'])
    expect(listEndpoint.queryableBy.special).toEqual(['search_name'])
    expect(listEndpoint.orderableBy.fields).toEqual(['first_name', 'last_name'])
    expect(listEndpoint.orderableBy.special).toEqual(['created_at'])
  }),
)

// Type-level tests (compile-time verification)
effect('mkPcoEntityManifest: type-level transformations compile correctly', () =>
  Effect.gen(function* () {
    // This is a compile-time test - if it compiles, the types are working
    // We just need to verify the function works at runtime
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition, createPersonDefinition],
      errors: testErrors,
    })

    expect(manifest.Person).toBeDefined()
    expect(manifest.Person.entity).toBe('Person')
  }),
)

// Test payload schema generation with real data
effect('mkPcoEntityManifest: generates correct payload schemas for POST', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [createPersonDefinition],
      errors: testErrors,
    })

    const createEndpoint = manifest.Person.endpoints.create

    // Test that the payload schema validates correctly
    const validPayload = {
      data: {
        attributes: {
          first_name: 'Test',
          last_name: 'User',
        },
        id: '123',
        type: 'Person',
      },
    }

    // Should not throw
    const decoded = Effect.runSync(Schema.decodeUnknown(createEndpoint.payload)(validPayload))
    expect(decoded.data.attributes.first_name).toBe('Test')
    expect(decoded.data.attributes.last_name).toBe('User')
    expect(decoded.data.type).toBe('Person')
  }),
)

effect('mkPcoEntityManifest: generates correct payload schemas for PATCH', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [updatePersonDefinition],
      errors: testErrors,
    })

    const updateEndpoint = manifest.Person.endpoints.update

    // Test that the payload schema allows partial updates
    const partialPayload = {
      data: {
        attributes: {
          status: 'inactive' as const, // Only updating status
        },
        id: '456',
        type: 'Person',
      },
    }

    // Should not throw
    const decoded = Effect.runSync(Schema.decodeUnknown(updateEndpoint.payload)(partialPayload))
    expect(decoded.data.attributes.status).toBe('inactive')
    expect(decoded.data.type).toBe('Person')
    expect(decoded.data.id).toBe('456')
  }),
)

effect('mkPcoEntityManifest: handles special fields in payload schemas', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [createPersonDefinition],
      errors: testErrors,
    })

    const createEndpoint = manifest.Person.endpoints.create

    // Test payload with special fields
    const payloadWithSpecial = {
      data: {
        attributes: {
          custom_field: 'special value',
          first_name: 'John',
          last_name: 'Doe', // This is a special field
        },
        id: '789',
        type: 'Person',
      },
    }

    // Should not throw
    const decoded = Schema.decodeUnknownSync(createEndpoint.payload as Schema.Schema.Any)(
      payloadWithSpecial,
    )
    expect(decoded.data.attributes.first_name).toBe('John')
    expect(decoded.data.attributes.last_name).toBe('Doe')
    expect(decoded.data.attributes.custom_field).toBe('special value')
  }),
)
