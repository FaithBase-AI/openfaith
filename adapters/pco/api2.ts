import { HttpApi, type HttpApiError, HttpApiGroup, OpenApi } from '@effect/platform'
import { createEndpointTransformer } from '@openfaith/adapter-core/api2/endpointAdapter'
import { pcoResponseAdapter } from '@openfaith/pco/base/pcoResponseAdapter'
import { pcoEntityManifest } from '@openfaith/pco/pcoEntityManifest'
import { Array, pipe, Record } from 'effect'

/**
 * Creates a transformer function specifically configured for the PCO API.
 * It uses the `pcoResponseAdapter` to correctly handle PCO's JSON:API response structure.
 */
const pcoEndpointTransformer = createEndpointTransformer(pcoResponseAdapter)

/**
 * Dynamically builds a map of `HttpApiGroup` objects from the PCO entity manifest.
 *
 * It iterates through each entity in the manifest, transforms all of its defined
 * endpoints into platform-native `HttpApiEndpoint` objects, and groups them
 * by their specified `module`.
 */

const apiGroups = pipe(
  pcoEntityManifest,
  Record.values,
  Array.map((x) => {
    const platformEndpoints = pipe(x.endpoints, Record.values, Array.map(pcoEndpointTransformer))
    let group = HttpApiGroup.make(x.module) as HttpApiGroup.HttpApiGroup<
      typeof x.module,
      (typeof platformEndpoints)[number],
      never,
      never,
      false
    >

    for (const endpoint of platformEndpoints) {
      group = group.add(endpoint)
    }

    return group
  }),
)

/**
 * The complete, static definition of the Planning Center Online API.
 *
 * This `HttpApi` object is the single source of truth for the entire API surface.
 * It is constructed by combining all the `HttpApiGroup`s generated from the manifest.
 *
 * This object can be used to:
 * 1. Derive a fully-typed `HttpApiClient`.
 * 2. Generate an OpenAPI (Swagger) specification.
 * 3. Implement a mock server for testing.
 */
export const PcoApi = (() => {
  let api = HttpApi.make('PCO') as HttpApi.HttpApi<
    'PCO',
    (typeof apiGroups)[number],
    HttpApiError.HttpApiDecodeError
  >
  for (const group of apiGroups) {
    // Correctly chain the .add() calls in a loop.
    api = api.add(group)
  }
  return api
})()

export const spec = OpenApi.fromApi(PcoApi)
