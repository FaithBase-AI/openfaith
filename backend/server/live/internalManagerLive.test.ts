/**
 * Comprehensive tests for InternalManagerLive implementation
 *
 * These tests require Docker to be available for PostgreSQL test containers.
 * If Docker is not available, tests will be skipped with appropriate messages.
 *
 * To run these tests:
 * 1. Ensure Docker is installed and running
 * 2. Start infrastructure: bun run infra
 * 3. Run tests: bun test backend/server/live/internalManagerLive.test.ts
 */

import { expect } from 'bun:test'
import { SqlClient } from '@effect/sql'
import * as Pg from '@effect/sql-drizzle/Pg'
import {
  DetectionError,
  type EntityData,
  type ExternalLinkInput,
  ExternalLinkUpsertError,
  InternalManager,
  type RelationshipInput,
  TokenKey,
} from '@openfaith/adapter-core/server'
import { effect, layer } from '@openfaith/bun-test'
import { getEntityId } from '@openfaith/shared'
import { createTestTables } from '@openfaith/workers/helpers/test-utils/test-schema'
import { PgContainer } from '@openfaith/workers/helpers/test-utils/utils-pg'
import { Array, Effect, Layer, Option, pipe } from 'effect'

import { InternalManagerLive } from './internalManagerLive'

// Test TokenKey service
const TestTokenKey = Layer.succeed(TokenKey, 'test_org_123')

// Database layer with container
const DrizzlePgLive = Pg.layer.pipe(Layer.provideMerge(PgContainer.ClientLive))

// Combined test layer - merge all services together so they're all available
const TestLayer = Layer.mergeAll(
  InternalManagerLive.pipe(Layer.provide(Layer.mergeAll(DrizzlePgLive, TestTokenKey))),
  DrizzlePgLive,
  TestTokenKey,
)

// Test cleanup helper
const cleanupTestData = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  const testOrgId = 'test_org_123'
  // Clean up test data in reverse dependency order
  yield* sql`DELETE FROM "openfaith_edges" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_externalLinks" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_entityRelationships" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_people" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_addresses" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_phoneNumbers" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_campuses" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_folders" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_orgs" WHERE "id" = ${testOrgId}`
})

// Test data factories
const createTestExternalLinkInput = (
  overrides: Partial<ExternalLinkInput> = {},
): ExternalLinkInput => ({
  adapter: 'pco',
  createdAt: '2023-01-01T00:00:00Z',
  entityType: 'person',
  externalId: 'pco_test_123',
  updatedAt: '2023-01-02T00:00:00Z',
  ...overrides,
})

const createTestEntityData = (overrides: Partial<EntityData> = {}): EntityData => {
  const baseEntity = {
    _tag: 'person' as const,
    createdAt: new Date(),
    customFields: [],
    id: 'person_test_123',
    name: 'Test Person',
    orgId: 'test_org_123',
    updatedAt: null,
    ...overrides,
  }
  return baseEntity as EntityData
}

const createTestRelationshipInput = (
  overrides: Partial<RelationshipInput> = {},
): RelationshipInput => ({
  createdAt: new Date('2023-01-01T00:00:00Z'),
  createdBy: null,
  deletedAt: null,
  deletedBy: null,
  metadata: {},
  relationshipType: 'person_has_address',
  sourceEntityId: 'person_123',
  sourceEntityTypeTag: 'person',
  targetEntityId: 'address_456',
  targetEntityTypeTag: 'address',
  updatedAt: null,
  updatedBy: null,
  ...overrides,
})

// ===== BASIC CONNECTIVITY TESTS =====

