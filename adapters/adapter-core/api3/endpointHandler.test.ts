import { describe, expect, it } from 'bun:test'
import { FetchHttpClient } from '@effect/platform'
import { defineEndpoint } from '@openfaith/adapter-core/api2/endpointTypes'
import { createEndpointHandler } from '@openfaith/adapter-core/api3/endpointHandler'
import type { ResponseAdapter } from '@openfaith/adapter-core/api3/responseAdapter'
import { Effect, Layer, Schema } from 'effect'

// =============================================================================
// Mock Response Adapter (Same as responseFactory.test.ts)
// =============================================================================

export const pcoResponseAdapter: ResponseAdapter = {
  adaptCollection: (resourceSchema) =>
    Schema.Struct({
      data: Schema.Array(resourceSchema),
      included: Schema.optional(Schema.Array(Schema.Any)),
      links: Schema.Struct({
        next: Schema.optional(Schema.String),
        self: Schema.String,
      }),
      meta: Schema.Struct({
        can_include: Schema.optional(Schema.Array(Schema.String)),
        can_order_by: Schema.optional(Schema.Array(Schema.String)),
        can_query_by: Schema.optional(Schema.Array(Schema.String)),
        count: Schema.Number,
        parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
        total_count: Schema.Number,
      }),
    }),
  adaptSingle: (resourceSchema) =>
    Schema.Struct({
      data: resourceSchema,
      included: Schema.optional(Schema.Array(Schema.Any)),
    }),
}

// =============================================================================
// Mock Schemas and Definitions
// =============================================================================

const MockPCOPerson = Schema.Struct({
  attributes: Schema.Struct({
    first_name: Schema.String,
    last_name: Schema.String,
    status: Schema.String,
  }),
  id: Schema.String,
  type: Schema.Literal('Person'),
})

const mockGetAllPeopleDefinition = defineEndpoint({
  apiSchema: MockPCOPerson,
  canonicalSchema: MockPCOPerson,
  includes: ['emails', 'addresses'],
  method: 'GET',
  module: 'people',
  name: 'people.getAll',
  orderableBy: ['first_name', 'last_name', 'created_at'],
  path: '/people/v2/people',
  queryableBy: {
    fields: ['first_name', 'last_name'],
    special: ['created_at', 'updated_at'],
  },
  supportsWebhooks: false,
})

const mockGetPersonByIdDefinition = defineEndpoint({
  apiSchema: MockPCOPerson,
  canonicalSchema: MockPCOPerson,
  includes: ['emails', 'addresses'],
  method: 'GET',
  module: 'people',
  name: 'people.getById',
  path: '/people/v2/people/{id}',
  queryableBy: {
    fields: [],
    special: [],
  },
  supportsWebhooks: false,
})

// =============================================================================
// Test Utilities
// =============================================================================

function createMockHttpLayer(mockResponse: unknown, status = 200) {
  const mockFetch = Layer.succeed(FetchHttpClient.Fetch, (() =>
    Promise.resolve(
      new Response(JSON.stringify(mockResponse), {
        headers: { 'Content-Type': 'application/json' },
        status,
      }),
    )) as unknown as typeof fetch)

  return FetchHttpClient.layer.pipe(Layer.provide(mockFetch))
}

const testConfig = {
  baseUrl: 'https://api.planningcenteronline.com',
  bearerToken: 'fake-bearer-token',
}

// =============================================================================
// Tests
// =============================================================================

