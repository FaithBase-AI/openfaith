// import { describe, expect, it } from 'bun:test'
// import { FetchHttpClient } from '@effect/platform'
// import { createApiClient } from '@openfaith/adapter-core/api3/client'
// import { pcoResponseAdapter } from '@openfaith/adapter-core/api3/testFixtures'
// import { pcoEntityManifest } from '@openfaith/pco/pcoEntityManifest'
// import { Effect, Layer } from 'effect'

// // =============================================================================
// // Test Utilities
// // =============================================================================

// function createMockHttpLayer(mockResponse: unknown, status = 200) {
//   const mockFetch = Layer.succeed(FetchHttpClient.Fetch, (() =>
//     Promise.resolve(
//       new Response(JSON.stringify(mockResponse), {
//         headers: { 'Content-Type': 'application/json' },
//         status,
//       }),
//     )) as unknown as typeof fetch)

//   return FetchHttpClient.layer.pipe(Layer.provide(mockFetch))
// }

// const testConfig = {
//   baseUrl: 'https://api.planningcenteronline.com',
//   bearerToken: 'fake-bearer-token',
// }

// // =============================================================================
// // Tests
// // =============================================================================

// describe('createApiClient', () => {
//   it('should create a client and correctly handle a GET collection request', async () => {
//     // --- Mock API Response ---
//     const mockApiResponse = {
//       data: [
//         {
//           attributes: {
//             accounting_administrator: false,
//             anniversary: null,
//             avatar: '',
//             birthdate: null,
//             child: false,
//             created_at: '2023-01-01T00:00:00Z',
//             demographic_avatar_url: '',
//             first_name: 'John',
//             gender: null,
//             given_name: null,
//             grade: null,
//             graduation_year: null,
//             inactivated_at: null,
//             last_name: 'Doe',
//             medical_notes: null,
//             membership: null,
//             middle_name: null,
//             name: 'John Doe',
//             nickname: null,
//             passed_background_check: false,
//             people_permissions: null,
//             remote_id: null,
//             school_type: null,
//             site_administrator: false,
//             status: 'active',
//             updated_at: '2023-01-01T00:00:00Z',
//           },
//           id: '1',
//           links: {
//             html: '/people/1',
//             self: '/v2/people/1',
//           },
//           relationships: {
//             primary_campus: {
//               data: null,
//             },
//           },
//           type: 'Person',
//         },
//       ],
//       included: [],
//       links: { self: '/v2/people' },
//       meta: { count: 1, total_count: 1 },
//     }

//     const testLayer = createMockHttpLayer(mockApiResponse)

//     // --- The Main Test Program ---
//     const program = Effect.gen(function* () {
//       // 1. Create the client using our factory.
//       const client = createApiClient(pcoEntityManifest, pcoResponseAdapter, testConfig)

//       // 2. Make a call using the generated client.
//       // Notice the full type-safety and autocompletion here!
//       const result = yield* client.people.getAll({
//         include: ['addresses'],
//         where: {
//           first_name: 'John',
//         },
//       })

//       // 3. Assert the results.
//       expect(result.data).toHaveLength(1)
//       expect(result.data[0].id).toBe('1')
//       expect(result.data[0].attributes.first_name).toBe('John')
//       expect(result.meta.count).toBe(1)

//       // 4. Test type inference (this is a compile-time check).
//       const person = result.data[0]
//       // The `attributes` property should be correctly typed from the `PCOPerson` schema.
//       const firstName: string | null = person.attributes.first_name
//       expect(firstName).toBe('John')
//     })

//     // Run the program with the mocked HTTP layer.
//     await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
//   })

//   it('should create a client and correctly handle a GET single resource request', async () => {
//     // --- Mock API Response ---
//     const mockApiResponse = {
//       data: {
//         attributes: {
//           accounting_administrator: false,
//           anniversary: null,
//           avatar: '',
//           birthdate: null,
//           child: false,
//           created_at: '2023-01-01T00:00:00Z',
//           demographic_avatar_url: '',
//           first_name: 'Jane',
//           gender: null,
//           given_name: null,
//           grade: null,
//           graduation_year: null,
//           inactivated_at: null,
//           last_name: 'Smith',
//           medical_notes: null,
//           membership: null,
//           middle_name: null,
//           name: 'Jane Smith',
//           nickname: null,
//           passed_background_check: false,
//           people_permissions: null,
//           remote_id: null,
//           school_type: null,
//           site_administrator: false,
//           status: 'inactive',
//           updated_at: '2023-01-01T00:00:00Z',
//         },
//         id: '123',
//         links: {
//           html: '/people/123',
//           self: '/v2/people/123',
//         },
//         relationships: {
//           primary_campus: {
//             data: null,
//           },
//         },
//         type: 'Person',
//       },
//       included: [],
//     }

//     const testLayer = createMockHttpLayer(mockApiResponse)

//     // --- The Main Test Program ---
//     const program = Effect.gen(function* () {
//       const client = createApiClient(pcoEntityManifest, pcoResponseAdapter, testConfig)

//       // The `getById` handler doesn't yet handle replacing the `:personId` placeholder.
//       // We will add this functionality next. For now, we call it without path params.
//       const result = yield* client.people.getById()

//       expect(result.data.id).toBe('123')
//       expect(result.data.attributes.first_name).toBe('Jane')
//     })

//     await Effect.runPromise(program.pipe(Effect.provide(testLayer)))
//   })
// })
