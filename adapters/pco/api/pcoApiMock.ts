/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: it's a mock */
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { Context, Effect, Layer } from 'effect'

/**
 * Mock PcoHttpClient implementation following Effect patterns
 * Used for testing external sync functionality
 */
export const makeMockPcoHttpClient = Effect.gen(function* () {
  return {
    _tag: 'PcoHttpClient' as const,
    Address: {
      create: ({ payload }: { payload: unknown }) =>
        Effect.succeed({ attributes: {}, id: 'new_addr_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.succeed({ attributes: {}, id: urlParams.id }),
    },
    Campus: {
      create: ({ payload }: { payload: unknown }) =>
        Effect.succeed({ attributes: {}, id: 'new_campus_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.succeed({ attributes: {}, id: urlParams.id }),
    },
    Person: {
      create: ({ payload }: { payload: unknown }) =>
        Effect.succeed({ attributes: {}, id: 'new_pco_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.succeed({ attributes: {}, id: urlParams.id }),
    },
    PhoneNumber: {
      create: ({ payload }: { payload: unknown }) =>
        Effect.succeed({ attributes: {}, id: 'new_phone_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.succeed({ attributes: {}, id: urlParams.id }),
    },
    token: 'test-token',
  } as unknown as PcoHttpClient
})

/**
 * Mock PcoHttpClient with API errors for error testing
 */
export const makeMockPcoHttpClientWithErrors = Effect.gen(function* () {
  return {
    _tag: 'PcoHttpClient' as const,
    Address: {
      create: ({ payload }: { payload: unknown }) =>
        Effect.succeed({ attributes: {}, id: 'new_addr_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.succeed({ attributes: {}, id: urlParams.id }),
    },
    Campus: {
      create: ({ payload }: { payload: unknown }) =>
        Effect.succeed({ attributes: {}, id: 'new_campus_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.succeed({ attributes: {}, id: urlParams.id }),
    },
    Person: {
      create: ({ payload }: { payload: unknown }) => Effect.fail(new Error('PCO API error')),
      delete: () => Effect.fail(new Error('PCO API error')),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.fail(new Error('PCO API error')),
    },
    PhoneNumber: {
      create: ({ payload }: { payload: unknown }) =>
        Effect.succeed({ attributes: {}, id: 'new_phone_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: ({ payload, urlParams }: { payload: unknown; urlParams: { id: string } }) =>
        Effect.succeed({ attributes: {}, id: urlParams.id }),
    },
    token: 'test-token',
  } as unknown as PcoHttpClient
})

/**
 * Context tags and layers for mock clients
 */
interface MockPcoHttpClient extends Effect.Effect.Success<typeof makeMockPcoHttpClient> {}
export const MockPcoHttpClient = Context.GenericTag<MockPcoHttpClient>('test/MockPcoHttpClient')
export const MockPcoHttpClientLive = Layer.effect(PcoHttpClient, makeMockPcoHttpClient)

interface MockPcoHttpClientWithErrors
  extends Effect.Effect.Success<typeof makeMockPcoHttpClientWithErrors> {}
export const MockPcoHttpClientWithErrors = Context.GenericTag<MockPcoHttpClientWithErrors>(
  'test/MockPcoHttpClientWithErrors',
)
export const MockPcoHttpClientWithErrorsLive = Layer.effect(
  PcoHttpClient,
  makeMockPcoHttpClientWithErrors,
)
