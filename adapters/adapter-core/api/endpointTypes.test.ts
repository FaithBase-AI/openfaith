import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import type {
  Any,
  BaseAny,
  DefineDeleteEndpointInput,
  DefineGetEndpointInput,
  DefinePatchEndpointInput,
  DefinePostEndpointInput,
  DeleteEndpointDefinition,
  EndpointDefinition,
  EntityManifestShape,
  GetEndpointDefinition,
  Method,
  PatchEndpointDefinition,
  PostEndpointDefinition,
} from './endpointTypes'

// Test schemas for endpoint definitions
const TestApiSchema = Schema.Struct({
  attributes: Schema.Struct({
    email: Schema.optional(Schema.String),
    name: Schema.String,
    status: Schema.Literal('active', 'inactive'),
  }),
  id: Schema.String,
  type: Schema.String,
})

const TestResponseSchema = Schema.Struct({
  data: TestApiSchema,
  meta: Schema.optional(
    Schema.Struct({
      total: Schema.Number,
    }),
  ),
})

const TestPayloadSchema = Schema.Struct({
  data: Schema.Struct({
    attributes: Schema.Struct({
      email: Schema.optional(Schema.String),
      name: Schema.String,
    }),
    type: Schema.String,
  }),
})

const TestQuerySchema = Schema.Struct({
  include: Schema.optional(Schema.Array(Schema.String)),
  offset: Schema.optional(Schema.Number),
  per_page: Schema.optional(Schema.Number),
})

type TestFields = {
  name: string
  email?: string
  status: 'active' | 'inactive'
}

// GET Endpoint Tests
effect('DefineGetEndpointInput: collection endpoint has correct structure', () =>
  Effect.gen(function* () {
    type CollectionEndpoint = DefineGetEndpointInput<
      typeof TestApiSchema.Type,
      TestFields,
      'users',
      'User',
      'list',
      '/users',
      ['name'],
      ['name', 'email'],
      ['profile'],
      ['created_at'],
      ['search'],
      true
    >

    // Mock function to validate structure
    const mockCollectionEndpoint = (endpoint: CollectionEndpoint) => endpoint

    const testEndpoint = mockCollectionEndpoint({
      apiSchema: TestApiSchema,
      entity: 'User',
      includes: ['profile'],
      isCollection: true,
      method: 'GET',
      module: 'users',
      name: 'list',
      orderableBy: {
        fields: ['name'],
        special: ['created_at'],
      },
      path: '/users',
      queryableBy: {
        fields: ['name', 'email'],
        special: ['search'],
      },
      skipSync: false,
    })

    expect(testEndpoint.isCollection).toBe(true)
    expect(testEndpoint.method).toBe('GET')
    expect(testEndpoint.entity).toBe('User')
    expect(testEndpoint.module).toBe('users')
    expect(testEndpoint.name).toBe('list')
    expect(testEndpoint.path).toBe('/users')
    expect(testEndpoint.includes).toEqual(['profile'])
    expect(testEndpoint.orderableBy.fields).toEqual(['name'])
    expect(testEndpoint.orderableBy.special).toEqual(['created_at'])
    expect(testEndpoint.queryableBy.fields).toEqual(['name', 'email'])
    expect(testEndpoint.queryableBy.special).toEqual(['search'])
  }),
)

effect('DefineGetEndpointInput: single resource endpoint has correct structure', () =>
  Effect.gen(function* () {
    type SingleEndpoint = DefineGetEndpointInput<
      typeof TestApiSchema.Type,
      TestFields,
      'users',
      'User',
      'get',
      '/users/:userId',
      [],
      [],
      ['profile'],
      [],
      [],
      false
    >

    const mockSingleEndpoint = (endpoint: SingleEndpoint) => endpoint

    const testEndpoint = mockSingleEndpoint({
      apiSchema: TestApiSchema,
      entity: 'User',
      includes: ['profile'],
      isCollection: false,
      method: 'GET',
      module: 'users',
      name: 'get',
      path: '/users/:userId',
    })

    expect(testEndpoint.isCollection).toBe(false)
    expect(testEndpoint.method).toBe('GET')
    expect(testEndpoint.entity).toBe('User')
    expect(testEndpoint.path).toBe('/users/:userId')
    expect('orderableBy' in testEndpoint).toBe(false)
    expect('queryableBy' in testEndpoint).toBe(false)
  }),
)

