import { HttpApiClient } from '@effect/platform'
import type { SimpleRuntimeConfig } from '@openfaith/adapter-core/api/apiConfig'
import type { RelationshipDefinition } from '@openfaith/adapter-core/api2/endpointTypes'
import type { EntityManifest } from '@openfaith/adapter-core/api2/entityManifest'
import type { PcoApi } from '@openfaith/pco/api2'
import type { pcoEntityManifest } from '@openfaith/pco/pcoEntityManifest'
import type { Schema } from 'effect'
import { Array, Effect, pipe, Record, String } from 'effect'

// --- Type-level magic for dynamic 'include' types ---

/** A helper to get the type of a schema's successful output. */
type SchemaType<S> = S extends Schema.Schema<any, infer A> ? A : never

/** Computes the type for a single included relationship. */
type IncludedType<R extends RelationshipDefinition<any>> = R['type'] extends 'to_one'
  ? SchemaType<(typeof pcoEntityManifest)[R['entity']]['canonicalSchema']> | null
  : Array<SchemaType<(typeof pcoEntityManifest)[R['entity']]['canonicalSchema']>>

/** Computes the final return shape with included relationships. */
type WithIncludes<
  Base,
  Relationships extends Record<string, RelationshipDefinition<any>>,
  Includes extends ReadonlyArray<keyof Relationships>,
> = Base & {
  [K in Includes[number]]: IncludedType<Relationships[K]>
}

// A placeholder for our stitching and transformation logic.
// In a real implementation, these would be more robust.
function stitch(data: Array<any>, included?: Array<any>): Array<any> {
  if (!included || included.length === 0) {
    return data
  }
  const includedMap = new Map<string, any>()
  for (const item of included) {
    includedMap.set(`${item.type}:${item.id}`, item.attributes)
  }
  return data.map((item) => {
    const enriched = { ...item.attributes, id: item.id }
    for (const key in item.relationships) {
      const relData = item.relationships[key]?.data
      if (!relData) continue

      if (Array.isArray(relData)) {
        enriched[key] = relData.map((r) => includedMap.get(`${r.type}:${r.id}`)).filter(Boolean)
      } else {
        enriched[key] = includedMap.get(`${relData.type}:${relData.id}`) ?? null
      }
    }
    return enriched
  })
}

function transform(data: Array<any>, schema: Schema.Schema.Any): Array<any> {
  // In a real app, this would use your pcoToOf transformer
  return data
}

/**
 * Creates a live, executable API client from a static API definition and runtime configuration.
 *
 * This function generates a high-level client with a user-friendly interface. It wraps
 * the base `@effect/platform` client to provide advanced features like dynamically-typed
 * `include` parameters.
 *
 * @param api The static `HttpApi` definition object for the target API.
 * @param manifest The Entity Manifest containing schemas and relationship metadata.
 * @param config The runtime configuration with the `baseUrl` and `authToken`.
 * @returns An `Effect` that resolves to the fully-typed, high-level API client.
 */
export function createApi(
  api: typeof PcoApi,
  manifest: EntityManifest,
  config: SimpleRuntimeConfig,
) {
  // 1. Create the runtime layer for authentication.
  // const authLayer = Layer.effect(
  //   HttpClient.HttpClient,
  //   Effect.gen(function* () {
  //     const baseClient = yield* HttpClient.HttpClient
  //     return HttpClient.make((request) =>
  //       baseClient(request.pipe(HttpClientRequest.bearerToken(config.authToken))),
  //     )
  //   }),
  // )

  // 2. Derive the low-level base client.
  const baseClientEffect = HttpApiClient.make(api, {
    baseUrl: config.baseUrl,
  })
  // .pipe(Effect.provide(authLayer))

  // 3. Build the high-level client by wrapping the base client.
  return Effect.map(baseClientEffect, (baseClient) => {
    const highLevelClient = {}

    // Iterate over the manifest to build the client structure dynamically
    for (const entry of pipe(manifest, Record.values)) {
      // `getAll` is our primary target for this wrapping logic
      const getAllDef = entry.endpoints.getAll
      if (!getAllDef) continue

      const nameParts = pipe(getAllDef.name, String.split('.'))
      let currentLevel = highLevelClient

      // Create nested objects (e.g., client.people.phoneNumbers)
      for (let i = 0; i < nameParts.length - 1; i++) {
        const part = nameParts[i]
        if (part) {
          if (i === 0 && part === getAllDef.module) continue // Skip redundant module name
          currentLevel[part] = currentLevel[part] || {}
          currentLevel = currentLevel[part]
        }
      }

      const methodName = pipe(nameParts, Array.last)

      // Define the high-level method (e.g., `getAll`)
      currentLevel[methodName] = (params: any) => {
        return Effect.gen(function* () {
          // A. Call the corresponding method on the low-level base client
          // @ts-ignore - Dynamically calling the method
          const rawResponse = yield* baseClient[getAllDef.module][methodName](params)

          // B. Perform runtime stitching and transformation
          const stitchedData = stitch(rawResponse.data, rawResponse.included)
          const canonicalData = transform(stitchedData, entry.canonicalSchema)

          // C. The return type is inferred by TypeScript from the function signature
          //    of the method we are creating. We will need to properly type the
          //    `highLevelClient` for this to work perfectly.
          return canonicalData
        })
      }
    }

    // This is a simplified dynamic build. A real implementation would have more robust
    // typing for the `highLevelClient` itself.
    return highLevelClient
  })
}
