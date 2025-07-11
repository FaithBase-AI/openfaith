import { HttpApiClient, HttpClientError, HttpClientRequest } from '@effect/platform'
import { TokenAuth, TokenKey, TokenManager, type TokenState } from '@openfaith/adapter-core/server'
import { PcoApi } from '@openfaith/pco/server'
import { env } from '@openfaith/shared'
import { Clock, Effect, HashMap, Layer, Option, Redacted, Ref } from 'effect'

export const TokenAuthLive = Layer.scoped(
  TokenAuth,
  Effect.gen(function* () {
    const tokenManager = yield* TokenManager
    const tokenKey = yield* TokenKey

    // This lock is for the REFRESH operation.
    const tokenRefreshLock = yield* Effect.makeSemaphore(1)
    // This lock is for the INITIAL LOAD operation for a new key.
    const tokenLoadLock = yield* Effect.makeSemaphore(1)

    // const tokenCache = yield* Ref.make(new Map<string, Ref.Ref<TokenState>>())
    const tokenCache = yield* Ref.make(HashMap.empty<string, Ref.Ref<TokenState>>())

    const pcoClient = yield* HttpApiClient.make(PcoApi, {
      baseUrl: 'https://api.planningcenteronline.com',
    })

    const getOrgTokenStateRef = (tokenKey: string) =>
      Effect.gen(function* () {
        const cached = yield* Ref.get(tokenCache).pipe(Effect.map(HashMap.get(tokenKey)))

        if (Option.isSome(cached)) {
          return cached.value
        }

        // Cache miss. We need to load from the user's TokenManager.
        // Use a lock to ensure only one fiber loads the token for a new key.
        return yield* tokenLoadLock.withPermits(1)(
          Effect.gen(function* () {
            // Double-check after acquiring the lock.
            const cachedAfterLock = yield* Ref.get(tokenCache).pipe(
              Effect.map(HashMap.get(tokenKey)),
            )
            if (Option.isSome(cachedAfterLock)) {
              return cachedAfterLock.value
            }

            // We are the designated loader for this key.
            const initialState = yield* tokenManager.loadTokenState(tokenKey)
            const newRef = yield* Ref.make(initialState)
            yield* Ref.update(tokenCache, HashMap.set(tokenKey, newRef))
            return newRef
          }),
        )
      })

    const getValidAccessToken = Effect.gen(function* () {
      const tokenStateRef = yield* getOrgTokenStateRef(tokenKey)
      const state = yield* Ref.get(tokenStateRef)
      const now = yield* Clock.currentTimeMillis

      // Calculate expiration time from createdAt + expiresIn
      const expirationTime = state.createdAt.getTime() + state.expiresIn * 1000
      if (expirationTime - 60_000 >= now) {
        return Redacted.make(state.accessToken)
      }

      const refreshEffect = Effect.gen(function* () {
        const currentState = yield* Ref.get(tokenStateRef)
        const nowAfterLock = yield* Clock.currentTimeMillis
        const currentExpirationTime =
          currentState.createdAt.getTime() + currentState.expiresIn * 1000
        if (currentExpirationTime - 60_000 >= nowAfterLock) {
          return Redacted.make(currentState.accessToken)
        }

        console.log(`Token for key "${tokenKey}" expired. Refreshing now...`)
        const newTokens = yield* pcoClient.token.refreshToken({
          urlParams: {
            client_id: env.VITE_PLANNING_CENTER_CLIENT_ID,
            client_secret: env.PLANNING_CENTER_SECRET,
            grant_type: 'refresh_token',
            refresh_token: currentState.refreshToken,
          },
        })

        const refreshTime = new Date(yield* Clock.currentTimeMillis)
        const newState: TokenState = {
          accessToken: newTokens.access_token,
          adapter: currentState.adapter,
          createdAt: refreshTime,
          expiresIn: newTokens.expires_in,
          orgId: currentState.orgId, // Preserve the original key
          refreshToken: newTokens.refresh_token,
          tokenKey: currentState.tokenKey,
          userId: currentState.userId,
        }

        // Save and update the state
        yield* tokenManager.saveTokenState(newState)
        yield* Ref.set(tokenStateRef, newState)

        console.log(`Token for key "${tokenKey}" refresh successful.`)
        return Redacted.make(newState.accessToken)
      })

      return yield* tokenRefreshLock.withPermits(1)(refreshEffect)
    }).pipe(
      Effect.mapError(
        (x) =>
          new HttpClientError.RequestError({
            cause: x,
            description: 'Failed to get valid access token',
            reason: 'Transport',
            request: HttpClientRequest.make('POST')('unknown'),
          }),
      ),
    )

    return TokenAuth.of({ getValidAccessToken })
  }),
)
