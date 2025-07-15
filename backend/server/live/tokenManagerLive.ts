import { SqlError } from '@effect/sql'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { TokenManager } from '@openfaith/adapter-core/server'
import { adapterTokensTable } from '@openfaith/db'
import { and, eq } from 'drizzle-orm'
import { Array, Effect, Layer, pipe } from 'effect'

export const TokenManagerLive = Layer.effect(
  TokenManager,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.PgDrizzle

    return TokenManager.of({
      loadTokenState: (lookupKey) =>
        Effect.gen(function* () {
          const tokens = yield* db
            .select()
            .from(adapterTokensTable)
            .where(
              and(eq(adapterTokensTable.orgId, lookupKey), eq(adapterTokensTable.adapter, 'pco')),
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
            .update(adapterTokensTable)
            .set({
              accessToken: state.accessToken,
              createdAt: state.createdAt,
              expiresIn: state.expiresIn,
              refreshToken: state.refreshToken,
            })
            .where(
              and(
                eq(adapterTokensTable.orgId, state.orgId),
                eq(adapterTokensTable.adapter, state.adapter),
                eq(adapterTokensTable.userId, state.userId),
              ),
            )
        }),
    })
  }),
)
