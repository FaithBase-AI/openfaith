// import type {
//   EndpointDefinition,
//   GetEndpointDefinition,
// } from '@openfaith/adapter-core/api2/endpointTypes'
// import type { EntityManifest } from '@openfaith/adapter-core/api2/entityManifest'
// import type { buildGetInputSchema } from '@openfaith/adapter-core/api3/endpointHandler'
// import type { ResponseAdapter } from '@openfaith/adapter-core/api3/responseAdapter'
// import type { Effect, Schema } from 'effect'

// // Unchanged...
// export type EndpointHandler<Input, Output> = (params?: Input) => Effect.Effect<Output>
// export type GetInput<Def extends GetEndpointDefinition<any, any, any, any>> = Schema.Schema.Type<
//   ReturnType<
//     typeof buildGetInputSchema<
//       Def['name'],
//       Def['apiSchema'],
//       Def['canonicalSchema'],
//       Def['includes']
//     >
//   >
// >
// export type GetOutput<
//   Def extends EndpointDefinition,
//   Adapter extends ResponseAdapter,
// > = Def['path'] extends `${string}/:${string}`
//   ? Schema.Schema.Type<ReturnType<Adapter['adaptSingle']>>
//   : Schema.Schema.Type<ReturnType<Adapter['adaptCollection']>>
// export type HandlerFor<
//   Def extends EndpointDefinition,
//   Adapter extends ResponseAdapter,
// > = Def extends GetEndpointDefinition<any, any, any, any>
//   ? EndpointHandler<GetInput<Def>, GetOutput<Def, Adapter>>
//   : never

// // =============================================================================
// // Client Type (Final Simplification)
// // =============================================================================

// type MethodName<T extends string> = T extends `${string}.${infer Method}` ? Method : T
// type NonUndefined<T> = T extends undefined ? never : T

// // This maps an entity's endpoints to methods. (Unchanged)
// type ClientMethodsForEntry<
//   Entry extends EntityManifest[keyof EntityManifest],
//   Adapter extends ResponseAdapter,
// > = {
//   [K in keyof Entry['endpoints'] as MethodName<
//     NonUndefined<Entry['endpoints'][K]>['name']
//   >]: HandlerFor<NonUndefined<Entry['endpoints'][K]>, Adapter>
// }

// // A utility to find all manifest entries for a given module.
// type EntriesForModule<Manifest extends EntityManifest, M extends string> = {
//   [K in keyof Manifest as Manifest[K]['module'] extends M ? K : never]: Manifest[K]
// }

// // A utility to merge multiple objects. This is the key to solving the error.
// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
//   ? I
//   : never

// // The main ApiClient type, refactored for clarity and correctness.
// export type ApiClient<Manifest extends EntityManifest, Adapter extends ResponseAdapter> = {
//   // Map over all unique module names (e.g., 'people').
//   [M in Manifest[keyof Manifest]['module']]: UnionToIntersection<
//     // For each module, create a union of all possible ClientMethods objects.
//     {
//       [K in keyof EntriesForModule<Manifest, M>]: ClientMethodsForEntry<
//         EntriesForModule<Manifest, M>[K],
//         Adapter
//       >
//     }[keyof EntriesForModule<Manifest, M>]
//   >
// } & {}
