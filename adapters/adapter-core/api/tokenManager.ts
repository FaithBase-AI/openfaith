import { SqlError } from '@effect/sql'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { adapterTokenTable } from '@openfaith/db/schema/adaptersSchema'
import { and, eq } from 'drizzle-orm'
import { Array, Context, Effect, Layer, pipe } from 'effect'

export class TokenKey extends Context.Tag('OpenFaith/TokenKey')<TokenKey, string>() {}

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
export class TokenManager extends Context.Tag('OpenFaith/TokenManager')<
  TokenManager,
  {
    // How to load the initial token state from the user's storage.
    readonly loadTokenState: (lookupKey: string) => Effect.Effect<TokenState, unknown>
    // How to save the new token state after a successful refresh.
    readonly saveTokenState: (state: TokenState) => Effect.Effect<void, unknown>
  }
>() {}

export const TokenManagerLive = Layer.effect(
  TokenManager,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.PgDrizzle

    return TokenManager.of({
      loadTokenState: (lookupKey) =>
        Effect.gen(function* () {
          const tokens = yield* db
            .select()
            .from(adapterTokenTable)
            .where(
              and(eq(adapterTokenTable.orgId, lookupKey), eq(adapterTokenTable.adapter, 'pco')),
            )

          const tokenOpt = pipe(tokens, Array.head)

          if (tokenOpt._tag === 'None') {
            return yield* Effect.fail(
              new SqlError.SqlError({
                cause: 'No token found for org',
                message: `${lookupKey} doesn't have any tokens for PCO`,
              }),
            )
          }

          return {
            accessToken: tokenOpt.value.accessToken,
            adapter: tokenOpt.value.adapter,
            createdAt: tokenOpt.value.createdAt,
            expiresIn: tokenOpt.value.expiresIn,
            orgId: tokenOpt.value.orgId,
            refreshToken: tokenOpt.value.refreshToken,
            tokenKey: lookupKey,
            userId: tokenOpt.value.userId,
          }
        }),
      saveTokenState: (state) =>
        Effect.gen(function* () {
          yield* db
            .update(adapterTokenTable)
            .set({
              accessToken: state.accessToken,
              createdAt: state.createdAt,
              expiresIn: state.expiresIn,
              refreshToken: state.refreshToken,
            })
            .where(
              and(
                eq(adapterTokenTable.orgId, state.orgId),
                eq(adapterTokenTable.adapter, state.adapter),
                eq(adapterTokenTable.userId, state.userId),
              ),
            )
        }),
    })
  }),
)
