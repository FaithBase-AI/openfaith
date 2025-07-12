import { FetchHttpClient } from '@effect/platform'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { adaptersApi } from '@openfaith/api/adapters/adaptersApi'
import { createTRPCRouter, orgProcedure } from '@openfaith/api/trpc'
import { adapterDetailsTable, adapterTokensTable, DBLive } from '@openfaith/db'
import { asyncNoOp } from '@openfaith/shared'
import { fromUnixTime } from 'date-fns/fp'
import { Effect, Option, pipe, Record, Schema } from 'effect'

export const AdapterConnectRequest = Schema.Struct({
  adapter: Schema.String,
  code: Schema.String,
  redirectUri: Schema.String,
})
export type AdapterConnectRequest = typeof AdapterConnectRequest.Type

export const AdapterConnectResponse = Schema.Literal('success', 'failed')
export type AdapterConnectResponse = typeof AdapterConnectResponse.Type

export const adapterRouter = createTRPCRouter({
  adapterConnect: orgProcedure
    .input(Schema.decodeUnknownSync(AdapterConnectRequest))
    .output(Schema.decodeUnknownSync(AdapterConnectResponse))
    .mutation(async ({ input, ctx: { session } }) => {
      const userId = session.user.id
      const orgId = pipe(
        session.session,
        Option.fromNullable,
        Option.flatMapNullable((x) => x.activeOrganizationId),
        Option.getOrElse(() => 'noOrganization'),
      )

      try {
        console.log('adapterConnect start')

        await pipe(
          adaptersApi,
          Record.get(input.adapter as keyof typeof adaptersApi),
          Option.match({
            onNone: asyncNoOp,
            onSome: async (adapter) =>
              Effect.gen(function* () {
                const db = yield* PgDrizzle.PgDrizzle

                const token = yield* adapter.fetchTokenE({
                  code: input.code,
                  redirectUri: input.redirectUri,
                })

                const createdAt = pipe(token.createdAt, fromUnixTime)

                yield* Effect.all([
                  db
                    .insert(adapterTokensTable)
                    .values({
                      accessToken: token.accessToken,
                      adapter: adapter._tag,
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
                      adapter: adapter._tag,
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
                ])
              }).pipe(
                Effect.provide(FetchHttpClient.layer),
                Effect.provide(DBLive),
                Effect.catchAllCause(Effect.logError),
                Effect.runPromise,
              ),
          }),
        )

        console.log('adapterConnect finish')
      } catch (error) {
        console.log(error)
      }

      return 'success' as const
    }),
})
