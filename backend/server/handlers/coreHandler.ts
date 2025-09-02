import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { externalLinksTable } from '@openfaith/db'
import { CoreRpc, TestFunctionError } from '@openfaith/domain'
import { getEntityId } from '@openfaith/shared'
import { sql } from 'drizzle-orm'
import { Array, Effect, pipe } from 'effect'

export const CoreHandlerLive = CoreRpc.toLayer(
  Effect.gen(function* () {
    return {
      testFunction: () =>
        Effect.gen(function* () {
          console.log('🚀 Test function called')

          // Test onConflictDoNothing with returning
          const db = yield* PgDrizzle.PgDrizzle

          console.log('Testing onConflictDoNothing().returning() behavior...')

          // Prepare test data
          const existingLink = {
            _tag: 'externalLink' as const,
            adapter: 'pco',
            createdAt: new Date(),
            entityId: 'address_01k43891hcfvns3x8xp5jdydf5',
            entityType: 'address',
            externalId: '100036296',
            lastProcessedAt: new Date(),
            orgId: 'org_01k39802sbfapb2t6jfystch7s',
            syncing: false,
            updatedAt: new Date(),
          }

          const newLink = {
            _tag: 'externalLink' as const,
            adapter: 'pco',
            createdAt: new Date(),
            entityId: getEntityId('person'),
            entityType: 'person',
            externalId: 'test_external_id_' + Date.now(),
            lastProcessedAt: new Date(),
            orgId: 'org_01k39802sbfapb2t6jfystch7s',
            syncing: false,
            updatedAt: new Date(),
          }

          const linksToInsert = [existingLink, newLink]

          console.log('Attempting to insert 2 rows:')
          console.log('1. Existing link (should conflict):', {
            entityType: existingLink.entityType,
            externalId: existingLink.externalId,
          })
          console.log('2. New link (should insert):', {
            entityType: newLink.entityType,
            externalId: newLink.externalId,
          })

          // Test with onConflictDoNothing and returning
          const insertResult = yield* db
            .insert(externalLinksTable)
            .values(linksToInsert)
            .onConflictDoUpdate({
              set: {
                _tag: sql`EXCLUDED."_tag"`,
              },
              target: [
                externalLinksTable.orgId,
                externalLinksTable.adapter,
                externalLinksTable.externalId,
              ],
            })
            .returning()

          console.log(insertResult)

          console.log('\n=== RESULTS ===')
          console.log('Number of rows returned:', insertResult.length)
          console.log('Returned rows:')
          pipe(
            insertResult,
            Array.forEach((row) => {
              console.log(`  externalId: ${row.externalId}, entityType: ${row.entityType}`)
            }),
          )

          if (insertResult.length === 0) {
            console.log(
              '❌ No rows returned - onConflictDoNothing().returning() returns NOTHING when all rows conflict',
            )
          } else if (insertResult.length === 1) {
            console.log(
              '✅ Only newly inserted row returned - onConflictDoNothing().returning() returns ONLY new inserts',
            )
          } else if (insertResult.length === 2) {
            console.log(
              '⚠️ Both rows returned - onConflictDoNothing().returning() returns ALL rows (existing + new)',
            )
          }

          console.log('✅ Test function completed')

          return {
            message: 'Test function completed',
          }
        }).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new TestFunctionError({
                cause: String(error),
                message: 'Test function execution failed',
              }),
            ),
          ),
        ),
    }
  }),
)
