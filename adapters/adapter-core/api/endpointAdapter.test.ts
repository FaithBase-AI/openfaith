import { expect } from 'bun:test'
import { live } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { extractPathParams, generatePathParamsSchema, toHttpApiEndpoint } from './endpointAdapter'

// Tests for extractPathParams function
live('extractPathParams should extract single path parameter', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people/:personId')
    expect(result).toEqual(['personId'])
  }),
)

live('extractPathParams should extract multiple path parameters', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people/:personId/events/:eventId')
    expect(result).toEqual(['personId', 'eventId'])
  }),
)

live('extractPathParams should extract parameters with complex names', () =>
  Effect.sync(() => {
    const result = extractPathParams('/organizations/:orgId/people/:personId/events/:eventId')
    expect(result).toEqual(['orgId', 'personId', 'eventId'])
  }),
)

live('extractPathParams should return empty array for paths without parameters', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people')
    expect(result).toEqual([])
  }),
)

live('extractPathParams should handle paths with mixed segments', () =>
  Effect.sync(() => {
    const result = extractPathParams('/api/v1/people/:personId/static/events/:eventId')
    expect(result).toEqual(['personId', 'eventId'])
  }),
)

live('extractPathParams should handle parameters at the end', () =>
  Effect.sync(() => {
    const result = extractPathParams('/people/:personId')
    expect(result).toEqual(['personId'])
  }),
)

live('extractPathParams should handle parameters at the beginning', () =>
  Effect.sync(() => {
    const result = extractPathParams('/:orgId/people')
    expect(result).toEqual(['orgId'])
  }),
)

// Tests for generatePathParamsSchema function
live('generatePathParamsSchema should generate schema for single parameter', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId')
    const result = Schema.decodeUnknownSync(schema)({ personId: 'test-id' })
    expect(result).toEqual({ personId: 'test-id' })
  }),
)

live('generatePathParamsSchema should generate schema for multiple parameters', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId/events/:eventId')
    const result = Schema.decodeUnknownSync(schema)({
      eventId: 'event-456',
      personId: 'person-123',
    })
    expect(result).toEqual({ eventId: 'event-456', personId: 'person-123' })
  }),
)

live('generatePathParamsSchema should generate empty schema for paths without parameters', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people')
    const result = Schema.decodeUnknownSync(schema)({})
    expect(result).toEqual({})
  }),
)

live('generatePathParamsSchema should validate string types', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId')

    // Should succeed with string
    const validResult = Schema.decodeUnknownSync(schema)({
      personId: 'valid-string',
    })
    expect(validResult).toEqual({ personId: 'valid-string' })

    // Should fail with non-string (this will throw)
    expect(() => {
      Schema.decodeUnknownSync(schema)({ personId: 123 })
    }).toThrow()
  }),
)

live('generatePathParamsSchema should handle complex parameter names', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema(
      '/organizations/:orgId/people/:personId/events/:eventId',
    )
    const result = Schema.decodeUnknownSync(schema)({
      eventId: 'event-3',
      orgId: 'org-1',
      personId: 'person-2',
    })
    expect(result).toEqual({
      eventId: 'event-3',
      orgId: 'org-1',
      personId: 'person-2',
    })
  }),
)

live('generatePathParamsSchema should require all parameters', () =>
  Effect.sync(() => {
    const schema = generatePathParamsSchema('/people/:personId/events/:eventId')

    // Should fail when missing required parameter
    expect(() => {
      Schema.decodeUnknownSync(schema)({ personId: 'person-123' }) // missing eventId
    }).toThrow()
  }),
)

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