effect('GetEndpointDefinition: includes response and query properties', () =>
  Effect.gen(function* () {
    type FullGetEndpoint = GetEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      TestFields,
      'users',
      'User',
      'list',
      '/users',
      ['name'],
      ['name', 'email'],
      ['profile'],
      ['created_at'],
      ['search'],
      true,
      typeof TestQuerySchema
    >

    const mockFullEndpoint = (endpoint: FullGetEndpoint) => endpoint

    const testEndpoint = mockFullEndpoint({
      apiSchema: TestApiSchema,
      defaultQuery: {
        include: ['profile'],
        per_page: 25,
      },
      entity: 'User',
      includes: ['profile'],
      isCollection: true,
      method: 'GET',
      module: 'users',
      name: 'list',
      orderableBy: {
        fields: ['name'],
        special: ['created_at'],
      },
      path: '/users',
      query: TestQuerySchema,
      queryableBy: {
        fields: ['name', 'email'],
        special: ['search'],
      },
      response: TestResponseSchema,
    })

    expect(testEndpoint.response).toBe(TestResponseSchema)
    expect(testEndpoint.query).toBe(TestQuerySchema)
    expect(testEndpoint.defaultQuery?.per_page).toBe(25)
  }),
)

// POST Endpoint Tests
effect('DefinePostEndpointInput: has correct structure without payload', () =>
  Effect.gen(function* () {
    type PostEndpoint = DefinePostEndpointInput<
      typeof TestApiSchema.Type,
      TestFields,
      'users',
      'User',
      'create',
      '/users',
      ['name', 'email'],
      ['custom_field']
    >

    const mockPostEndpoint = (endpoint: PostEndpoint) => endpoint

    const testEndpoint = mockPostEndpoint({
      apiSchema: TestApiSchema,
      creatableFields: {
        fields: ['name', 'email'],
        special: ['custom_field'],
      },
      entity: 'User',
      method: 'POST',
      module: 'users',
      name: 'create',
      path: '/users',
    })

    expect(testEndpoint.method).toBe('POST')
    expect(testEndpoint.entity).toBe('User')
    expect(testEndpoint.path).toBe('/users')
    expect(testEndpoint.creatableFields.fields).toEqual(['name', 'email'])
    expect(testEndpoint.creatableFields.special).toEqual(['custom_field'])
  }),
)

effect('PostEndpointDefinition: includes response and payload properties', () =>
  Effect.gen(function* () {
    type FullPostEndpoint = PostEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'create',
      '/users',
      ['name', 'email'],
      ['custom_field']
    >

    const mockFullPostEndpoint = (endpoint: FullPostEndpoint) => endpoint

    const testEndpoint = mockFullPostEndpoint({
      apiSchema: TestApiSchema,
      creatableFields: {
        fields: ['name', 'email'],
        special: ['custom_field'],
      },
      entity: 'User',
      method: 'POST',
      module: 'users',
      name: 'create',
      path: '/users',
      payload: TestPayloadSchema,
      response: TestResponseSchema,
    })

    expect(testEndpoint.response).toBe(TestResponseSchema)
    expect(testEndpoint.payload).toBe(TestPayloadSchema)
    expect(testEndpoint.method).toBe('POST')
  }),
)

// PATCH Endpoint Tests
effect('DefinePatchEndpointInput: has correct structure without payload', () =>
  Effect.gen(function* () {
    type PatchEndpoint = DefinePatchEndpointInput<
      typeof TestApiSchema.Type,
      TestFields,
      'users',
      'User',
      'update',
      '/users/:userId',
      ['name', 'email', 'status'],
      ['custom_field']
    >

    const mockPatchEndpoint = (endpoint: PatchEndpoint) => endpoint

    const testEndpoint = mockPatchEndpoint({
      apiSchema: TestApiSchema,
      entity: 'User',
      method: 'PATCH',
      module: 'users',
      name: 'update',
      path: '/users/:userId',
      updatableFields: {
        fields: ['name', 'email', 'status'],
        special: ['custom_field'],
      },
    })

    expect(testEndpoint.method).toBe('PATCH')
    expect(testEndpoint.entity).toBe('User')
    expect(testEndpoint.path).toBe('/users/:userId')
    expect(testEndpoint.updatableFields.fields).toEqual(['name', 'email', 'status'])
    expect(testEndpoint.updatableFields.special).toEqual(['custom_field'])
  }),
)

