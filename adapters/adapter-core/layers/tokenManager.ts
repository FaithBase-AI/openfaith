import { Context, type Effect } from 'effect'

export class TokenKey extends Context.Tag('@openfaith/adapter-core/layers/tokenManager/TokenKey')<
  TokenKey,
  string
>() {}

// The shape of the token data your library needs to manage.
export interface TokenState {
  readonly accessToken: string
  readonly refreshToken: string
  readonly createdAt: Date
  readonly expiresIn: number
  readonly tokenKey: string
  readonly adapter: string

  readonly orgId: string
  readonly userId: string
}

// The service interface the user must implement.
export class TokenManager extends Context.Tag(
  '@openfaith/adapter-core/layers/tokenManager/TokenManager',
)<
  TokenManager,
  {
    // How to load the initial token state from the user's storage.
    readonly loadTokenState: (lookupKey: string) => Effect.Effect<TokenState, unknown>
    // How to save the new token state after a successful refresh.
    readonly saveTokenState: (state: TokenState) => Effect.Effect<void, unknown>
  }
>() {}
