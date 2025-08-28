/**
 * @since 1.0.0
 */

import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import {
  DetectionError,
  EntityProcessingError,
  ExternalLinkRetrievalError,
  ExternalLinkUpsertError,
  InternalManager,
  RelationshipProcessingError,
} from '@openfaith/adapter-core/layers/internalManager'
import type {
  EntityData,
  ExternalLinkInput,
  RelationshipInput,
} from '@openfaith/adapter-core/layers/types'
import { TokenKey } from '@openfaith/adapter-core/server'
import { type ExternalLink, edgesTable, externalLinksTable } from '@openfaith/db'
import { type CustomFieldSchema, OfTable } from '@openfaith/schema'
import { getSchemaByEntityType } from '@openfaith/schema/shared/entityDiscovery'
import { getEntityId } from '@openfaith/shared'
import { getProperEntityName } from '@openfaith/workers/helpers/saveDataE'
import { getAnnotationFromSchema } from '@openfaith/workers/helpers/schemaRegistry'
import { and, type BuildColumns, eq, getTableColumns, inArray, isNull, lt, sql } from 'drizzle-orm'
import { jsonb, type PgTableWithColumns, text } from 'drizzle-orm/pg-core'
import { Array, Effect, Layer, Option, pipe, Record } from 'effect'

const baseColumns = {
  _tag: text().notNull(),
  customFields: jsonb().$type<ReadonlyArray<CustomFieldSchema>>().notNull().default([]),
  id: text().primaryKey(),
  orgId: text().notNull(),
}

type BaseTable = PgTableWithColumns<{
  name: string
  schema: undefined
  columns: BuildColumns<string, typeof baseColumns, 'pg'>
  dialect: 'pg'
}>

// ===== EXTERNAL LINKS HELPER FUNCTIONS =====

/**
 * Partitions external links into main entity and target entity categories
 */
const partitionExternalLinksByType = (
  externalLinks: Array<ExternalLinkInput>,
): [targetEntityLinks: Array<ExternalLinkInput>, mainEntityLinks: Array<ExternalLinkInput>] =>
  pipe(
    externalLinks,
    Array.partition(
      (link) =>
        // Target entity links have NO createdAt/updatedAt (missing entity data)
        !link.createdAt && !link.updatedAt,
    ),
  )

/**
 * Filters main entity results to only include links that were actually changed in this batch
 */
const filterChangedMainEntityLinks = (
  mainEntityResults: Array<ExternalLink>,
  lastProcessedAt: Date,
): Array<ExternalLink> =>
  pipe(
    mainEntityResults,
    Array.filter((x) => {
      // Check if lastProcessedAt equals the current batch time
      // If it does, it means the SQL updated it (because updatedAt changed)
      // If it doesn't, it means the SQL kept the old value (because updatedAt was the same)
      const diffMs = Math.abs(x.lastProcessedAt.getTime() - lastProcessedAt.getTime())

      // Allow very small timing difference (up to 1ms) for database round-trip
      // This ensures we only include rows that were JUST updated in this batch
      return diffMs <= 1
    }),
  )

/**
 * PostgreSQL implementation of the InternalManager service.
 *
 * @since 1.0.0
 * @category implementations
 */
