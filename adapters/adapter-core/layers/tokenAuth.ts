import type { HttpClient, HttpClientError } from '@effect/platform'
import type { TokenKey, TokenManager } from '@openfaith/adapter-core/layers/tokenManager'
import { Context, type Effect, type Redacted } from 'effect'

export class TokenAuth extends Context.Tag('@openfaith/adapter-core/layers/tokenAuth')<
  TokenAuth,
  {
    readonly getValidAccessToken: Effect.Effect<
      Redacted.Redacted<string>,
      HttpClientError.HttpClientError,
      HttpClient.HttpClient | TokenKey | TokenManager
    >
  }
>() {}