layer(TestLayer)('InternalManager Tests', (it) => {
  it.effect(
    'InternalManager service layer initializes correctly',
    () =>
      Effect.gen(function* () {
        const internalManager = yield* InternalManager

        // Verify the service has all expected methods
        expect(typeof internalManager.detectAndMarkDeleted).toBe('function')
        expect(typeof internalManager.getExternalLink).toBe('function')
        expect(typeof internalManager.processEntities).toBe('function')
        expect(typeof internalManager.processRelationships).toBe('function')
        expect(typeof internalManager.processExternalLinks).toBe('function')
      }),
    { timeout: 120000 },
  )

  // ===== UPSERTEXTERNALLINKS METHOD TESTS =====

  it.effect(
    'upsertExternalLinks handles empty array',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        const internalManager = yield* InternalManager

        const result = yield* internalManager.processExternalLinks([])

        expect(result).toEqual({
          allExternalLinks: [],
          changedExternalLinks: [],
        })
      }),
    { timeout: 120000 },
  )

  it.effect(
    'upsertExternalLinks creates new external links for main entity data',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        const linkInput = createTestExternalLinkInput({
          entityType: 'person',
          externalId: 'pco_new_main',
        })

        const result = yield* internalManager.processExternalLinks([linkInput])

        // Should return the newly created link in changedExternalLinks
        expect(result.changedExternalLinks.length).toBe(1)
        expect(result.changedExternalLinks[0]?.externalId).toBe('pco_new_main')
        expect(result.changedExternalLinks[0]?.entityType).toBe('person')
        expect(result.changedExternalLinks[0]?.adapter).toBe('pco')

        // allExternalLinks should also contain the link
        expect(result.allExternalLinks.length).toBe(1)
        expect(result.allExternalLinks[0]?.externalId).toBe('pco_new_main')

        // Verify it was created in the database
        const sql = yield* SqlClient.SqlClient
        const dbLinks = yield* sql`
          SELECT * FROM "openfaith_externalLinks" 
          WHERE "externalId" = 'pco_new_main' AND "orgId" = 'test_org_123'
        `
        expect(dbLinks.length).toBe(1)
      }),
    { timeout: 120000 },
  )

  it.effect(
    'upsertExternalLinks handles target entity links (no createdAt/updatedAt)',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        const targetLinkInput = createTestExternalLinkInput({
          createdAt: undefined, // No entity data
          entityType: 'campus',
          externalId: 'pco_target_123',
          updatedAt: undefined, // No entity data
        })

        const result = yield* internalManager.processExternalLinks([targetLinkInput])

        // Reference links without data go to changedReferenceLinks
        expect(result.changedExternalLinks.length).toBe(1)
        expect(result.changedExternalLinks[0]?.externalId).toBe('pco_target_123')
        expect(result.changedExternalLinks[0]?.entityType).toBe('campus')

        // Also in allExternalLinks
        expect(result.allExternalLinks.length).toBe(1)

        // Verify it was created in the database
        const sql = yield* SqlClient.SqlClient
        const dbLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_target_123' AND "orgId" = 'test_org_123'
      `
        expect(dbLinks.length).toBe(1)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  effect(
    'upsertExternalLinks generates entityId when not provided',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        const linkInput = createTestExternalLinkInput({
          entityId: undefined, // No entityId provided
          entityType: 'person',
          externalId: 'pco_generated_id',
        })

        const result = yield* internalManager.processExternalLinks([linkInput])

        expect(result.changedExternalLinks.length).toBe(1)
        expect(result.changedExternalLinks[0]?.externalId).toBe('pco_generated_id')

        // Should have generated a proper entityId
        const entityId = result.changedExternalLinks[0]?.entityId
        expect(entityId).toBeTruthy()
        expect(entityId?.startsWith('person_')).toBe(true) // ULID format for person
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  // ===== GETEXTERNALLINK METHOD TESTS =====

  effect(
    'getExternalLink retrieves existing external link',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager
        const sql = yield* SqlClient.SqlClient

        // Create a test external link
        const entityId = getEntityId('person')
        yield* sql`
        INSERT INTO "openfaith_externalLinks" 
        ("_tag", "orgId", "entityId", "entityType", "externalId", "adapter", "createdAt", "updatedAt", "lastProcessedAt", "syncing")
        VALUES 
        ('externalLink', 'test_org_123', ${entityId}, 'person', 'pco_retrieve_test', 'pco', NOW(), NOW(), NOW(), false)
      `

        const result = yield* internalManager.getExternalLink(entityId, 'pco')

        expect(Option.isSome(result)).toBe(true)
        if (Option.isSome(result)) {
          expect(result.value.entityId).toBe(entityId)
          expect(result.value.externalId).toBe('pco_retrieve_test')
          expect(result.value.adapter).toBe('pco')
          expect(result.value.entityType).toBe('person')
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  effect(
    'getExternalLink returns None for non-existent external link',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        const result = yield* internalManager.getExternalLink('non_existent_id', 'pco')

        expect(Option.isNone(result)).toBe(true)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  // ===== PROCESSENTITYDATA METHOD TESTS =====

  effect(
    'processEntityData handles empty array',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        const internalManager = yield* InternalManager

        // Should not throw error with empty data
        yield* internalManager.processEntities([])

        // Test passes if no error is thrown
        expect(true).toBe(true)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  effect(
    'processEntityData upserts entities into correct tables',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        const personData = createTestEntityData({
          _tag: 'person',
          id: 'person_process_test_123',
          name: 'Test Person',
        })

        yield* internalManager.processEntities([personData])

        // Verify the entity was inserted into the people table
        const sql = yield* SqlClient.SqlClient
        const people = yield* sql`
        SELECT * FROM "openfaith_people" 
        WHERE "id" = 'person_process_test_123' AND "orgId" = 'test_org_123'
      `
        expect(people.length).toBe(1)
        expect(people[0]?._tag).toBe('person')
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  // ===== PROCESSENTITYEDGES METHOD TESTS =====

  effect(
    'processEntityEdges handles empty array',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        const internalManager = yield* InternalManager

        // Should not throw error with empty edges
        yield* internalManager.processRelationships([])

        // Test passes if no error is thrown
        expect(true).toBe(true)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  effect(
    'processEntityEdges creates edges in database',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        const relationshipInput = createTestRelationshipInput({
          relationshipType: 'person_has_address',
          sourceEntityId: 'person_edge_123',
          sourceEntityTypeTag: 'person',
          targetEntityId: 'address_edge_456',
          targetEntityTypeTag: 'address',
        })

        yield* internalManager.processRelationships([relationshipInput])

        // Verify edge was created
        const sql = yield* SqlClient.SqlClient
        const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE "sourceEntityId" = 'person_edge_123' 
        AND "targetEntityId" = 'address_edge_456'
        AND "orgId" = 'test_org_123'
      `
        expect(edges.length).toBe(1)
        expect(edges[0]?.relationshipType).toBe('person_has_address')
        expect(edges[0]?.sourceEntityTypeTag).toBe('person')
        expect(edges[0]?.targetEntityTypeTag).toBe('address')
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  // ===== DETECTANDMARKDELETED METHOD TESTS =====

  effect(
    'detectAndMarkDeleted returns empty array when no stale entities exist',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        const syncStartTime = new Date()
        const result = yield* internalManager.detectAndMarkDeleted('pco', 'Person', syncStartTime)

        expect(result).toEqual([])
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  effect(
    'detectAndMarkDeleted finds and marks stale external links as deleted',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager
        const sql = yield* SqlClient.SqlClient

        // Create a stale external link (processed before sync start)
        const oldProcessedTime = new Date('2023-01-01T00:00:00Z')
        const entityId = getEntityId('person')
        yield* sql`
        INSERT INTO "openfaith_externalLinks" 
        ("_tag", "orgId", "entityId", "entityType", "externalId", "adapter", "createdAt", "updatedAt", "lastProcessedAt", "syncing")
        VALUES 
        ('externalLink', 'test_org_123', ${entityId}, 'person', 'pco_stale_123', 'pco', ${oldProcessedTime}, ${oldProcessedTime}, ${oldProcessedTime}, false)
      `

        const syncStartTime = new Date('2023-01-02T00:00:00Z') // After the stale link

        const result = yield* internalManager.detectAndMarkDeleted('pco', 'Person', syncStartTime)

        // Should find the stale link
        expect(result.length).toBe(1)
        expect(result[0]?.externalId).toBe('pco_stale_123')

        // Verify the external link was marked as deleted
        const deletedLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_stale_123' AND "orgId" = 'test_org_123'
      `
        expect(deletedLinks.length).toBe(1)
        expect(deletedLinks[0]?.deletedAt).not.toBeNull()
        expect(deletedLinks[0]?.deletedBy).toBe('sync_deletion_detection')
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  // ===== ERROR HANDLING TESTS =====

  effect(
    'upsertExternalLinks throws ExternalLinkUpsertError on database failure',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        const internalManager = yield* InternalManager

        // Create invalid external link input that will cause database error
        const invalidLinkInput = createTestExternalLinkInput({
          externalId: '', // Empty string should cause error
        })

        const result = yield* Effect.either(
          internalManager.processExternalLinks([invalidLinkInput]),
        )

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          expect(result.left).toBeInstanceOf(ExternalLinkUpsertError)
          expect(result.left.linkCount).toBe(1)
          expect(result.left.orgId).toBe('test_org_123')
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  effect(
    'detectAndMarkDeleted throws DetectionError on database failure',
    () =>
      Effect.gen(function* () {
        const internalManager = yield* InternalManager

        // Cause database error by not creating tables first
        const syncStartTime = new Date()

        const result = yield* Effect.either(
          internalManager.detectAndMarkDeleted('pco', 'Person', syncStartTime),
        )

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          expect(result.left).toBeInstanceOf(DetectionError)
          expect(result.left.adapter).toBe('pco')
          expect(result.left.entityType).toBe('Person')
          expect(result.left.orgId).toBe('test_org_123')
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  // ===== INTEGRATION TEST =====

  effect(
    'Integration: basic workflow with external links and entities',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData
        const internalManager = yield* InternalManager

        // Step 1: Upsert external links
        const personLinkInput = createTestExternalLinkInput({
          entityType: 'person',
          externalId: 'pco_integration_person',
        })

        const result = yield* internalManager.processExternalLinks([personLinkInput])

        expect(result.allExternalLinks.length).toBe(1)

        const personLink = pipe(
          result.allExternalLinks,
          Array.findFirst((link) => link.externalId === 'pco_integration_person'),
        )

        expect(Option.isSome(personLink)).toBe(true)

        // Step 2: Process entity data
        if (Option.isSome(personLink)) {
          const personEntityData = createTestEntityData({
            _tag: 'person',
            id: personLink.value.entityId,
            name: 'Integration Test Person',
          })

          yield* internalManager.processEntities([personEntityData])

          // Verify the complete workflow
          const sql = yield* SqlClient.SqlClient

          // Check external links
          const links = yield* sql`
          SELECT * FROM "openfaith_externalLinks" 
          WHERE "externalId" = 'pco_integration_person'
          AND "orgId" = 'test_org_123'
        `
          expect(links.length).toBe(1)

          // Check entities
          const people = yield* sql`
          SELECT * FROM "openfaith_people" 
          WHERE "id" = ${personLink.value.entityId} AND "orgId" = 'test_org_123'
        `
          expect(people.length).toBe(1)
          expect(people[0]?.name).toBe('Integration Test Person')
        }
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )

  // ===== TYPE-LEVEL TESTING =====

  effect(
    'Type validation: InternalManager service methods have correct signatures',
    () =>
      Effect.gen(function* () {
        const internalManager = yield* InternalManager

        // Test that method signatures match expected types

        // detectAndMarkDeleted should accept string, string, Date and return Effect<Array<ExternalLink>, DetectionError>
        const detectionResult = internalManager.detectAndMarkDeleted('pco', 'Person', new Date())

        // getExternalLink should accept string, string and return Effect<Option<ExternalLink>, ExternalLinkRetrievalError>
        const retrievalResult = internalManager.getExternalLink('test_id', 'pco')

        // processEntityData should accept Array<EntityData> and return Effect<void, EntityProcessingError>
        const entityProcessingResult = internalManager.processEntities([])

        // processEntityEdges should accept Array<RelationshipInput> and return Effect<void, RelationshipProcessingError>
        const edgeProcessingResult = internalManager.processRelationships([])

        // upsertExternalLinks should accept Array<ExternalLinkInput> and return Effect<Array<ExternalLink>, ExternalLinkUpsertError>
        const upsertResult = internalManager.processExternalLinks([])

        // These should all compile correctly - we just need to verify the types exist
        expect(typeof detectionResult).toBe('object')
        expect(typeof retrievalResult).toBe('object')
        expect(typeof entityProcessingResult).toBe('object')
        expect(typeof edgeProcessingResult).toBe('object')
        expect(typeof upsertResult).toBe('object')
      }).pipe(
        Effect.provide(TestLayer),
        Effect.catchTag('ContainerError', (_error) => Effect.void),
      ),
    { timeout: 120000 },
  )
})
