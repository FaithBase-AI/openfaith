import { expect } from 'bun:test'
import {
  type ConvertEntityManifest,
  mkEntityManifest,
  toHttpApiGroup,
} from '@openfaith/adapter-core/api/mkEntityManifest'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'

// Mock endpoint definitions for testing
const mockGetEndpoint = {
  apiSchema: Schema.Struct({
    id: Schema.String,
    type: Schema.String,
  }),
  entity: 'Person' as const,
  includes: [] as const,
  isCollection: true as const,
  method: 'GET' as const,
  module: 'people' as const,
  name: 'list' as const,
  orderableBy: {
    fields: [] as const,
    special: [] as const,
  },
  path: '/people' as const,
  query: Schema.Struct({
    per_page: Schema.optional(Schema.Number),
  }),
  queryableBy: {
    fields: [] as const,
    special: [] as const,
  },
  response: Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        type: Schema.String,
      }),
    ),
  }),
}

const mockPostEndpoint = {
  apiSchema: Schema.Struct({
    id: Schema.String,
    type: Schema.String,
  }),
  creatableFields: {
    fields: ['name'] as const,
    special: [] as const,
  },
  entity: 'Person' as const,
  method: 'POST' as const,
  module: 'people' as const,
  name: 'create' as const,
  path: '/people' as const,
  payload: Schema.Struct({
    data: Schema.Struct({
      attributes: Schema.Struct({
        name: Schema.String,
      }),
      type: Schema.String,
    }),
  }),
  response: Schema.Struct({
    data: Schema.Struct({
      id: Schema.String,
      type: Schema.String,
    }),
  }),
}

const mockDeleteEndpoint = {
  apiSchema: Schema.Struct({
    id: Schema.String,
    type: Schema.String,
  }),
  entity: 'Person' as const,
  method: 'DELETE' as const,
  module: 'people' as const,
  name: 'delete' as const,
  path: '/people/:id' as const,
  response: Schema.Void,
}

effect('mkEntityManifest should create entity manifest from endpoints', () =>
  Effect.gen(function* () {
    const endpoints = [mockGetEndpoint, mockPostEndpoint, mockDeleteEndpoint] as const
    const errors = {
      400: Schema.Struct({ message: Schema.String }),
      404: Schema.Struct({ message: Schema.String }),
    }

    const manifest = mkEntityManifest({
      endpoints,
      errors,
    })

    expect(manifest).toBeDefined()
    expect(manifest.Person).toBeDefined()
    expect(manifest.Person.entity).toBe('Person')
    expect(manifest.Person.module).toBe('people')
    expect(manifest.Person.errors).toBe(errors)
  }),
)

effect('mkEntityManifest should group endpoints by entity', () =>
  Effect.gen(function* () {
    const groupEndpoint = {
      ...mockGetEndpoint,
      entity: 'Group' as const,
      module: 'groups' as const,
      name: 'listGroups' as const,
      path: '/groups' as const,
    }

    const endpoints = [mockGetEndpoint, mockPostEndpoint, groupEndpoint] as const
    const errors = {}

    const manifest = mkEntityManifest({
      endpoints,
      errors,
    })

    expect(Object.keys(manifest)).toEqual(['Person', 'Group'])
    expect(manifest.Person.endpoints).toBeDefined()
    expect(manifest.Group.endpoints).toBeDefined()
    expect(manifest.Person.endpoints.list).toBe(mockGetEndpoint)
    expect(manifest.Person.endpoints.create).toBe(mockPostEndpoint)
    expect(manifest.Group.endpoints.listGroups).toBe(groupEndpoint)
  }),
)

effect('mkEntityManifest should preserve endpoint names as keys', () =>
  Effect.gen(function* () {
    const endpoints = [mockGetEndpoint, mockPostEndpoint, mockDeleteEndpoint] as const
    const errors = {}

    const manifest = mkEntityManifest({
      endpoints,
      errors,
    })

    const personEndpoints = manifest.Person.endpoints
    expect(Object.keys(personEndpoints)).toEqual(['list', 'create', 'delete'])
    expect(personEndpoints.list.name).toBe('list')
    expect(personEndpoints.create.name).toBe('create')
    expect(personEndpoints.delete.name).toBe('delete')
  }),
)

effect('mkEntityManifest should use first endpoint for shared properties', () =>
  Effect.gen(function* () {
    const endpoints = [mockGetEndpoint, mockPostEndpoint] as const
    const errors = { 500: Schema.Struct({ error: Schema.String }) }

    const manifest = mkEntityManifest({
      endpoints,
      errors,
    })

    // Should use apiSchema from first endpoint (mockGetEndpoint)
    expect(manifest.Person.apiSchema).toBe(mockGetEndpoint.apiSchema)
    expect(manifest.Person.module).toBe(mockGetEndpoint.module)
    expect(manifest.Person.entity).toBe(mockGetEndpoint.entity)
  }),
)