describe('createEndpointHandler', () => {
  describe('GET collection endpoint', () => {
    it('should handle a successful request with various parameters', async () => {
      const mockApiResponse = {
        data: [
          {
            attributes: { first_name: 'John', last_name: 'Doe', status: 'active' },
            id: '1',
            type: 'Person',
          },
          {
            attributes: { first_name: 'Jane', last_name: 'Smith', status: 'active' },
            id: '2',
            type: 'Person',
          },
        ],
        links: { self: 'self-link' },
        meta: { count: 2, total_count: 2 },
      }

      const testLayer = createMockHttpLayer(mockApiResponse)

      const program = Effect.gen(function* () {
        const responseSchema = pcoResponseAdapter.adaptCollection(MockPCOPerson)
        const handler = createEndpointHandler(
          mockGetAllPeopleDefinition,
          responseSchema,
          testConfig,
        )

        // Use type assertion to avoid complex type issues in tests
        const result = yield* handler({
          include: ['emails', 'addresses'],
          order: 'first_name',
          per_page: 25,
          where: {
            first_name: 'John',
            last_name: 'Doe',
          },
        })

        expect(result.data).toHaveLength(2)
        expect(result.data[0].id).toBe('1')
        expect(result.data[0].attributes.first_name).toBe('John')
        expect(result.data[1].id).toBe('2')
        expect(result.data[1].attributes.first_name).toBe('Jane')
        expect(result.meta.count).toBe(2)
      })

      await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
    })

    it('should handle empty parameters', async () => {
      const mockApiResponse = {
        data: [],
        links: { self: 'self-link' },
        meta: { count: 0, total_count: 0 },
      }

      const testLayer = createMockHttpLayer(mockApiResponse)

      const program = Effect.gen(function* () {
        const responseSchema = pcoResponseAdapter.adaptCollection(MockPCOPerson)
        const handler = createEndpointHandler(
          mockGetAllPeopleDefinition,
          responseSchema,
          testConfig,
        )

        const result = yield* handler({})

        expect(result.data).toHaveLength(0)
        expect(result.meta.count).toBe(0)
      })

      await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
    })

    it('should handle undefined parameters (default behavior)', async () => {
      const mockApiResponse = {
        data: [],
        links: { self: 'self-link' },
        meta: { count: 0, total_count: 0 },
      }

      const testLayer = createMockHttpLayer(mockApiResponse)

      const program = Effect.gen(function* () {
        const responseSchema = pcoResponseAdapter.adaptCollection(MockPCOPerson)
        const handler = createEndpointHandler(
          mockGetAllPeopleDefinition,
          responseSchema,
          testConfig,
        )

        // Call without any parameters
        const result = yield* handler()

        expect(result.data).toHaveLength(0)
        expect(result.meta.count).toBe(0)
      })

      await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
    })

    it('should fail with ParseError when response schema validation fails', async () => {
      const malformedApiResponse = {
        data: [
          {
            id: '1',
            type: 'Person',
            // Missing required 'attributes' field
          },
        ],
        links: { self: 'self-link' },
        meta: { count: 1, total_count: 1 },
      }

      const testLayer = createMockHttpLayer(malformedApiResponse)

      const program = Effect.gen(function* () {
        const responseSchema = pcoResponseAdapter.adaptCollection(MockPCOPerson)
        const handler = createEndpointHandler(
          mockGetAllPeopleDefinition,
          responseSchema,
          testConfig,
        )

        yield* handler({})
      })

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(testLayer)))

      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        const cause = exit.cause
        expect(cause.toString()).toContain('ParseError')
        expect(cause.toString()).toContain('attributes')
      }
    })

    it('should validate input parameters and reject invalid ones', async () => {
      const program = Effect.gen(function* () {
        const responseSchema = pcoResponseAdapter.adaptCollection(MockPCOPerson)
        const handler = createEndpointHandler(
          mockGetAllPeopleDefinition,
          responseSchema,
          testConfig,
        )

        // Try to pass invalid include values
        yield* handler({
          include: ['invalid_include'],
        })
      })

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(FetchHttpClient.layer)))

      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        const cause = exit.cause
        expect(cause.toString()).toContain('ParseError')
      }
    })
  })

  describe('GET single resource endpoint', () => {
    it('should handle a successful single resource request', async () => {
      const mockApiResponse = {
        data: {
          attributes: { first_name: 'John', last_name: 'Doe', status: 'active' },
          id: '1',
          type: 'Person',
        },
        included: [],
      }

      const testLayer = createMockHttpLayer(mockApiResponse)

      const program = Effect.gen(function* () {
        const responseSchema = pcoResponseAdapter.adaptSingle(MockPCOPerson)
        const handler = createEndpointHandler(
          mockGetPersonByIdDefinition,
          responseSchema,
          testConfig,
        )

        const result = yield* handler({
          include: ['emails'],
        })

        expect(result.data.id).toBe('1')
        expect(result.data.attributes.first_name).toBe('John')
        expect(result.data.attributes.last_name).toBe('Doe')
        expect(result.data.type).toBe('Person')
      })

      await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
    })
  })

  describe('parameter transformation', () => {
    it('should handle complex parameters without errors', async () => {
      const mockApiResponse = {
        data: [],
        links: { self: 'self-link' },
        meta: { count: 0, total_count: 0 },
      }

      const testLayer = createMockHttpLayer(mockApiResponse)

      const program = Effect.gen(function* () {
        const responseSchema = pcoResponseAdapter.adaptCollection(MockPCOPerson)
        const handler = createEndpointHandler(
          mockGetAllPeopleDefinition,
          responseSchema,
          testConfig,
        )

        const result = yield* handler({
          include: ['emails', 'addresses'],
          order: 'created_at',
          per_page: 50,
          where: {
            first_name: 'John',
            last_name: 'Doe',
          },
        })

        // Verify the handler processes complex parameters successfully
        expect(result.data).toHaveLength(0)
        expect(result.meta.count).toBe(0)
      })

      await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
    })
  })

  describe('unsupported methods', () => {
    it('should throw error for unsupported HTTP methods', () => {
      const unsupportedDefinition = defineEndpoint({
        apiSchema: MockPCOPerson,
        canonicalSchema: MockPCOPerson,
        creatableFields: ['first_name', 'last_name'],
        method: 'POST',
        module: 'people',
        name: 'people.create',
        path: '/people/v2/people',
        supportsWebhooks: false,
      })

      expect(() => {
        createEndpointHandler(
          unsupportedDefinition,
          pcoResponseAdapter.adaptCollection(MockPCOPerson),
          testConfig,
        )
      }).toThrow('Endpoint handler for method POST not implemented')
    })
  })
})
