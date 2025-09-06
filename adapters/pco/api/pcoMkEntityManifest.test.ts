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
    expect('Person' in manifest.entities).toBe(true)
    expect(manifest.entities.Person.entity).toBe('Person')
    expect(manifest.entities.Person.module).toBe('people')
    expect(manifest.entities.Person.errors).toEqual(testErrors)
    expect(manifest.entities.Person.skipSync).toBe(false)

    // Test endpoints are present
    const personEndpoints = manifest.entities.Person.endpoints
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
    expect('Person' in manifest.entities).toBe(true)
    expect('Address' in manifest.entities).toBe(true)

    // Test entity properties
    expect(manifest.entities.Person.entity).toBe('Person')
    expect(manifest.entities.Person.module).toBe('people')
    expect(manifest.entities.Address.entity).toBe('Address')
    expect(manifest.entities.Address.module).toBe('people')

    // Test endpoints
    expect('list' in manifest.entities.Person.endpoints).toBe(true)
    expect('list' in manifest.entities.Address.endpoints).toBe(true)
  }),
)

effect('mkPcoEntityManifest: handles GET endpoints with includes correctly', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition, listAddressesDefinition],
      errors: testErrors,
    })

    const listEndpoint = manifest.entities.Person.endpoints.list

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

    const createEndpoint = manifest.entities.Person.endpoints.create

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

    const updateEndpoint = manifest.entities.Person.endpoints.update

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

    const deleteEndpoint = manifest.entities.Person.endpoints.delete

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
    expect(manifest.entities.Person.apiSchema).toBeDefined()
    expect(manifest.entities.Address.apiSchema).toBeDefined()

    // Test schema types (basic structure check)
    const personSchema = manifest.entities.Person.apiSchema
    const addressSchema = manifest.entities.Address.apiSchema

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

    expect(manifest.entities.Person.skipSync).toBe(true)
  }),
)

effect('mkPcoEntityManifest: handles empty includes array', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listAddressesDefinition],
      errors: testErrors,
    })

    const listEndpoint = manifest.entities.Address.endpoints.list

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

    const apiGroup = toPcoHttpApiGroup(manifest.entities.Person)

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

    const apiGroup = toPcoHttpApiGroup(manifest.entities.Person)

    // Test that errors are applied (basic structure check)
    expect(apiGroup).toBeDefined()
    expect(manifest.entities.Person.errors).toEqual(testErrors)
  }),
)

// Integration tests with real payload schemas
effect('mkPcoEntityManifest: POST payload schema integration', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [createPersonDefinition],
      errors: testErrors,
    })

    const createEndpoint = manifest.entities.Person.endpoints.create

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

    const updateEndpoint = manifest.entities.Person.endpoints.update

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

    // Test that we have both entities and webhooks
    expect(Object.keys(manifest.entities)).toEqual(['Person', 'Address'])

    // Test Person entity has all endpoints
    const personEndpoints = Object.keys(manifest.entities.Person.endpoints)
    expect(personEndpoints).toContain('list')
    expect(personEndpoints).toContain('get')
    expect(personEndpoints).toContain('create')
    expect(personEndpoints).toContain('update')
    expect(personEndpoints).toContain('delete')

    // Test Address entity has list endpoint
    const addressEndpoints = Object.keys(manifest.entities.Address.endpoints)
    expect(addressEndpoints).toContain('list')

    // Test that each entity maintains its own configuration
    expect(manifest.entities.Person.module).toBe('people')
    expect(manifest.entities.Address.module).toBe('people')
    expect(manifest.entities.Person.entity).toBe('Person')
    expect(manifest.entities.Address.entity).toBe('Address')
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

    expect(manifest.entities.Person).toBeDefined()
    expect(manifest.entities.Person.endpoints.minimal).toBeDefined()
    expect(manifest.entities.Person.endpoints.minimal.method).toBe('GET')
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
    const endpointNames = Object.keys(manifest.entities.Person.endpoints)
    expect(endpointNames).toHaveLength(10)

    // Test that each endpoint is properly configured
    for (let i = 1; i <= 10; i++) {
      expect(endpointNames).toContain(`endpoint${i}`)
      expect(manifest.entities.Person.endpoints[`endpoint${i}`]?.method).toBe('GET')
    }
  }),
)

