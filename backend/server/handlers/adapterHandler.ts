import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { adapterDetailsTable, adapterTokensTable } from '@openfaith/db'
import { AdapterConnectError, AdapterRpc, SessionContext } from '@openfaith/domain'
import { adaptersApi } from '@openfaith/server/adapters/adaptersApi'
import { WorkflowClient } from '@openfaith/workers/api/workflowClient'
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
          const userId = session.userId
          const orgId = session.activeOrganizationIdOpt.pipe(Option.getOrNull)

          if (!orgId) {
            return yield* Effect.fail(
              new AdapterConnectError({
                adapter,
                message: 'No organization found',
              }),
            )
          }

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

          // Kick off sync workflow for PCO adapter
          if (adapterImpl._tag === 'pco') {
            const workflowClient = yield* WorkflowClient
            console.log('🚀 Starting PCO sync workflow for org:', orgId)

            const result = yield* workflowClient.workflows
              .ExternalSyncWorkflow({
                payload: {
                  tokenKey: orgId,
                },
              })
              .pipe(
                Effect.catchAll((error) => {
                  console.error('❌ Failed to start PCO sync workflow:', error)
                  // Don't fail the adapter connection if workflow fails to start
                  return Effect.succeed(undefined)
                }),
              )

            console.log('✅ PCO sync workflow started:', result)
          }

          return 'success' as const
        }),
    }
  }),
)