effect('PatchEndpointDefinition: includes response and payload properties', () =>
  Effect.gen(function* () {
    type FullPatchEndpoint = PatchEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'update',
      '/users/:userId',
      ['name', 'email', 'status'],
      ['custom_field']
    >

    const mockFullPatchEndpoint = (endpoint: FullPatchEndpoint) => endpoint

    const testEndpoint = mockFullPatchEndpoint({
      apiSchema: TestApiSchema,
      entity: 'User',
      method: 'PATCH',
      module: 'users',
      name: 'update',
      path: '/users/:userId',
      payload: TestPayloadSchema,
      response: TestResponseSchema,
      updatableFields: {
        fields: ['name', 'email', 'status'],
        special: ['custom_field'],
      },
    })

    expect(testEndpoint.response).toBe(TestResponseSchema)
    expect(testEndpoint.payload).toBe(TestPayloadSchema)
    expect(testEndpoint.method).toBe('PATCH')
  }),
)

// DELETE Endpoint Tests
effect('DefineDeleteEndpointInput: has correct structure', () =>
  Effect.gen(function* () {
    type DeleteEndpoint = DefineDeleteEndpointInput<
      typeof TestApiSchema.Type,
      TestFields,
      'users',
      'User',
      'delete',
      '/users/:userId'
    >

    const mockDeleteEndpoint = (endpoint: DeleteEndpoint) => endpoint

    const testEndpoint = mockDeleteEndpoint({
      apiSchema: TestApiSchema,
      entity: 'User',
      method: 'DELETE',
      module: 'users',
      name: 'delete',
      path: '/users/:userId',
    })

    expect(testEndpoint.method).toBe('DELETE')
    expect(testEndpoint.entity).toBe('User')
    expect(testEndpoint.path).toBe('/users/:userId')
  }),
)

effect('DeleteEndpointDefinition: includes response property', () =>
  Effect.gen(function* () {
    type FullDeleteEndpoint = DeleteEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof Schema.Void,
      TestFields,
      'users',
      'User',
      'delete',
      '/users/:userId'
    >

    const mockFullDeleteEndpoint = (endpoint: FullDeleteEndpoint) => endpoint

    const testEndpoint = mockFullDeleteEndpoint({
      apiSchema: TestApiSchema,
      entity: 'User',
      method: 'DELETE',
      module: 'users',
      name: 'delete',
      path: '/users/:userId',
      response: Schema.Void,
    })

    expect(testEndpoint.response).toBe(Schema.Void)
    expect(testEndpoint.method).toBe('DELETE')
  }),
)

// Union Type Tests
effect('EndpointDefinition: GET method resolves to GetEndpointDefinition', () =>
  Effect.gen(function* () {
    type GetUnion = EndpointDefinition<
      'GET',
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'list',
      '/users',
      ['name'],
      ['name', 'email'],
      ['profile'],
      ['created_at'],
      ['search'],
      true,
      ['name', 'email'],
      ['custom_field'],
      ['name', 'email', 'status'],
      ['custom_field'],
      typeof TestQuerySchema
    >

    // This should resolve to GetEndpointDefinition
    const mockGetUnion = (endpoint: GetUnion) => endpoint

    const testEndpoint = mockGetUnion({
      apiSchema: TestApiSchema,
      entity: 'User',
      includes: ['profile'],
      isCollection: true,
      method: 'GET',
      module: 'users',
      name: 'list',
      orderableBy: {
        fields: ['name'],
        special: ['created_at'],
      },
      path: '/users',
      query: TestQuerySchema,
      queryableBy: {
        fields: ['name', 'email'],
        special: ['search'],
      },
      response: TestResponseSchema,
    })

    expect(testEndpoint.method).toBe('GET')
    expect(testEndpoint.response).toBe(TestResponseSchema)
    expect('payload' in testEndpoint).toBe(false)
  }),
)

effect('EndpointDefinition: POST method resolves to PostEndpointDefinition', () =>
  Effect.gen(function* () {
    type PostUnion = EndpointDefinition<
      'POST',
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'create',
      '/users',
      [],
      [],
      [],
      [],
      [],
      false,
      ['name', 'email'],
      ['custom_field'],
      [],
      [],
      typeof TestQuerySchema
    >

    const mockPostUnion = (endpoint: PostUnion) => endpoint

    const testEndpoint = mockPostUnion({
      apiSchema: TestApiSchema,
      creatableFields: {
        fields: ['name', 'email'],
        special: ['custom_field'],
      },
      entity: 'User',
      method: 'POST',
      module: 'users',
      name: 'create',
      path: '/users',
      payload: TestPayloadSchema,
      response: TestResponseSchema,
    })

    expect(testEndpoint.method).toBe('POST')
    expect(testEndpoint.response).toBe(TestResponseSchema)
    expect(testEndpoint.payload).toBe(TestPayloadSchema)
  }),
)

