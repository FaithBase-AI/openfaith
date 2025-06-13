// import { HttpClient, HttpClientRequest, HttpClientResponse, UrlParams } from '@effect/platform'
// import type { HttpClientError } from '@effect/platform/HttpClientError'
// import type {
//   EndpointDefinition,
//   GetEndpointDefinition,
// } from '@openfaith/adapter-core/api2/endpointTypes'
// import type { GetInput, GetOutput } from '@openfaith/adapter-core/api3/clientTypes'
// import {
//   buildGetInputSchema,
//   transformPcoParams,
// } from '@openfaith/adapter-core/api3/endpointHandler'
// import type { ResponseAdapter } from '@openfaith/adapter-core/api3/responseAdapter'
// import { Effect, pipe, Schema } from 'effect'
// import type { ParseError } from 'effect/ParseResult'

// /**
//  * The final, executable request builder.
//  */
// export class ApiRequestBuilder<Def extends EndpointDefinition, Adapter extends ResponseAdapter> {
//   constructor(
//     private readonly definition: Def,
//     private readonly adapter: Adapter,
//     private readonly config: { baseUrl: string; bearerToken: string },
//     private readonly params: GetInput<
//       Def extends GetEndpointDefinition<any, any, any, any> ? Def : never
//     >,
//   ) {}

//   public execute(): Effect.Effect<
//     GetOutput<Def, Adapter>,
//     ParseError | HttpClientError,
//     HttpClient.HttpClient
//   > {
//     const responseSchema = this.definition.path.includes('/:')
//       ? this.adapter.adaptSingle(this.definition.apiSchema)
//       : this.adapter.adaptCollection(this.definition.apiSchema)

//     const fetcher = (flatParams: Record<string, string>) =>
//       pipe(
//         HttpClientRequest.get(`${this.config.baseUrl}${this.definition.path}`),
//         HttpClientRequest.bearerToken(this.config.bearerToken),
//         HttpClientRequest.setUrlParams(UrlParams.fromInput(Object.entries(flatParams))),
//         HttpClient.execute,
//         Effect.flatMap(
//           HttpClientResponse.schemaBodyJson(
//             responseSchema as Schema.Schema<GetOutput<Def, Adapter>>,
//           ),
//         ),
//       )

//     return pipe(
//       Schema.encode(buildGetInputSchema(this.definition as any))(this.params as any),
//       Effect.map(transformPcoParams),
//       Effect.flatMap(fetcher),
//     )
//   }
// }

// /**
//  * Represents a module of the API (e.g., `people`).
//  * Uses a Proxy to dynamically create methods like `getAll`, `getById`.
//  */
// export class ApiModule<Endpoints extends Record<string, EndpointDefinition>> {
//   constructor(
//     private readonly endpoints: Endpoints,
//     private readonly adapter: ResponseAdapter,
//     private readonly config: { baseUrl: string; bearerToken: string },
//   ) {}

//   create() {
//     return new Proxy(this, {
//       get: (target, prop: string) => {
//         // The key for the endpoints object is the operation name (e.g., 'getAll')
//         const endpointDef = target.endpoints[prop]

//         if (!endpointDef) {
//           // This check is important for runtime safety, although TS should prevent this.
//           return undefined
//         }

//         return (params: any) =>
//           new ApiRequestBuilder(endpointDef, target.adapter, target.config, params)
//       },
//     })
//   }
// }
