import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { ExternalLinkManager, TokenKey } from '@openfaith/adapter-core/server'
import { type ExternalLink, externalLinksTable, type NewExternalLink } from '@openfaith/db'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { Array, Effect, Layer, Option, pipe } from 'effect'

export const ExternalLinkManagerLive = Layer.effect(
  ExternalLinkManager,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.PgDrizzle
    const orgId = yield* TokenKey

    return ExternalLinkManager.of({
      createExternalLink: (link: Omit<NewExternalLink, 'createdAt' | 'updatedAt' | '_tag'>) =>
        Effect.gen(function* () {
          const now = new Date()
          yield* db.insert(externalLinksTable).values({
            _tag: 'externalLink',
            ...link,
            createdAt: now,
            updatedAt: now,
          })
        }),

      createExternalLinks: (
        links: Array<Omit<NewExternalLink, 'createdAt' | 'updatedAt' | '_tag'>>,
      ) =>
        Effect.gen(function* () {
          if (links.length === 0) {
            return
          }

          const now = new Date()
          yield* db.insert(externalLinksTable).values(
            pipe(
              links,
              Array.map((link) => ({
                _tag: 'externalLink' as const,
                ...link,
                createdAt: now,
                updatedAt: now,
              })),
            ),
          )
        }),

      deleteExternalLink: (adapter: string, externalId: string) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              deletedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt),
              ),
            )
        }),

      findEntityByExternalId: (adapter: string, externalId: string) =>
        Effect.gen(function* () {
          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                eq(externalLinksTable.orgId, orgId),
                isNull(externalLinksTable.deletedAt), // Only active links
              ),
            )
            .limit(1)

          return pipe(links, Array.head, Option.getOrNull)
        }),

      getExternalLinksForEntities: (entityType: string, entityIds: ReadonlyArray<string>) =>
        Effect.gen(function* () {
          if (entityIds.length === 0) {
            return {}
          }

          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                inArray(externalLinksTable.entityId, entityIds),
                isNull(externalLinksTable.deletedAt), // Only active links
              ),
            )

          return pipe(
            links,
            Array.groupBy((link) => link.entityId),
          )
        }),
      getExternalLinksForEntity: (entityType: string, entityId: string) =>
        Effect.gen(function* () {
          return yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityType, entityType),
                eq(externalLinksTable.entityId, entityId),
                isNull(externalLinksTable.deletedAt), // Only active links
              ),
            )
        }),

      markMultipleSyncCompleted: (links: Array<{ adapter: string; externalId: string }>) =>
        Effect.gen(function* () {
          if (links.length === 0) {
            return
          }

          const now = new Date()
          yield* Effect.forEach(
            links,
            (link) =>
              db
                .update(externalLinksTable)
                .set({
                  syncing: false,
                  updatedAt: now,
                })
                .where(
                  and(
                    eq(externalLinksTable.orgId, orgId),
                    eq(externalLinksTable.adapter, link.adapter),
                    eq(externalLinksTable.externalId, link.externalId),
                    isNull(externalLinksTable.deletedAt),
                  ),
                ),
            { concurrency: 'unbounded' },
          )
        }),

      markMultipleSyncInProgress: (links: Array<{ adapter: string; externalId: string }>) =>
        Effect.gen(function* () {
          if (links.length === 0) {
            return
          }

          // For bulk operations, we need to update each link individually
          // since Drizzle doesn't support bulk updates with different where conditions
          yield* Effect.forEach(
            links,
            (link) =>
              db
                .update(externalLinksTable)
                .set({
                  syncing: true,
                  updatedAt: new Date(),
                })
                .where(
                  and(
                    eq(externalLinksTable.orgId, orgId),
                    eq(externalLinksTable.adapter, link.adapter),
                    eq(externalLinksTable.externalId, link.externalId),
                    isNull(externalLinksTable.deletedAt),
                  ),
                ),
            { concurrency: 'unbounded' },
          )
        }),

      markSyncCompleted: (adapter: string, externalId: string) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              syncing: false,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt),
              ),
            )
        }),

      markSyncInProgress: (adapter: string, externalId: string) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              syncing: true,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt),
              ),
            )
        }),

      updateExternalLink: (
        adapter: string,
        externalId: string,
        updates: Partial<Pick<ExternalLink, 'syncing' | 'lastProcessedAt' | 'updatedAt'>>,
      ) =>
        Effect.gen(function* () {
          yield* db
            .update(externalLinksTable)
            .set({
              ...updates,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.externalId, externalId),
                isNull(externalLinksTable.deletedAt), // Only update active links
              ),
            )
        }),
    })
  }),
)