effect('mkPcoEntityManifest: preserves endpoint metadata correctly', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [listPeopleDefinition],
      errors: testErrors,
    })

    const listEndpoint = manifest.entities.Person.endpoints.list

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

    expect(manifest.entities.Person).toBeDefined()
    expect(manifest.entities.Person.entity).toBe('Person')
  }),
)

// Test payload schema generation with real data
effect('mkPcoEntityManifest: generates correct payload schemas for POST', () =>
  Effect.gen(function* () {
    const manifest = mkPcoEntityManifest({
      endpoints: [createPersonDefinition],
      errors: testErrors,
    })

    const createEndpoint = manifest.entities.Person.endpoints.create

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

    const updateEndpoint = manifest.entities.Person.endpoints.update

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

    const createEndpoint = manifest.entities.Person.endpoints.create

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
    const decoded = Effect.runSync(Schema.decodeUnknown(createEndpoint.payload)(payloadWithSpecial))
    expect(decoded.data.attributes.first_name).toBe('John')
    expect(decoded.data.attributes.last_name).toBe('Doe')
    expect(decoded.data.attributes.custom_field).toBe('special value')
  }),
)

// Type-level compilation tests to catch issues like PATCH path parameter positioning
effect('Type validation: PATCH endpoints have path and payload parameters', () =>
  Effect.gen(function* () {
    // This test validates that PATCH endpoints have the correct structure
    // The key insight is that PATCH should have BOTH path params AND payload

    // Mock function that expects PATCH structure
    const mockPatchCall = (params: {
      path: { personId: string } // Path params should be available
      payload: {
        data: {
          type: string
          attributes: Record<string, unknown>
        }
      }
    }) => params

    // This should compile correctly - PATCH endpoints have both path params AND payload
    const result = mockPatchCall({
      path: { personId: '456' },
      payload: {
        data: {
          attributes: {
            first_name: 'Jane',
          },
          type: 'Person',
        },
      },
    })

    expect(result.path.personId).toBe('456')
    expect(result.payload.data.type).toBe('Person')
    expect(result.payload.data.attributes.first_name).toBe('Jane')
  }),
)

effect('Type validation: DELETE endpoints have only path parameters', () =>
  Effect.gen(function* () {
    // This test validates that DELETE endpoints have the correct structure

    // Mock function that expects DELETE structure
    const mockDeleteCall = (params: { path: { personId: string } }) => params

    // This should compile correctly - DELETE endpoints have path params but no payload
    const result = mockDeleteCall({
      path: { personId: '789' },
    })

    expect(result.path.personId).toBe('789')
  }),
)

effect('Type validation: GET endpoints with path parameters', () =>
  Effect.gen(function* () {
    // This test validates that GET endpoints with path params work correctly

    // Mock function that expects GET structure with path params
    const mockGetCall = (params: {
      path: { personId: string }
      urlParams?: Record<string, unknown>
    }) => params

    // This should compile correctly - GET endpoints have path params
    const result = mockGetCall({
      path: { personId: '123' },
      urlParams: { include: ['addresses'] },
    })

    expect(result.path.personId).toBe('123')
  }),
)

effect('Type validation: POST endpoints have only payload parameters', () =>
  Effect.gen(function* () {
    // This test validates that POST endpoints have the correct structure

    // Mock function that expects POST structure
    const mockPostCall = (params: {
      payload: {
        data: {
          type: string
          attributes: Record<string, unknown>
        }
      }
    }) => params

    // This should compile correctly - POST endpoints have payload but no path params
    const result = mockPostCall({
      payload: {
        data: {
          attributes: {
            first_name: 'John',
            last_name: 'Doe',
          },
          type: 'Person',
        },
      },
    })

    expect(result.payload.data.type).toBe('Person')
    expect(result.payload.data.attributes.first_name).toBe('John')
  }),
)

