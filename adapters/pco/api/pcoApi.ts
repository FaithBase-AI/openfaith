import {
  HttpApi,
  HttpApiClient,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpClient,
  HttpClientRequest,
} from '@effect/platform'
import { TokenManagerLive, toHttpApiEndpoint } from '@openfaith/adapter-core/server'
import { PcoAuth, PcoAuthLive } from '@openfaith/pco/api/pcoAuthLayer'
import { pcoEntityManifest } from '@openfaith/pco/base/pcoEntityManifest'
import { PcoRefreshToken } from '@openfaith/pco/modules/token/pcoTokenSchema'
import { Effect, Layer, Schema } from 'effect'

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

const tokenApiGroup = HttpApiGroup.make('token').add(
  HttpApiEndpoint.post('refreshToken', '/oauth/token')
    .setUrlParams(
      Schema.Struct({
        client_id: Schema.String,
        client_secret: Schema.String,
        grant_type: Schema.Literal('refresh_token'),
        refresh_token: Schema.String,
      }),
    )
    .addSuccess(PcoRefreshToken),
)

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

export const PcoApi = HttpApi.make('PCO').add(peopleApiGroup).add(tokenApiGroup)

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