export const InternalManagerLive = Layer.effect(
  InternalManager,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.PgDrizzle
    const orgId = yield* TokenKey

    return InternalManager.of({
      /**
       * Detects and marks entities as deleted based on sync timing.
       */
      detectAndMarkDeleted: (adapter, entityType, syncStartTime) =>
        Effect.gen(function* () {
          const properEntityName = getProperEntityName(entityType)

          yield* Effect.annotateLogs(Effect.log('Starting deletion detection'), {
            adapter,
            entityType: properEntityName,
            orgId,
            syncStartTime: syncStartTime.toISOString(),
          })

          const staleLinks = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.entityType, properEntityName),
                lt(externalLinksTable.lastProcessedAt, syncStartTime),
                isNull(externalLinksTable.deletedAt),
              ),
            )

          if (staleLinks.length === 0) {
            yield* Effect.annotateLogs(Effect.log('No stale entities detected'), {
              adapter,
              entityType: properEntityName,
              orgId,
            })
            return []
          }

          yield* Effect.annotateLogs(
            Effect.log('Detected stale entities that may have been deleted'),
            {
              adapter,
              entityType: properEntityName,
              orgId,
              staleCount: staleLinks.length,
              staleEntityIds: pipe(
                staleLinks,
                Array.take(10), // Log first 10 for debugging
                Array.map((link) => link.externalId),
              ),
            },
          )

          // Soft delete the external links
          yield* db
            .update(externalLinksTable)
            .set({
              deletedAt: new Date(),
              deletedBy: 'sync_deletion_detection',
            })
            .where(
              and(
                eq(externalLinksTable.orgId, orgId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.entityType, properEntityName),
                inArray(
                  externalLinksTable.externalId,
                  pipe(
                    staleLinks,
                    Array.map((link) => link.externalId),
                  ),
                ),
              ),
            )

          yield* Effect.annotateLogs(Effect.log('Soft deleted external links'), {
            adapter,
            deletedCount: staleLinks.length,
            entityType: properEntityName,
            orgId,
          })

          return staleLinks
        }).pipe(
          Effect.mapError(
            (cause) =>
              new DetectionError({
                adapter,
                cause,
                entityType,
                message: `Failed to detect and mark deleted entities: ${cause}`,
                orgId,
              }),
          ),
        ),

      /**
       * Retrieves an external link for a given internal ID and adapter.
       */
      getExternalLink: (internalId, adapter) =>
        Effect.gen(function* () {
          yield* Effect.annotateLogs(Effect.log('Retrieving external link'), {
            adapter,
            internalId,
            orgId,
          })

          const links = yield* db
            .select()
            .from(externalLinksTable)
            .where(
              and(
                eq(externalLinksTable.entityId, internalId),
                eq(externalLinksTable.adapter, adapter),
                eq(externalLinksTable.orgId, orgId),
                isNull(externalLinksTable.deletedAt),
              ),
            )
            .limit(1)

          const linkOpt = pipe(links, Array.head)

          yield* Effect.annotateLogs(
            Effect.log(Option.isSome(linkOpt) ? 'External link found' : 'No external link found'),
            {
              adapter,
              found: Option.isSome(linkOpt),
              internalId,
              orgId,
            },
          )

          return linkOpt
        }).pipe(
          Effect.mapError(
            (cause) =>
              new ExternalLinkRetrievalError({
                adapter,
                cause,
                internalId,
                message: `Failed to retrieve external link: ${cause}`,
                orgId,
              }),
          ),
        ),

      /**
       * Processes entity data by upserting entities into their respective tables.
       */
      processEntityData: (data: Array<EntityData>) =>
        Effect.gen(function* () {
          if (data.length === 0) {
            yield* Effect.annotateLogs(Effect.log('No entity data to process'), {
              dataCount: 0,
              orgId,
            })
            return
          }

          yield* Effect.annotateLogs(Effect.log('Processing entity data'), {
            dataCount: data.length,
            orgId,
          })

          // Group entities by their _tag field (all EntityUnion types have this)
          const entitiesByType = pipe(
            data,
            Array.groupBy((entity) => entity._tag),
          )

          yield* Effect.all(
            pipe(
              entitiesByType,
              Record.toEntries,
              Array.map(([entityTag, entities]) =>
                Effect.gen(function* () {
                  yield* Effect.annotateLogs(Effect.log('Processing entities by type'), {
                    entityCount: entities.length,
                    entityTag,
                    orgId,
                  })

                  // Get the schema for this entity tag
                  const schemaOpt = getSchemaByEntityType(entityTag)
                  if (Option.isNone(schemaOpt)) {
                    yield* Effect.annotateLogs(
                      Effect.log('No schema found for entity tag, skipping'),
                      {
                        entityCount: entities.length,
                        entityTag,
                        orgId,
                      },
                    )
                    return
                  }

                  // Get the table annotation from the schema
                  const tableOpt = getAnnotationFromSchema(OfTable, schemaOpt.value.ast)
                  if (Option.isNone(tableOpt)) {
                    yield* Effect.annotateLogs(
                      Effect.log('No table found for entity schema, skipping'),
                      {
                        entityCount: entities.length,
                        entityTag,
                        orgId,
                      },
                    )
                    return
                  }

                  const table = tableOpt.value as BaseTable

                  yield* Effect.annotateLogs(Effect.log('Upserting entities into table'), {
                    entityCount: entities.length,
                    entityTag,
                    orgId,
                  })

                  // Upsert entities into their respective table
                  yield* db
                    .insert(table)
                    .values(entities)
                    .onConflictDoUpdate({
                      set: {
                        // Update all columns except id, orgId, and _tag
                        ...pipe(
                          getTableColumns(table),
                          Record.keys,
                          Array.filter((key) => key !== 'id' && key !== 'orgId' && key !== '_tag'),
                          Array.map((key) => [key, sql.raw(`EXCLUDED."${key}"`)] as const),
                          Record.fromEntries,
                        ),
                        customFields: sql`
                          (
                            COALESCE(
                              (
                                SELECT jsonb_agg(elem)
                                FROM jsonb_array_elements(
                                  CASE 
                                    WHEN jsonb_typeof(${table.customFields}) = 'array' 
                                    THEN ${table.customFields} 
                                    ELSE '[]'::jsonb 
                                  END
                                ) elem
                                WHERE elem->>'source' IS DISTINCT FROM 'pco'
                              ), '[]'::jsonb
                            )
                            ||
                            COALESCE(
                              (
                                SELECT jsonb_agg(elem)
                                FROM jsonb_array_elements(
                                  CASE 
                                    WHEN jsonb_typeof(EXCLUDED."customFields") = 'array' 
                                    THEN EXCLUDED."customFields" 
                                    ELSE '[]'::jsonb 
                                  END
                                ) elem
                                WHERE elem->>'source' = 'pco'
                              ), '[]'::jsonb
                            )
                          )
                        `,
                      },
                      target: [table.id],
                    })

                  yield* Effect.annotateLogs(Effect.log('Entity processing complete for type'), {
                    entityCount: entities.length,
                    entityTag,
                    orgId,
                  })
                }),
              ),
            ),
            { concurrency: 'unbounded' },
          )

          yield* Effect.annotateLogs(Effect.log('Entity data processing complete'), {
            dataCount: data.length,
            orgId,
          })
        }).pipe(
          Effect.mapError(
            (cause) =>
              new EntityProcessingError({
                cause,
                entityCount: data.length,
                message: `Failed to process entity data: ${cause}`,
                orgId,
              }),
          ),
        ),

      /**
       * Processes relationship inputs by creating edges.
       */
      processEntityEdges: (edges: Array<RelationshipInput>) =>
        Effect.gen(function* () {
          if (edges.length === 0) {
            yield* Effect.annotateLogs(Effect.log('No relationship edges to process'), {
              edgeCount: 0,
              orgId,
            })
            return
          }

          yield* Effect.annotateLogs(Effect.log('Processing relationship edges'), {
            edgeCount: edges.length,
            orgId,
          })

          // Create edge values using the RelationshipInput structure
          const edgeValues = pipe(
            edges,
            Array.map((edge) => ({
              _tag: 'edge' as const,
              createdAt: edge.createdAt,
              createdBy: edge.createdBy,
              deletedAt: edge.deletedAt,
              deletedBy: edge.deletedBy,
              metadata: edge.metadata || {},
              orgId,
              relationshipType: edge.relationshipType,
              sourceEntityId: edge.sourceEntityId,
              sourceEntityTypeTag: edge.sourceEntityTypeTag,
              targetEntityId: edge.targetEntityId,
              targetEntityTypeTag: edge.targetEntityTypeTag,
              updatedAt: edge.updatedAt,
              updatedBy: edge.updatedBy,
            })),
          )

          if (edgeValues.length > 0) {
            yield* Effect.annotateLogs(Effect.log('Creating edges from relationships'), {
              edgeCount: edgeValues.length,
              orgId,
            })

            // Insert edges with conflict handling (based on insertEdgesE pattern)
            yield* db
              .insert(edgesTable)
              .values(pipe(edgeValues, Array.fromIterable))
              .onConflictDoUpdate({
                set: {
                  metadata: sql`EXCLUDED."metadata"`,
                  updatedAt: sql`EXCLUDED."updatedAt"`,
                },
                target: [
                  edgesTable.orgId,
                  edgesTable.sourceEntityId,
                  edgesTable.targetEntityId,
                  edgesTable.relationshipType,
                ],
              })

            yield* Effect.annotateLogs(Effect.log('Edges created successfully'), {
              edgeCount: edgeValues.length,
              orgId,
            })

            // Update entity relationships registry inline
            const relationshipValues = pipe(
              edgeValues,
              Array.groupBy((edge) => edge.sourceEntityTypeTag),
              Record.mapEntries((edges, sourceEntityType) => [
                sourceEntityType,
                {
                  _tag: 'entityRelationships' as const,
                  orgId,
                  sourceEntityType,
                  targetEntityTypes: pipe(
                    edges,
                    Array.map((edge) => edge.targetEntityTypeTag),
                    Array.dedupe,
                  ),
                  updatedAt: new Date(),
                },
              ]),
              Record.values,
            )

            if (relationshipValues.length > 0) {
              const valuesClause = pipe(
                relationshipValues,
                Array.map((rel) => {
                  const targetEntityTypesJson = JSON.stringify(rel.targetEntityTypes)
                  const escapedJson = targetEntityTypesJson.replace(/'/g, "''")
                  return sql`(${rel.orgId}, ${rel.sourceEntityType}, ${sql.raw(`'${escapedJson}'::jsonb`)}, ${rel.updatedAt})`
                }),
                Array.reduce(sql`` as ReturnType<typeof sql>, (acc, curr, index) =>
                  index === 0 ? curr : sql`${acc}, ${curr}`,
                ),
              )

              const query = sql`
                INSERT INTO "openfaith_entityRelationships" ("orgId", "sourceEntityType", "targetEntityTypes", "updatedAt")
                VALUES ${valuesClause}
                ON CONFLICT ("orgId", "sourceEntityType") DO UPDATE
                SET "targetEntityTypes" = (
                  SELECT jsonb_agg(DISTINCT elem.value ORDER BY elem.value)
                  FROM jsonb_array_elements_text(
                    "openfaith_entityRelationships"."targetEntityTypes" || EXCLUDED."targetEntityTypes"
                  ) AS elem(value)
                ),
                "updatedAt" = EXCLUDED."updatedAt"
              `

              yield* db.execute(query)
              yield* Effect.annotateLogs(Effect.log('Entity relationships registry updated'), {
                orgId,
                updateCount: relationshipValues.length,
              })
            }
          }

          yield* Effect.annotateLogs(Effect.log('Relationship edge processing complete'), {
            edgeCount: edges.length,
            orgId,
          })
        }).pipe(
          Effect.mapError(
            (cause) =>
              new RelationshipProcessingError({
                cause,
                message: `Failed to process relationship edges: ${cause}`,
                orgId,
                relationshipCount: edges.length,
              }),
          ),
        ),

      /**
       * Upserts multiple external links with conflict resolution.
       * Supports two patterns:
       * 1. Main entity sync (with conditional updates and filtering)
       * 2. Target entity creation (with do-nothing conflict resolution)
       */
      upsertExternalLinks: (externalLinks) =>
        Effect.gen(function* () {
          if (externalLinks.length === 0) {
            yield* Effect.annotateLogs(Effect.log('No external links to upsert'), {
              linkCount: 0,
              orgId,
            })
            return []
          }

          yield* Effect.annotateLogs(Effect.log('Upserting external links'), {
            linkCount: externalLinks.length,
            orgId,
          })

          const lastProcessedAt = new Date()

          // Separate links into two categories based on whether they have full entity data
          const [targetEntityLinks, mainEntityLinks] = partitionExternalLinksByType(externalLinks)
          const results: Array<ExternalLink> = []

          // Handle main entity links (mkExternalLinksE pattern)
          if (mainEntityLinks.length > 0) {
            yield* Effect.annotateLogs(Effect.log('Processing main entity external links'), {
              linkCount: mainEntityLinks.length,
              orgId,
            })

            const mainEntityResults = yield* db
              .insert(externalLinksTable)
              .values(
                pipe(
                  mainEntityLinks,
                  Array.map((link) => ({
                    _tag: 'externalLink' as const,
                    adapter: link.adapter,
                    createdAt: pipe(
                      link.createdAt,
                      Option.fromNullable,
                      Option.match({
                        onNone: () => lastProcessedAt,
                        onSome: (x) => new Date(x),
                      }),
                    ),
                    entityId: pipe(
                      link.entityId,
                      Option.fromNullable,
                      Option.getOrElse(() => getEntityId(link.entityType)),
                    ),
                    entityType: link.entityType,
                    externalId: link.externalId,
                    lastProcessedAt,
                    orgId,
                    syncing: false,
                    updatedAt: pipe(
                      link.updatedAt,
                      Option.fromNullable,
                      Option.match({
                        onNone: () => lastProcessedAt,
                        onSome: (x) => new Date(x),
                      }),
                    ),
                  })),
                ),
              )
              .onConflictDoUpdate({
                set: {
                  // Only update lastProcessedAt when updatedAt changes (mkExternalLinksE pattern)
                  lastProcessedAt: sql`
                     CASE
                       WHEN EXCLUDED."updatedAt" IS DISTINCT FROM ${externalLinksTable}."updatedAt"
                       THEN EXCLUDED."lastProcessedAt"
                       ELSE ${externalLinksTable}."lastProcessedAt"
                     END
                   `,
                  updatedAt: sql`EXCLUDED."updatedAt"`,
                },
                target: [
                  externalLinksTable.orgId,
                  externalLinksTable.adapter,
                  externalLinksTable.externalId,
                ],
              })
              .returning({
                // Include all fields needed for complete ExternalLink
                _tag: externalLinksTable._tag,
                adapter: externalLinksTable.adapter,
                createdAt: externalLinksTable.createdAt,
                deletedAt: externalLinksTable.deletedAt,
                deletedBy: externalLinksTable.deletedBy,
                entityId: externalLinksTable.entityId,
                entityType: externalLinksTable.entityType,
                externalId: externalLinksTable.externalId,
                // For some reason when you just return externalLinksTable.lastProcessedAt, the milliseconds are truncated
                lastProcessedAt: sql<Date>`${externalLinksTable.lastProcessedAt}`,
                orgId: externalLinksTable.orgId,
                syncing: externalLinksTable.syncing,
                updatedAt: externalLinksTable.updatedAt,
              })

            // Filter to only return external links that were newly inserted or had their updatedAt changed
            const changedMainEntityLinks = filterChangedMainEntityLinks(
              mainEntityResults,
              lastProcessedAt,
            )

            yield* Effect.annotateLogs(Effect.log('Main entity external links processed'), {
              changedCount: changedMainEntityLinks.length,
              insertedCount: mainEntityResults.length,
              orgId,
            })

            results.push(...changedMainEntityLinks)
          }

          // Handle target entity links (createTargetExternalLinksE pattern)
          if (targetEntityLinks.length > 0) {
            yield* Effect.annotateLogs(Effect.log('Processing target entity external links'), {
              linkCount: targetEntityLinks.length,
              orgId,
            })

            // First, check which ones already exist
            const existingLinks = yield* db
              .select()
              .from(externalLinksTable)
              .where(
                and(
                  inArray(
                    externalLinksTable.externalId,
                    pipe(
                      targetEntityLinks,
                      Array.map((link) => link.externalId),
                    ),
                  ),
                  eq(externalLinksTable.orgId, orgId),
                ),
              )

            // Create missing external links only
            const missingLinks = pipe(
              targetEntityLinks,
              Array.filter((link) =>
                pipe(
                  existingLinks,
                  Array.findFirst((existing) => existing.externalId === link.externalId),
                  Option.isNone,
                ),
              ),
            )

            if (missingLinks.length > 0) {
              const newTargetLinks = pipe(
                missingLinks,
                Array.map((link) => ({
                  _tag: 'externalLink' as const,
                  adapter: link.adapter,
                  createdAt: lastProcessedAt,
                  entityId: link.entityId || getEntityId(link.entityType),
                  entityType: link.entityType,
                  externalId: link.externalId,
                  lastProcessedAt,
                  orgId,
                  syncing: false,
                  updatedAt: lastProcessedAt,
                })),
              )

              yield* db.insert(externalLinksTable).values(newTargetLinks).onConflictDoNothing()

              yield* Effect.annotateLogs(Effect.log('Target entity external links created'), {
                createdCount: missingLinks.length,
                orgId,
              })
            }

            // Return all target links (existing + new) - this matches createTargetExternalLinksE behavior
            const allTargetLinks = yield* db
              .select()
              .from(externalLinksTable)
              .where(
                and(
                  inArray(
                    externalLinksTable.externalId,
                    pipe(
                      targetEntityLinks,
                      Array.map((link) => link.externalId),
                    ),
                  ),
                  eq(externalLinksTable.orgId, orgId),
                ),
              )

            results.push(...allTargetLinks)
          }

          yield* Effect.annotateLogs(Effect.log('External links upserted successfully'), {
            linkCount: externalLinks.length,
            mainEntityCount: mainEntityLinks.length,
            orgId,
            returnedCount: results.length,
            targetEntityCount: targetEntityLinks.length,
          })

          return results
        }).pipe(
          Effect.mapError(
            (cause) =>
              new ExternalLinkUpsertError({
                cause,
                linkCount: externalLinks.length,
                message: `Failed to upsert external links: ${cause}`,
                orgId,
              }),
          ),
        ),
    })
  }),
)