effect('EndpointDefinition: PATCH method resolves to PatchEndpointDefinition', () =>
  Effect.gen(function* () {
    type PatchUnion = EndpointDefinition<
      'PATCH',
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'update',
      '/users/:userId',
      [],
      [],
      [],
      [],
      [],
      false,
      [],
      [],
      ['name', 'email', 'status'],
      ['custom_field'],
      typeof TestQuerySchema
    >

    const mockPatchUnion = (endpoint: PatchUnion) => endpoint

    const testEndpoint = mockPatchUnion({
      apiSchema: TestApiSchema,
      entity: 'User',
      method: 'PATCH',
      module: 'users',
      name: 'update',
      path: '/users/:userId',
      payload: TestPayloadSchema,
      response: TestResponseSchema,
      updatableFields: {
        fields: ['name', 'email', 'status'],
        special: ['custom_field'],
      },
    })

    expect(testEndpoint.method).toBe('PATCH')
    expect(testEndpoint.response).toBe(TestResponseSchema)
    expect(testEndpoint.payload).toBe(TestPayloadSchema)
  }),
)

effect('EndpointDefinition: DELETE method resolves to DeleteEndpointDefinition', () =>
  Effect.gen(function* () {
    type DeleteUnion = EndpointDefinition<
      'DELETE',
      typeof TestApiSchema.Type,
      typeof Schema.Void,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'delete',
      '/users/:userId',
      [],
      [],
      [],
      [],
      [],
      false,
      [],
      [],
      [],
      [],
      typeof TestQuerySchema
    >

    const mockDeleteUnion = (endpoint: DeleteUnion) => endpoint

    const testEndpoint = mockDeleteUnion({
      apiSchema: TestApiSchema,
      entity: 'User',
      method: 'DELETE',
      module: 'users',
      name: 'delete',
      path: '/users/:userId',
      response: Schema.Void,
    })

    expect(testEndpoint.method).toBe('DELETE')
    expect(testEndpoint.response).toBe(Schema.Void)
    expect('payload' in testEndpoint).toBe(false)
  }),
)

// Type-level validation tests
effect('Type validation: POST and PATCH endpoints have payload property', () =>
  Effect.gen(function* () {
    // Mock functions that expect payload property
    const mockPostWithPayload = (endpoint: { payload: Schema.Schema<any> }) => endpoint
    const mockPatchWithPayload = (endpoint: { payload: Schema.Schema<any> }) => endpoint

    // These should compile correctly - POST/PATCH endpoints have payload
    const postEndpoint = mockPostWithPayload({
      payload: TestPayloadSchema,
    })

    const patchEndpoint = mockPatchWithPayload({
      payload: TestPayloadSchema,
    })

    expect(postEndpoint.payload).toBe(TestPayloadSchema)
    expect(patchEndpoint.payload).toBe(TestPayloadSchema)
  }),
)

effect('Type validation: GET and DELETE endpoints do not require payload', () =>
  Effect.gen(function* () {
    // Mock functions that expect endpoints without payload
    const mockGetWithoutPayload = (endpoint: { method: 'GET'; response: Schema.Schema<any> }) =>
      endpoint
    const mockDeleteWithoutPayload = (endpoint: {
      method: 'DELETE'
      response: Schema.Schema<any>
    }) => endpoint

    // These should compile correctly - GET/DELETE endpoints don't need payload
    const getEndpoint = mockGetWithoutPayload({
      method: 'GET',
      response: TestResponseSchema,
    })

    const deleteEndpoint = mockDeleteWithoutPayload({
      method: 'DELETE',
      response: Schema.Void,
    })

    expect(getEndpoint.method).toBe('GET')
    expect(deleteEndpoint.method).toBe('DELETE')
  }),
)