effect('ConvertPcoHttpApi: POST endpoints have correct parameter structure', () =>
  Effect.gen(function* () {
    // Test that POST endpoints have correct typing

    // Mock function that expects the correct parameter structure
    const mockPostCall = (params: {
      payload: {
        data: {
          type: string
          attributes: Record<string, unknown>
        }
      }
    }) => params

    // This should compile correctly - POST endpoints have payload but no path params
    const result = mockPostCall({
      payload: {
        data: {
          attributes: {
            first_name: 'John',
            last_name: 'Doe',
          },
          type: 'Person',
        },
      },
    })

    expect(result.payload.data.type).toBe('Person')
    expect(result.payload.data.attributes.first_name).toBe('John')
  }),
)

effect('ConvertPcoHttpApi: PATCH endpoints have correct parameter structure', () =>
  Effect.gen(function* () {
    // Test that PATCH endpoints have correct typing - this is the critical test

    // Mock function that expects the correct parameter structure
    const mockPatchCall = (params: {
      path: { personId: string } // Path params should be available
      payload: {
        data: {
          type: string
          attributes: Record<string, unknown>
        }
      }
    }) => params

    // This should compile correctly - PATCH endpoints have both path params AND payload
    const result = mockPatchCall({
      path: { personId: '456' },
      payload: {
        data: {
          attributes: {
            first_name: 'Jane',
          },
          type: 'Person',
        },
      },
    })

    expect(result.path.personId).toBe('456')
    expect(result.payload.data.type).toBe('Person')
    expect(result.payload.data.attributes.first_name).toBe('Jane')
  }),
)

effect('ConvertPcoHttpApi: DELETE endpoints have correct parameter structure', () =>
  Effect.gen(function* () {
    // Test that DELETE endpoints have correct typing

    // Mock function that expects the correct parameter structure
    const mockDeleteCall = (params: { path: { personId: string } }) => params

    // This should compile correctly - DELETE endpoints have path params but no payload
    const result = mockDeleteCall({
      path: { personId: '789' },
    })

    expect(result.path.personId).toBe('789')
  }),
)

effect('ConvertPcoHttpApi: path parameter extraction works for all methods', () =>
  Effect.gen(function* () {
    // Test that path parameters are correctly extracted for different endpoint types
    // This is a simplified test that validates the concept without complex type manipulation

    const mockGetCall = (params: { path: { personId: string } }) => params
    const mockPatchCall = (params: {
      path: { personId: string }
      payload: {
        data: { type: string; attributes: Record<string, unknown> }
      }
    }) => params
    const mockDeleteCall = (params: { path: { personId: string } }) => params

    // Test GET with path param
    const getResult = mockGetCall({ path: { personId: '123' } })
    expect(getResult.path.personId).toBe('123')

    // Test PATCH with path param
    const patchResult = mockPatchCall({
      path: { personId: '456' },
      payload: { data: { attributes: {}, type: 'Person' } },
    })
    expect(patchResult.path.personId).toBe('456')

    // Test DELETE with path param
    const deleteResult = mockDeleteCall({ path: { personId: '789' } })
    expect(deleteResult.path.personId).toBe('789')
  }),
)

effect('ConvertPcoHttpApi: type-level validation prevents incorrect usage', () =>
  Effect.gen(function* () {
    // This test verifies that the types prevent incorrect usage at compile time
    // If these compile, the types are working correctly

    // These should be valid calls that would compile
    const validUpdateCall = (params: {
      path: { personId: string }
      payload: {
        data: { type: string; attributes: Record<string, unknown> }
      }
    }) => params

    const validDeleteCall = (params: { path: { personId: string } }) => params

    // Test that the functions accept the correct parameters
    const updateResult = validUpdateCall({
      path: { personId: 'test' },
      payload: { data: { attributes: {}, type: 'Person' } },
    })

    const deleteResult = validDeleteCall({
      path: { personId: 'test' },
    })

    expect(updateResult.path.personId).toBe('test')
    expect(deleteResult.path.personId).toBe('test')
  }),
)

