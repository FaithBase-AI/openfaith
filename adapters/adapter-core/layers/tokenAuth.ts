import type { HttpClientError } from '@effect/platform'
import { Context, type Effect, type Redacted } from 'effect'

export class TokenAuth extends Context.Tag('@openfaith/adapter-core/layers/tokenAuth')<
  TokenAuth,
  {
    readonly getValidAccessToken: Effect.Effect<
      Redacted.Redacted<string>,
      HttpClientError.HttpClientError
    >
  }
>() {}