// EntityManifestShape tests
effect('EntityManifestShape: accepts all endpoint definition types', () =>
  Effect.gen(function* () {
    type TestManifest = EntityManifestShape

    const mockManifest = (manifest: TestManifest) => manifest

    const testManifest = mockManifest({
      create: {
        apiSchema: TestApiSchema,
        creatableFields: { fields: [], special: [] },
        entity: 'User',
        method: 'POST',
        module: 'users',
        name: 'create',
        path: '/users',
        payload: TestPayloadSchema,
        response: TestResponseSchema,
      },
      delete: {
        apiSchema: TestApiSchema,
        entity: 'User',
        method: 'DELETE',
        module: 'users',
        name: 'delete',
        path: '/users/:userId',
        response: Schema.Void,
      },
      list: {
        apiSchema: TestApiSchema,
        entity: 'User',
        includes: [],
        isCollection: true,
        method: 'GET',
        module: 'users',
        name: 'list',
        orderableBy: { fields: [], special: [] },
        path: '/users',
        query: TestQuerySchema,
        queryableBy: { fields: [], special: [] },
        response: TestResponseSchema,
      },
      update: {
        apiSchema: TestApiSchema,
        entity: 'User',
        method: 'PATCH',
        module: 'users',
        name: 'update',
        path: '/users/:userId',
        payload: TestPayloadSchema,
        response: TestResponseSchema,
        updatableFields: { fields: [], special: [] },
      },
    })

    expect(testManifest.list?.method).toBe('GET')
    expect(testManifest.create?.method).toBe('POST')
    expect(testManifest.update?.method).toBe('PATCH')
    expect(testManifest.delete?.method).toBe('DELETE')
  }),
)

// Method type tests
effect('Method: includes all HTTP methods', () =>
  Effect.gen(function* () {
    const methods: Array<Method> = ['GET', 'POST', 'PATCH', 'DELETE']

    const mockMethodCheck = (method: Method) => method

    for (const method of methods) {
      const result = mockMethodCheck(method)
      expect(['GET', 'POST', 'PATCH', 'DELETE']).toContain(result)
    }
  }),
)

// Any and BaseAny helper type tests
effect('Any: represents any endpoint definition', () =>
  Effect.gen(function* () {
    const mockAnyEndpoint = (endpoint: Any) => endpoint

    // Should accept any valid endpoint
    const testEndpoint = mockAnyEndpoint({
      apiSchema: TestApiSchema,
      entity: 'Test',
      includes: [],
      isCollection: false,
      method: 'GET',
      module: 'test',
      name: 'test',
      path: '/test',
      query: TestQuerySchema,
      response: TestResponseSchema,
    } as Any)

    expect(testEndpoint.method).toBe('GET')
  }),
)

effect('BaseAny: represents any base endpoint definition', () =>
  Effect.gen(function* () {
    const mockBaseAnyEndpoint = (endpoint: BaseAny) => endpoint

    // Should accept any valid base endpoint
    const testEndpoint = mockBaseAnyEndpoint({
      apiSchema: TestApiSchema,
      entity: 'Test',
      includes: [],
      isCollection: false,
      method: 'GET',
      module: 'test',
      name: 'test',
      path: '/test',
      query: TestQuerySchema,
    } as BaseAny)

    expect(testEndpoint.method).toBe('GET')
  }),
)

