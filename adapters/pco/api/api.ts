import {
  HttpApi,
  HttpApiClient,
  HttpApiGroup,
  HttpClient,
  HttpClientRequest,
} from '@effect/platform'
import { toHttpApiEndpoint } from '@openfaith/adapter-core/api/endpointAdapter'
import { PcoAuth, PcoAuthLive } from '@openfaith/pco/api/authLayer'
import { TokenManagerLive } from '@openfaith/pco/api/tokenManager'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { Effect, Layer } from 'effect'

// import { getAllPeople, getAllPeople } from '@openfaith/pco/people/pcoPeopleEndpoints'

// const apiGroups = pipe(
//   pcoEntityManifest,
//   Record.values,
//   Array.map((x) => {
//     const platformEndpoints = pipe(
//       x.endpoints,
//       Record.map((x) => toHttpApiEndpoint(x)),
//       Record.values,
//     )

//     const platformEndpointsTest = pipe(x.endpoints, Record.values)
//     let group = HttpApiGroup.make(x.module) as HttpApiGroup.HttpApiGroup<
//       typeof x.module,
//       (typeof platformEndpoints)[number],
//       never,
//       never,
//       false
//     >

//     for (const endpoint of platformEndpoints) {
//       group = group.add(endpoint)
//     }

//     return group
//   }),
// )

const peopleApiGroup = HttpApiGroup.make('people').add(
  toHttpApiEndpoint(pcoEntityManifest.Person.endpoints.getAll),
)
// .add(toHttpApiEndpoint(pcoEntityManifest.Person.endpoints.getById))
// .add(toHttpApiEndpoint(pcoEntityManifest.Person.endpoints.delete))
// These are causing issues.
// .add(toHttpApiEndpoint(pcoEntityManifest.Person.endpoints.update))
// .add(toHttpApiEndpoint(pcoEntityManifest.Person.endpoints.create))

// const PcoApi = HttpApi.make('PCO').add(peopleApiGroup)

// const PcoApiTest = (() => {
//   let api = HttpApi.make('PCO') as HttpApi.HttpApi<
//     'PCO',
//     (typeof apiGroups)[number],
//     HttpApiError.HttpApiDecodeError
//   >
//   for (const group of apiGroups) {
//     // Correctly chain the .add() calls in a loop.
//     api = api.add(group)
//   }
//   return api
// })()

export const PcoApi = HttpApi.make('PCO').add(peopleApiGroup)

export class PcoHttpClient extends Effect.Service<PcoHttpClient>()('PcoHttpClient', {
  effect: Effect.gen(function* () {
    const tokenService = yield* PcoAuth

    const client = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequestEffect(
        Effect.fn(function* (request) {
          const token = yield* tokenService.getValidAccessToken
          return HttpClientRequest.bearerToken(request, token)
        }),
      ),
    )
    return yield* HttpApiClient.makeWith(PcoApi, {
      baseUrl: 'https://api.planningcenteronline.com',
      httpClient: client,
    })
  }),
}) {}

export const PcoApiLayer = Layer.empty.pipe(
  Layer.provideMerge(PcoHttpClient.Default),
  Layer.provideMerge(PcoAuthLive),
  Layer.provideMerge(TokenManagerLive),
)