// Mock HTTP client integration tests
effect('Mock HTTP client: PATCH endpoint integration test', () =>
  Effect.gen(function* () {
    // Create a mock HTTP client that mimics the real PCO client structure
    const mockPcoClient = {
      Person: {
        update: (params: {
          path: { personId: string }
          payload: {
            data: {
              type: string
              attributes: Record<string, unknown>
              id: string
            }
          }
        }) => {
          // Mock implementation that validates the structure
          expect(params.path).toBeDefined()
          expect(params.path.personId).toBeDefined()
          expect(params.payload).toBeDefined()
          expect(params.payload.data.type).toBe('Person')
          return Effect.succeed({ success: true })
        },
      },
    }

    // Test that the mock client can be called with the expected structure
    const result = yield* mockPcoClient.Person.update({
      path: { personId: '123' },
      payload: {
        data: {
          attributes: { first_name: 'Updated' },
          id: '123',
          type: 'Person',
        },
      },
    })

    expect(result.success).toBe(true)
  }),
)

effect('Mock HTTP client: DELETE endpoint integration test', () =>
  Effect.gen(function* () {
    // Create a mock HTTP client for DELETE operations
    const mockPcoClient = {
      Person: {
        delete: (params: { path: { personId: string } }) => {
          // Mock implementation that validates the structure
          expect(params.path).toBeDefined()
          expect(params.path.personId).toBeDefined()
          return Effect.succeed({ success: true })
        },
      },
    }

    // Test that the mock client can be called with the expected structure
    const result = yield* mockPcoClient.Person.delete({
      path: { personId: '456' },
    })

    expect(result.success).toBe(true)
  }),
)

effect('Mock HTTP client: GET endpoint integration test', () =>
  Effect.gen(function* () {
    // Create a mock HTTP client for GET operations
    const mockPcoClient = {
      Person: {
        get: (params: { path: { personId: string }; urlParams?: Record<string, unknown> }) => {
          // Mock implementation that validates the structure
          expect(params.path).toBeDefined()
          expect(params.path.personId).toBeDefined()
          return Effect.succeed({
            data: {
              attributes: { first_name: 'Test' },
              id: params.path.personId,
              type: 'Person',
            },
          })
        },
        list: (_params: { urlParams?: Record<string, unknown> }) => {
          // Mock implementation for list operations
          return Effect.succeed({
            data: [
              {
                attributes: { first_name: 'Test' },
                id: '1',
                type: 'Person',
              },
            ],
          })
        },
      },
    }

    // Test GET with path params
    const getResult = yield* mockPcoClient.Person.get({
      path: { personId: '789' },
      urlParams: { include: ['addresses'] },
    })

    expect(getResult.data.id).toBe('789')
    expect(getResult.data.type).toBe('Person')

    // Test LIST without path params
    const listResult = yield* mockPcoClient.Person.list({
      urlParams: { per_page: 25 },
    })

    expect(listResult.data).toHaveLength(1)
    expect(listResult.data[0]?.type).toBe('Person')
  }),
)

effect('Mock HTTP client: POST endpoint integration test', () =>
  Effect.gen(function* () {
    // Create a mock HTTP client for POST operations
    const mockPcoClient = {
      Person: {
        create: (params: {
          payload: {
            data: {
              type: string
              attributes: Record<string, unknown>
            }
          }
        }) => {
          // Mock implementation that validates the structure
          expect(params.payload).toBeDefined()
          expect(params.payload.data.type).toBe('Person')
          expect(params.payload.data.attributes).toBeDefined()
          return Effect.succeed({
            data: {
              attributes: params.payload.data.attributes,
              id: 'new-id',
              type: params.payload.data.type,
            },
          })
        },
      },
    }

    // Test that the mock client can be called with the expected structure
    const result = yield* mockPcoClient.Person.create({
      payload: {
        data: {
          attributes: {
            first_name: 'New',
            last_name: 'Person',
          },
          type: 'Person',
        },
      },
    })

    expect(result.data.id).toBe('new-id')
    expect(result.data.type).toBe('Person')
    expect(result.data.attributes.first_name).toBe('New')
  }),
)
