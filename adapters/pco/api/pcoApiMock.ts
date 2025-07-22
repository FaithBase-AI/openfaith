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
      create: () => Effect.succeed({ attributes: {}, id: 'new_addr_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.succeed({ attributes: {}, id: 'addr_123' }),
    },
    Campus: {
      create: () => Effect.succeed({ attributes: {}, id: 'new_campus_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.succeed({ attributes: {}, id: 'campus_123' }),
    },
    Person: {
      create: () => Effect.succeed({ attributes: {}, id: 'new_pco_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.succeed({ attributes: {}, id: 'pco_123' }),
    },
    PhoneNumber: {
      create: () => Effect.succeed({ attributes: {}, id: 'new_phone_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.succeed({ attributes: {}, id: 'phone_123' }),
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
      create: () => Effect.succeed({ attributes: {}, id: 'new_addr_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.succeed({ attributes: {}, id: 'addr_123' }),
    },
    Campus: {
      create: () => Effect.succeed({ attributes: {}, id: 'new_campus_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.succeed({ attributes: {}, id: 'campus_123' }),
    },
    Person: {
      create: () => Effect.fail(new Error('PCO API error')),
      delete: () => Effect.fail(new Error('PCO API error')),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.fail(new Error('PCO API error')),
    },
    PhoneNumber: {
      create: () => Effect.succeed({ attributes: {}, id: 'new_phone_123' }),
      delete: () => Effect.succeed(undefined),
      get: () => Effect.succeed({ data: null, included: [] }),
      list: () => Effect.succeed({ data: [], included: [] }),
      update: () => Effect.succeed({ attributes: {}, id: 'phone_123' }),
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
