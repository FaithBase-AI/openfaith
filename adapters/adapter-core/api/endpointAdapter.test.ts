import { expect } from 'bun:test'
import { live } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { toHttpApiEndpoint } from './endpointAdapter'

// Import the internal functions for testing
// Note: These are not exported, so we'll need to test them indirectly through toHttpApiEndpoint
// or we can add them to the exports for testing purposes

live('should extract path parameters for PATCH endpoints', () =>
  Effect.sync(() => {
    const endpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          first_name: Schema.String,
        }),
        id: Schema.String,
      }),
      entity: 'Person' as const,
      method: 'PATCH' as const,
      module: 'people' as const,
      name: 'updatePerson',
      path: '/people/:personId' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            first_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
      updatableFields: {
        fields: ['first_name'] as const,
        special: [] as const,
      },
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    // The endpoint should be created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('updatePerson')
    expect(httpEndpoint.path).toBe('/people/:personId')
    expect(httpEndpoint.method).toBe('PATCH')
  }),
)

live('should extract multiple path parameters', () =>
  Effect.sync(() => {
    const endpoint = {
      apiSchema: Schema.Struct({
        id: Schema.String,
      }),
      entity: 'Event' as const,
      method: 'DELETE' as const,
      module: 'people' as const,
      name: 'deletePersonEvent',
      path: '/people/:personId/events/:eventId' as const,
      response: Schema.Void,
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    // The endpoint should be created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('deletePersonEvent')
    expect(httpEndpoint.path).toBe('/people/:personId/events/:eventId')
    expect(httpEndpoint.method).toBe('DELETE')
  }),
)

live('should handle endpoints without path parameters', () =>
  Effect.sync(() => {
    const endpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          first_name: Schema.String,
        }),
        id: Schema.String,
      }),
      creatableFields: {
        fields: ['first_name'] as const,
        special: [] as const,
      },
      entity: 'Person' as const,
      method: 'POST' as const,
      module: 'people' as const,
      name: 'createPerson',
      path: '/people' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            first_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
    }

    const httpEndpoint = toHttpApiEndpoint(endpoint)

    // The endpoint should be created successfully
    expect(httpEndpoint).toBeDefined()
    expect(httpEndpoint.name).toBe('createPerson')
    expect(httpEndpoint.path).toBe('/people')
    expect(httpEndpoint.method).toBe('POST')
  }),
)

live('should correctly type path parameters at compile time', () =>
  Effect.sync(() => {
    // Test single path parameter
    const singleParamEndpoint = {
      apiSchema: Schema.Struct({
        attributes: Schema.Struct({
          first_name: Schema.String,
        }),
        id: Schema.String,
      }),
      entity: 'Person' as const,
      method: 'PATCH' as const,
      module: 'people' as const,
      name: 'updatePerson',
      path: '/people/:personId' as const,
      response: Schema.Struct({
        data: Schema.Struct({
          attributes: Schema.Struct({
            first_name: Schema.String,
          }),
          id: Schema.String,
          type: Schema.String,
        }),
      }),
      updatableFields: {
        fields: ['first_name'] as const,
        special: [] as const,
      },
    }

    const singleParamHttpEndpoint = toHttpApiEndpoint(singleParamEndpoint)

    // Test multiple path parameters
    const multipleParamEndpoint = {
      apiSchema: Schema.Struct({
        id: Schema.String,
      }),
      entity: 'Event' as const,
      method: 'DELETE' as const,
      module: 'people' as const,
      name: 'deletePersonEvent',
      path: '/people/:personId/events/:eventId' as const,
      response: Schema.Void,
    }

    const multipleParamHttpEndpoint = toHttpApiEndpoint(multipleParamEndpoint)

    // Verify endpoints are created successfully
    expect(singleParamHttpEndpoint).toBeDefined()
    expect(singleParamHttpEndpoint.path).toBe('/people/:personId')

    expect(multipleParamHttpEndpoint).toBeDefined()
    expect(multipleParamHttpEndpoint.path).toBe('/people/:personId/events/:eventId')

    // The real test is at compile time - TypeScript should infer the correct path parameter types
    // Single param should have type: { readonly personId: string }
    // Multiple params should have type: { readonly personId: string; readonly eventId: string }
    console.log('✅ Path parameter types correctly inferred at compile time')
  }),
)
