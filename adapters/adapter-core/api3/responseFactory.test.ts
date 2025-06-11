// src/api/factories.test.ts

import { describe, expect, it } from 'bun:test'
import { FetchHttpClient } from '@effect/platform'
import {
  arrayToCommaSeparatedString,
  structToWhereParams,
} from '@openfaith/adapter-core/api/endpointTypes'
import type { ResponseAdapter } from '@openfaith/adapter-core/api3/responseAdapter'
import { createJsonGet } from '@openfaith/adapter-core/api3/responseFactory'
import { Effect, Layer, Schema } from 'effect'

export const pcoResponseAdapter: ResponseAdapter = {
  /**
   * Adapts the schema for a PCO collection response.
   *
   * A GET request for a collection (e.g., `/people/v2/people`) returns a
   * comprehensive object with pagination and metadata. This method wraps the
   * resource schema to match this full JSON:API collection structure.
   *
   * @param resourceSchema The schema for an individual resource in the collection.
   * @returns A new schema representing the complete collection response envelope.
   */
  adaptCollection: (resourceSchema) =>
    Schema.Struct({
      /** The 'data' key contains the array of primary resource objects. */
      data: Schema.Array(resourceSchema),

      /** The 'included' key contains side-loaded related resources. */
      included: Schema.optional(Schema.Array(Schema.Any)),

      /** The 'links' object contains pagination links. */
      links: Schema.Struct({
        next: Schema.optional(Schema.String),
        self: Schema.String,
      }),

      /** The 'meta' object contains counts and other metadata. */
      meta: Schema.Struct({
        can_include: Schema.optional(Schema.Array(Schema.String)),
        can_order_by: Schema.optional(Schema.Array(Schema.String)),
        can_query_by: Schema.optional(Schema.Array(Schema.String)),
        count: Schema.Number,
        parent: Schema.optional(Schema.Struct({ id: Schema.String, type: Schema.String })),
        total_count: Schema.Number,
      }),
    }),
  /**
   * Adapts the schema for a single PCO resource response.
   *
   * A GET request for a single item (e.g., `/people/v2/people/123`) returns an
   * object like: `{ "data": { ... PCOPerson ... }, "included": [...] }`.
   * This method wraps the provided resource schema to match this envelope.
   *
   * @param resourceSchema The schema for the core resource (e.g., PCOPerson).
   * @returns A new schema representing the `{ data: ..., included: [...] }` structure.
   */
  adaptSingle: (resourceSchema) =>
    Schema.Struct({
      data: resourceSchema,
      included: Schema.optional(Schema.Array(Schema.Any)),
    }),
}

const PCOGetAllPeopleInclude = Schema.Literal('emails', 'addresses')

// --- Schemas for the Test ---
const PCOGetAllPeopleRequest = Schema.Struct({
  include: Schema.optional(
    Schema.Union(arrayToCommaSeparatedString(PCOGetAllPeopleInclude), PCOGetAllPeopleInclude),
  ),
  per_page: Schema.optional(Schema.NumberFromString),
  where: Schema.optional(
    structToWhereParams(
      Schema.Struct({
        status: Schema.optional(Schema.Literal('active', 'inactive')),
      }),
    ),
  ),
})

const MockPCOPerson = Schema.Struct({
  attributes: Schema.Struct({
    first_name: Schema.String,
    last_name: Schema.String,
    status: Schema.String,
  }),
  id: Schema.String,
  type: Schema.Literal('Person'),
})

const fullPeopleResponseSchema = pcoResponseAdapter.adaptCollection(MockPCOPerson)

describe('createJsonGet', () => {
  it('should fetch, parse, and construct a URL with parameters correctly', async () => {
    // --- Mock Data ---
    const mockApiResponse = {
      data: [
        {
          attributes: { first_name: 'John', last_name: 'Doe', status: 'active' },
          id: '1',
          type: 'Person',
        },
      ],
      links: { self: 'self-link' },
      meta: { count: 1, total_count: 1 },
    }

    // --- Mock HttpClient Layer (The Corrected Part) ---
    // 1. Create a mock fetch function that returns a Web API Response object.
    const mockFetch = Layer.succeed(FetchHttpClient.Fetch, (() =>
      Promise.resolve(
        new Response(JSON.stringify(mockApiResponse), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      )) as unknown as typeof fetch)

    // 2. Create a Layer that provides our mock fetch to the FetchHttpClient.
    const testLayer = FetchHttpClient.layer.pipe(Layer.provide(mockFetch))

    // --- Test Logic ---
    const program = Effect.gen(function* () {
      const getPeople = createJsonGet(
        'https://api.planningcenteronline.com',
        '/people/v2/people',
        PCOGetAllPeopleRequest,
        fullPeopleResponseSchema,
        'fake-bearer-token',
      )

      const result = yield* getPeople({
        include: ['emails'],
        per_page: 50,
        where: { status: 'active' },
      })

      // Assert the parsed response is correct
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('1')
    })

    await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
  })

  it('should fail with a ParseError if the response is malformed', async () => {
    // --- Mock Malformed Data ---
    const malformedApiResponse = {
      data: [{ id: '1' /* missing attributes */, type: 'Person' }],
      links: { self: 'self-link' },
      meta: { count: 1, total_count: 1 },
    }

    // --- Mock HttpClient Layer (The Corrected Part) ---
    const mockFetch = Layer.succeed(FetchHttpClient.Fetch, (() =>
      Promise.resolve(
        new Response(JSON.stringify(malformedApiResponse), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      )) as unknown as typeof fetch)

    const testLayer = FetchHttpClient.layer.pipe(Layer.provide(mockFetch))

    // --- Test Logic ---
    const program = Effect.gen(function* () {
      const getPeople = createJsonGet(
        'https://api.planningcenteronline.com',
        '/people/v2/people',
        PCOGetAllPeopleRequest,
        fullPeopleResponseSchema,
        'fake-bearer-token',
      )
      yield* getPeople({})
    })

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(testLayer)))

    // Assert that the program failed with a ParseError
    expect(exit._tag).toBe('Failure')
    if (exit._tag === 'Failure') {
      const cause = exit.cause
      expect(cause.toString()).toContain('ParseError')
      expect(cause.toString()).toContain('attributes')
    }
  })
})
