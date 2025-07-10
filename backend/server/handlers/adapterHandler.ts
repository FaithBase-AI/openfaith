import { FetchHttpClient } from '@effect/platform'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { adaptersApi } from '@openfaith/api/adapters/adaptersApi'
import { adapterDetailsTable, adapterTokenTable, DBLive } from '@openfaith/db'
import { AdapterConnectError, AdapterRpc } from '@openfaith/domain'
import { fromUnixTime } from 'date-fns/fp'
import { Effect, Layer, Option, pipe, Record } from 'effect'

export const AdapterHandlerLive = AdapterRpc.toLayer(
  Effect.gen(function* () {
    return {
      adapterConnect: ({ adapter, code, redirectUri }) =>
        Effect.gen(function* () {
          console.log('🔌 Adapter connect start:', adapter)

          // For now, we'll need to get session context from somewhere
          // This is a placeholder - in a real implementation, you'd get this from middleware
          const userId = 'placeholder-user-id'
          const orgId = 'placeholder-org-id'

          const adapterImpl = yield* pipe(
            adaptersApi,
            Record.get(adapter as keyof typeof adaptersApi),
            Option.match({
              onNone: () =>
                Effect.fail(
                  new AdapterConnectError({
                    adapter,
                    message: 'Adapter not found',
                  }),
                ),
              onSome: (adapter) => Effect.succeed(adapter),
            }),
          )

          const db = yield* PgDrizzle.PgDrizzle

          const token = yield* adapterImpl
            .fetchTokenE({
              code,
              redirectUri,
            })
            .pipe(
              Effect.catchAll((error) =>
                Effect.fail(
                  new AdapterConnectError({
                    adapter,
                    cause: String(error),
                    message: 'Failed to fetch token',
                  }),
                ),
              ),
            )

          const createdAt = pipe(token.createdAt, fromUnixTime)

          yield* Effect.all([
            db
              .insert(adapterTokenTable)
              .values({
                accessToken: token.accessToken,
                adapter: adapterImpl._tag,
                createdAt,
                expiresIn: token.expiresIn,
                orgId,
                refreshToken: token.refreshToken,
                userId,
              })
              .onConflictDoUpdate({
                set: {
                  accessToken: token.accessToken,
                  createdAt,
                  expiresIn: token.expiresIn,
                  refreshToken: token.refreshToken,
                },
                target: [
                  adapterTokenTable.adapter,
                  adapterTokenTable.orgId,
                  adapterTokenTable.userId,
                ],
              }),
            db
              .insert(adapterDetailsTable)
              .values({
                adapter: adapterImpl._tag,
                createdAt,
                enabled: true,
                orgId,
                syncStatus: [],
              })
              .onConflictDoUpdate({
                set: {
                  enabled: true,
                },
                target: [adapterDetailsTable.adapter, adapterDetailsTable.orgId],
              }),
          ]).pipe(
            Effect.catchAll((error) =>
              Effect.fail(
                new AdapterConnectError({
                  adapter,
                  cause: String(error),
                  message: 'Failed to save adapter data',
                }),
              ),
            ),
          )

          console.log('✅ Adapter connect completed:', adapter)

          return 'success' as const
        }),
    }
  }),
).pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(DBLive))