// Integration tests with realistic scenarios
effect('Integration: complete CRUD endpoint definitions work together', () =>
  Effect.gen(function* () {
    // Define a complete set of CRUD endpoints
    type ListEndpoint = GetEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      TestFields,
      'users',
      'User',
      'list',
      '/users',
      ['name'],
      ['name', 'email'],
      ['profile'],
      ['created_at'],
      ['search'],
      true,
      typeof TestQuerySchema
    >

    type GetEndpoint = GetEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      TestFields,
      'users',
      'User',
      'get',
      '/users/:userId',
      [],
      [],
      ['profile'],
      [],
      [],
      false,
      typeof TestQuerySchema
    >

    type CreateEndpoint = PostEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'create',
      '/users',
      ['name', 'email'],
      ['custom_field']
    >

    type UpdateEndpoint = PatchEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof TestResponseSchema,
      typeof TestPayloadSchema,
      TestFields,
      'users',
      'User',
      'update',
      '/users/:userId',
      ['name', 'email', 'status'],
      ['custom_field']
    >

    type DeleteEndpoint = DeleteEndpointDefinition<
      typeof TestApiSchema.Type,
      typeof Schema.Void,
      TestFields,
      'users',
      'User',
      'delete',
      '/users/:userId'
    >

    // Mock CRUD operations
    const mockCrudOperations = (operations: {
      list: ListEndpoint
      get: GetEndpoint
      create: CreateEndpoint
      update: UpdateEndpoint
      delete: DeleteEndpoint
    }) => operations

    const crudOperations = mockCrudOperations({
      create: {
        apiSchema: TestApiSchema,
        creatableFields: {
          fields: ['name', 'email'],
          special: ['custom_field'],
        },
        entity: 'User',
        method: 'POST',
        module: 'users',
        name: 'create',
        path: '/users',
        payload: TestPayloadSchema,
        response: TestResponseSchema,
      },
      delete: {
        apiSchema: TestApiSchema,
        entity: 'User',
        method: 'DELETE',
        module: 'users',
        name: 'delete',
        path: '/users/:userId',
        response: Schema.Void,
      },
      get: {
        apiSchema: TestApiSchema,
        entity: 'User',
        includes: ['profile'],
        isCollection: false,
        method: 'GET',
        module: 'users',
        name: 'get',
        path: '/users/:userId',
        query: TestQuerySchema,
        response: TestResponseSchema,
      },
      list: {
        apiSchema: TestApiSchema,
        entity: 'User',
        includes: ['profile'],
        isCollection: true,
        method: 'GET',
        module: 'users',
        name: 'list',
        orderableBy: { fields: ['name'], special: ['created_at'] },
        path: '/users',
        query: TestQuerySchema,
        queryableBy: { fields: ['name', 'email'], special: ['search'] },
        response: TestResponseSchema,
      },
      update: {
        apiSchema: TestApiSchema,
        entity: 'User',
        method: 'PATCH',
        module: 'users',
        name: 'update',
        path: '/users/:userId',
        payload: TestPayloadSchema,
        response: TestResponseSchema,
        updatableFields: {
          fields: ['name', 'email', 'status'],
          special: ['custom_field'],
        },
      },
    })

    // Verify all operations have correct structure
    expect(crudOperations.list.method).toBe('GET')
    expect(crudOperations.list.isCollection).toBe(true)
    expect(crudOperations.get.method).toBe('GET')
    expect(crudOperations.get.isCollection).toBe(false)
    expect(crudOperations.create.method).toBe('POST')
    expect(crudOperations.create.payload).toBe(TestPayloadSchema)
    expect(crudOperations.update.method).toBe('PATCH')
    expect(crudOperations.update.payload).toBe(TestPayloadSchema)
    expect(crudOperations.delete.method).toBe('DELETE')
    expect(crudOperations.delete.response).toBe(Schema.Void)

    // Verify all operations share common properties
    const allOperations = Object.values(crudOperations)
    for (const operation of allOperations) {
      expect(operation.entity).toBe('User')
      expect(operation.module).toBe('users')
      expect(operation.apiSchema).toBe(TestApiSchema)
    }
  }),
)

// Edge case tests
effect('Edge cases: empty arrays and optional properties work correctly', () =>
  Effect.gen(function* () {
    type MinimalGetEndpoint = DefineGetEndpointInput<
      typeof TestApiSchema.Type,
      TestFields,
      'minimal',
      'Minimal',
      'get',
      '/minimal',
      [],
      [],
      [],
      [],
      [],
      false
    >

    const mockMinimalEndpoint = (endpoint: MinimalGetEndpoint) => endpoint

    const testEndpoint = mockMinimalEndpoint({
      apiSchema: TestApiSchema,
      entity: 'Minimal',
      includes: [],
      isCollection: false,
      method: 'GET',
      module: 'minimal',
      name: 'get',
      path: '/minimal',
    })

    expect(testEndpoint.includes).toEqual([])
    expect(testEndpoint.method).toBe('GET')
    expect('skipSync' in testEndpoint).toBe(false) // Optional property not present
  }),
)

effect('Edge cases: skipSync optional property works correctly', () =>
  Effect.gen(function* () {
    type EndpointWithSkipSync = DefineGetEndpointInput<
      typeof TestApiSchema.Type,
      TestFields,
      'test',
      'Test',
      'list',
      '/test',
      [],
      [],
      [],
      [],
      [],
      true
    > & { skipSync: true }

    const mockEndpointWithSkipSync = (endpoint: EndpointWithSkipSync) => endpoint

    const testEndpoint = mockEndpointWithSkipSync({
      apiSchema: TestApiSchema,
      entity: 'Test',
      includes: [],
      isCollection: true,
      method: 'GET',
      module: 'test',
      name: 'list',
      orderableBy: { fields: [], special: [] },
      path: '/test',
      queryableBy: { fields: [], special: [] },
      skipSync: true,
    })

    expect(testEndpoint.skipSync).toBe(true)
  }),
)
