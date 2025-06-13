// import type { EndpointDefinition } from '@openfaith/adapter-core/api2/endpointTypes'
// import type { EntityManifest } from '@openfaith/adapter-core/api2/entityManifest'
// import type { ApiClient as IApiClient } from '@openfaith/adapter-core/api3/clientTypes'
// import { createEndpointHandler } from '@openfaith/adapter-core/api3/endpointHandler'
// import type { ResponseAdapter } from '@openfaith/adapter-core/api3/responseAdapter'
// import { pipe, Record } from 'effect'

// // The ApiClient class.
// // We no longer need to implement the interface here, as the creator function will handle the typing.
// export class ApiClient<const M extends EntityManifest, A extends ResponseAdapter> {
//   // Use a simple index signature to allow dynamic properties.
//   [key: string]: any

//   constructor(manifest: M, adapter: A, config: { baseUrl: string; bearerToken: string }) {
//     // Use a standard `for...in` loop. This is imperative, direct, and easy for TS to follow.
//     for (const entityKey in manifest) {
//       const entityEntry = manifest[entityKey]!
//       const moduleName = entityEntry.module

//       // 1. Ensure the module object (e.g., this.people) exists.
//       if (!this[moduleName]) {
//         this[moduleName] = {}
//       }

//       const definedEndpoints = pipe(
//         entityEntry.endpoints,
//         Record.filter((e): e is EndpointDefinition => e !== undefined),
//       )

//       // 2. Loop through the endpoints for this entity.
//       for (const endpointKey in definedEndpoints) {
//         const definition = definedEndpoints[endpointKey]!

//         const isSingle = definition.path.includes('/:')
//         const responseSchema = isSingle
//           ? adapter.adaptSingle(definition.apiSchema)
//           : adapter.adaptCollection(definition.apiSchema)

//         const handler = createEndpointHandler(definition, responseSchema, config)
//         const methodName = definition.name.split('.').pop()!

//         // 3. Direct, imperative assignment.
//         // e.g., this.people.getAll = handler
//         this[moduleName][methodName] = handler
//       }
//     }
//   }
// }

// /**
//  * The public-facing factory function for creating a new API client.
//  * This is the only function a consumer of the library needs to import.
//  */
// export function createApiClient<const M extends EntityManifest, A extends ResponseAdapter>(
//   manifest: M,
//   adapter: A,
//   config: { baseUrl: string; bearerToken: string },
// ): IApiClient<M, A> {
//   // Returns our powerful, static interface type

//   // The creator function instantiates the class and casts the result.
//   // This is the bridge between the dynamic runtime construction and the
//   // static type system.
//   return new ApiClient(manifest, adapter, config) as IApiClient<M, A>
// }
