import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { adapterDetailsTable, adapterTokensTable } from '@openfaith/db'
import { AdapterConnectError, AdapterRpc, SessionContext } from '@openfaith/domain'
import { adaptersApi } from '@openfaith/server/adapters/adaptersApi'
import { fromUnixTime } from 'date-fns/fp'
import { Effect, Option, pipe, Record } from 'effect'

export const AdapterHandlerLive = AdapterRpc.toLayer(
  Effect.gen(function* () {
    return {
      adapterConnect: ({ adapter, code, redirectUri }) =>
        Effect.gen(function* () {
          console.log('🔌 Adapter connect start:', adapter)

          // Get authenticated user and org from session context
          const session = yield* SessionContext
          const userId = session.user.id
          const orgId = session.session.activeOrganizationId!

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
              .insert(adapterTokensTable)
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
                  adapterTokensTable.adapter,
                  adapterTokensTable.orgId,
                  adapterTokensTable.userId,
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
)
