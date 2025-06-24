import { HttpApiClient } from '@effect/platform'
import { PcoApi } from '@openfaith/pco/server'
import { Effect } from 'effect'

export const mkPcoServerAdapter = (params: { clientId: string; clientSecret: string }) => {
  const { clientId, clientSecret } = params

  return {
    _tag: 'pco',
    fetchTokenE: Effect.fn('fetchTokenE')(function* (params: {
      code: string
      redirectUri: string
    }) {
      const { code, redirectUri } = params
      const pcoClient = yield* HttpApiClient.make(PcoApi, {
        baseUrl: 'https://api.planningcenteronline.com',
      })

      const token = yield* pcoClient.token.getToken({
        urlParams: {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        },
      })

      return {
        accessToken: token.access_token,
        createdAt: token.created_at,
        expiresIn: token.expires_in,
        refreshToken: token.refresh_token,
        tokenType: token.token_type,
      }
    }),
  }
}
