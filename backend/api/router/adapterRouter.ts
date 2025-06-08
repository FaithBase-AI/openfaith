import { FetchHttpClient } from '@effect/platform'
import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { createTRPCRouter, orgProcedure } from '@openfaith/api/trpc'
import { adapterDetailsTable, adapterTokenTable, DBLive } from '@openfaith/db'
import { fetchPcoTokenE } from '@openfaith/pco/server'
import { asyncNoOp, env } from '@openfaith/shared'
import { Effect, Option, pipe, Record, Schema } from 'effect'
import { adaptersApi } from './../adapters/adaptersApi'

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

                const createdAt = new Date()

                yield* Effect.all([
                  db.insert(adapterTokenTable).values({
                    accessToken: token.accessToken,
                    adapter: adapter._tag,
                    createdAt,
                    expiresIn: token.expiresIn,
                    orgId,
                    refreshToken: token.refreshToken,
                    userId,
                  }),
                  db.insert(adapterDetailsTable).values({
                    adapter: adapter._tag,
                    createdAt,
                    enabled: true,
                    orgId,
                    syncStatus: [],
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

        switch (input.adapter) {
          case 'pco': {
            const token = await Effect.gen(function* () {
              const db = yield* PgDrizzle.PgDrizzle

              const token = yield* fetchPcoTokenE({
                clientId: env.VITE_PLANNING_CENTER_CLIENT_ID,
                clientSecret: env.PLANNING_CENTER_SECRET,
                code: input.code,
                grantType: 'authorization_code',
                redirectUri: input.redirectUri,
              })

              const createdAt = new Date()

              yield* Effect.all([
                db.insert(adapterTokenTable).values({
                  accessToken: token.accessToken,
                  adapter: 'pco',
                  createdAt,
                  expiresIn: token.expiresIn,
                  orgId,
                  refreshToken: token.refreshToken,
                  userId,
                }),
                db.insert(adapterDetailsTable).values({
                  adapter: 'pco',
                  createdAt,
                  enabled: true,
                  orgId,
                  syncStatus: [],
                }),
              ])
            }).pipe(
              Effect.provide(FetchHttpClient.layer),
              Effect.provide(DBLive),
              Effect.catchAllCause(Effect.logError),
              Effect.runPromise,
            )

            console.log(token)
            break
          }
          default:
            break
        }

        console.log('adapterConnect finish')
      } catch (error) {
        console.log(error)
      }

      return 'success' as const
    }),
})
