import { HttpClient } from '@effect/platform'
import { MockPcoHttpClientLayer } from '@openfaith/pco/api/pcoMockClient'
import { Effect } from 'effect'

/**
 * Example usage of MockPcoHttpClientLayer
 *
 * This mock provides a basic HttpClient that returns empty PCO entity responses.
 * You can use this in tests to avoid making real HTTP requests to the PCO API.
 *
 * The mock returns responses matching the PCO API structure with empty attributes ({}).
 * You can extend this mock later to return custom mock data as needed.
 */

// Example 1: Basic HTTP client usage
export const exampleBasicUsage = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient

  // Make a GET request to the PCO People API
  const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people')
  const json = yield* response.json

  // The mock will return:
  // {
  //   data: [{ id: '1', type: 'Person', attributes: {}, links: {} }],
  //   included: [],
  //   links: { self: 'https://api.planningcenteronline.com/mock' },
  //   meta: { count: 1, total_count: 1, can_include: [] }
  // }

  return json
}).pipe(Effect.provide(MockPcoHttpClientLayer))

// Example 2: Get a single entity by ID
export const exampleGetById = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient

  // Make a GET request for a specific person
  const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people/123')
  const json = yield* response.json

  // The mock will return:
  // {
  //   data: { id: '123', type: 'Person', attributes: {}, links: {} },
  //   included: []
  // }

  return json
}).pipe(Effect.provide(MockPcoHttpClientLayer))

// Example 3: Different entity types
export const exampleDifferentEntities = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient

  // Get addresses
  const addressResponse = yield* client.get(
    'https://api.planningcenteronline.com/people/v2/addresses',
  )
  const addresses = yield* addressResponse.json
  // Returns: { data: [{ id: '1', type: 'Address', attributes: {}, ... }], ... }

  // Get campuses
  const campusResponse = yield* client.get(
    'https://api.planningcenteronline.com/people/v2/campuses/456',
  )
  const campus = yield* campusResponse.json
  // Returns: { data: { id: '456', type: 'Campus', attributes: {}, ... }, ... }

  // Get phone numbers
  const phoneResponse = yield* client.get(
    'https://api.planningcenteronline.com/people/v2/phone_numbers',
  )
  const phones = yield* phoneResponse.json
  // Returns: { data: [{ id: '1', type: 'PhoneNumber', attributes: {}, ... }], ... }

  return {
    addresses,
    campus,
    phones,
  }
}).pipe(Effect.provide(MockPcoHttpClientLayer))

// Example 4: Using in tests
// In your test files, you can use the mock like this:
//
// import { effect } from '@openfaith/bun-test'
// import { MockPcoHttpClientLayer } from '@openfaith/pco/api/pcoMockClient'
//
// effect('test PCO API integration', () =>
//   Effect.gen(function* () {
//     const client = yield* HttpClient.HttpClient
//     const response = yield* client.get('https://api.planningcenteronline.com/people/v2/people')
//     const json = yield* response.json
//
//     expect(json.data).toHaveLength(1)
//     expect(json.data[0].type).toBe('Person')
//   }).pipe(Effect.provide(MockPcoHttpClientLayer))
// )

/**
 * Extending the mock with custom data
 *
 * If you need to return specific mock data instead of empty attributes,
 * you can create a custom mock client based on the pattern in pcoMockClient.ts:
 *
 * 1. Create a new HttpClient using HttpClient.make()
 * 2. Customize the mkMockPcoResponse function to return your desired data
 * 3. Create a new Layer with your custom client
 *
 * Example:
 *
 * const customMockClient = HttpClient.make(
 *   Effect.fn('customMockClient')(function* (request) {
 *     // Parse request and return custom responses based on URL
 *     const mockData = {
 *       data: {
 *         id: '123',
 *         type: 'Person',
 *         attributes: {
 *           first_name: 'John',
 *           last_name: 'Doe',
 *           email: 'john@example.com'
 *         },
 *         links: {}
 *       },
 *       included: []
 *     }
 *
 *     return HttpClientResponse.fromWeb(
 *       request,
 *       new Response(JSON.stringify(mockData), {
 *         headers: { 'content-type': 'application/json' },
 *         status: 200
 *       })
 *     )
 *   })
 * )
 *
 * export const CustomMockLayer = Layer.succeed(HttpClient.HttpClient, customMockClient)
 */