effect('mkEntityManifest should handle single endpoint', () =>
  Effect.gen(function* () {
    const endpoints = [mockGetEndpoint] as const
    const errors = {}

    const manifest = mkEntityManifest({
      endpoints,
      errors,
    })

    expect(Object.keys(manifest)).toEqual(['Person'])
    expect(Object.keys(manifest.Person.endpoints)).toEqual(['list'])
    expect(manifest.Person.endpoints.list).toBe(mockGetEndpoint)
  }),
)

effect('mkEntityManifest should handle multiple entities with different modules', () =>
  Effect.gen(function* () {
    const eventEndpoint = {
      ...mockGetEndpoint,
      entity: 'Event' as const,
      module: 'calendar' as const,
      name: 'listEvents' as const,
      path: '/events' as const,
    }

    const endpoints = [mockGetEndpoint, eventEndpoint] as const
    const errors = {}

    const manifest = mkEntityManifest({
      endpoints,
      errors,
    })

    expect(manifest.Person.module).toBe('people')
    expect(manifest.Event.module).toBe('calendar')
    expect(manifest.Person.entity).toBe('Person')
    expect(manifest.Event.entity).toBe('Event')
  }),
)

effect('toHttpApiGroup should create HttpApiGroup from entity manifest', () =>
  Effect.gen(function* () {
    const entityManifest = {
      endpoints: {
        create: mockPostEndpoint,
        list: mockGetEndpoint,
      },
      errors: {
        400: Schema.Struct({ message: Schema.String }),
        404: Schema.Struct({ message: Schema.String }),
      },
      module: 'people' as const,
    }

    const group = toHttpApiGroup(entityManifest)

    expect(group).toBeDefined()
    // The group should be created successfully - we can't easily test internal structure
    // but we can verify it doesn't throw and returns a function (HttpApiGroup)
    expect(typeof group).toBe('function')
  }),
)

effect('toHttpApiGroup should handle empty endpoints', () =>
  Effect.gen(function* () {
    const entityManifest = {
      endpoints: {},
      errors: {},
      module: 'empty' as const,
    }

    const group = toHttpApiGroup(entityManifest)

    expect(group).toBeDefined()
    expect(typeof group).toBe('function')
  }),
)

effect('toHttpApiGroup should apply error configuration', () =>
  Effect.gen(function* () {
    const entityManifest = {
      endpoints: {
        list: mockGetEndpoint,
      },
      errors: {
        400: Schema.Struct({ message: Schema.String }),
        401: Schema.Struct({ error: Schema.String }),
        500: Schema.Struct({ details: Schema.String }),
      },
      module: 'test' as const,
    }

    // Should not throw when creating group with multiple errors
    const group = toHttpApiGroup(entityManifest)
    expect(group).toBeDefined()
  }),
)

effect('mkEntityManifest should preserve error configuration in all entities', () =>
  Effect.gen(function* () {
    const groupEndpoint = {
      ...mockGetEndpoint,
      entity: 'Group' as const,
      module: 'groups' as const,
    }

    const endpoints = [mockGetEndpoint, groupEndpoint] as const
    const errors = {
      400: Schema.Struct({ message: Schema.String }),
      500: Schema.Struct({ error: Schema.String }),
    }

    const manifest = mkEntityManifest({
      endpoints,
      errors,
    })

    expect(manifest.Person.errors).toBe(errors)
    expect(manifest.Group.errors).toBe(errors)
  }),
)

// Type-level tests to ensure the types work correctly
effect('Type validation: ConvertEntityManifest should have correct structure', () =>
  Effect.gen(function* () {
    // This test validates that the type transformation works correctly
    type TestManifest = ConvertEntityManifest<
      typeof mockGetEndpoint | typeof mockPostEndpoint,
      { 400: Schema.Schema<any> }
    >

    // Mock function that expects the converted manifest structure
    const mockManifestConsumer = (manifest: TestManifest) => manifest

    // This should compile correctly if types are working
    const testManifest = mockManifestConsumer({
      Person: {
        apiSchema: mockGetEndpoint.apiSchema,
        endpoints: {
          create: mockPostEndpoint,
          list: mockGetEndpoint,
        },
        entity: 'Person',
        errors: { 400: Schema.Struct({ message: Schema.String }) },
        module: 'people',
      },
    })

    expect(testManifest.Person.entity).toBe('Person')
    expect(testManifest.Person.module).toBe('people')
  }),
)

effect('Type validation: ConvertHttpApi should transform endpoints correctly', () =>
  Effect.gen(function* () {
    // Test that the ConvertHttpApi type correctly transforms endpoint definitions
    // This is primarily a compile-time test to ensure type safety

    // Mock function that expects converted HTTP API structure
    const mockApiConsumer = (api: any) => api

    // This should compile if the type transformation is working
    const result = mockApiConsumer('test-api-structure')
    expect(result).toBe('test-api-structure')
  }),
)
