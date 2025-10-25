/**
 * Comprehensive tests for PcoAdapterManagerLive implementation
 *
 * These tests require Docker to be available for PostgreSQL test containers.
 * If Docker is not available, tests will be skipped with appropriate messages.
 *
 * To run these tests:
 * 1. Ensure Docker is installed and running
 * 2. Start infrastructure: bun run infra
 * 3. Run tests: bun test adapters/pco/pcoAdapterManagerLive.test.ts
 */

import { expect } from 'bun:test'
import { SqlClient } from '@effect/sql'
import * as Pg from '@effect/sql-drizzle/Pg'
import {
  AdapterEntityNotFoundError,
  AdapterManager,
  InternalManager,
  RateLimiter,
  TokenAuth,
  TokenKey,
} from '@openfaith/adapter-core/server'
import { layer } from '@openfaith/bun-test'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { MockPcoHttpClientLayer } from '@openfaith/pco/api/pcoMockClient'
import { PcoAdapterManagerLive } from '@openfaith/pco/pcoAdapterManagerLive'
import { InternalManagerLive } from '@openfaith/server/live/internalManagerLive'
import { createTestTables } from '@openfaith/workers/helpers/test-utils/test-schema'
import { PgContainer } from '@openfaith/workers/helpers/test-utils/utils-pg'
import { Array, Effect, Layer, pipe } from 'effect'

// Test TokenKey service
const TestTokenKey = Layer.succeed(TokenKey, 'test_org_123')

// Mock TokenAuth that returns a fake access token
const MockTokenAuth = Layer.effect(
  TokenAuth,
  Effect.gen(function* () {
    return TokenAuth.of({
      getValidAccessToken: Effect.succeed('mock_access_token' as any),
    })
  }),
)

// Mock RateLimiter that doesn't actually rate limit
const MockRateLimiter = Layer.succeed(
  RateLimiter.RateLimiter,
  RateLimiter.RateLimiter.of({
    maybeWait: () => Effect.succeed(undefined),
  }),
)

// Database layer with container
const DrizzlePgLive = Pg.layer.pipe(Layer.provideMerge(PgContainer.ClientLive))

// PcoHttpClient with mock HTTP client and auth
const PcoHttpClientLive = PcoHttpClient.Default.pipe(
  Layer.provide(
    Layer.mergeAll(MockPcoHttpClientLayer, MockTokenAuth, MockRateLimiter, TestTokenKey),
  ),
)

// InternalManager with database
const InternalManagerTestLayer = InternalManagerLive.pipe(
  Layer.provide(Layer.mergeAll(DrizzlePgLive, TestTokenKey)),
)

// PcoAdapterManager with all its dependencies
const PcoAdapterManagerTestLayer = PcoAdapterManagerLive.pipe(
  Layer.provide(Layer.mergeAll(PcoHttpClientLive, TestTokenKey)),
)

// Combined test layer - merge all services together so they're all available
const TestLayer = Layer.mergeAll(
  PcoAdapterManagerTestLayer,
  InternalManagerTestLayer,
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
  yield* sql`DELETE FROM "openfaith_emails" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_phoneNumbers" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_campuses" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_folders" WHERE "orgId" = ${testOrgId}`
  yield* sql`DELETE FROM "openfaith_orgs" WHERE "id" = ${testOrgId}`
})

// ===== BASIC CONNECTIVITY TESTS =====

layer(TestLayer)('PcoAdapterManager Tests', (it) => {
  it.effect(
    'AdapterManager service layer initializes correctly',
    () =>
      Effect.gen(function* () {
        const adapterManager = yield* AdapterManager

        // Verify the service has all expected methods
        expect(adapterManager.adapter).toBe('pco')
        expect(typeof adapterManager.syncEntityType).toBe('function')
        expect(typeof adapterManager.syncEntityId).toBe('function')
        expect(typeof adapterManager.createEntity).toBe('function')
        expect(typeof adapterManager.updateEntity).toBe('function')
        expect(typeof adapterManager.deleteEntity).toBe('function')
        expect(typeof adapterManager.getEntityManifest).toBe('function')
        expect(typeof adapterManager.subscribeToWebhooks).toBe('function')
        expect(typeof adapterManager.processWebhook).toBe('function')
        expect(typeof adapterManager.getWebhookOrgId).toBe('function')
      }),
    { timeout: 120000 },
  )

  // ===== SYNCENTITYTYPE METHOD TESTS =====

  it.effect(
    'syncEntityType syncs Person entities from mock PCO API',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData

        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        // Sync Person entity type using mock data
        yield* adapterManager.syncEntityType({
          entityType: 'Person',
          processEntities: internalManager.processEntities,
          processExternalLinks: internalManager.processExternalLinks,
          processMutations: () => Effect.succeed(undefined),
          processRelationships: internalManager.processRelationships,
        })

        // Verify data was processed
        const sql = yield* SqlClient.SqlClient

        // Check external links were created
        const externalLinks = yield* sql`
          SELECT * FROM "openfaith_externalLinks" 
          WHERE "adapter" = 'pco' 
          AND "entityType" = 'person'
          AND "orgId" = 'test_org_123'
        `
        expect(externalLinks.length).toBeGreaterThan(0)

        // Check Person entity was created
        const people = yield* sql`
          SELECT * FROM "openfaith_people" 
          WHERE "orgId" = 'test_org_123'
        `
        expect(people.length).toBeGreaterThan(0)

        // Verify person has correct data from mock
        const firstPerson = people[0]
        expect(firstPerson?.name).toBe('Peter Pogenpoel')
      }),
    { timeout: 120000 },
  )

  it.effect(
    'syncEntityType processes included entities from Person sync',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData

        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        yield* adapterManager.syncEntityType({
          entityType: 'Person',
          processEntities: internalManager.processEntities,
          processExternalLinks: internalManager.processExternalLinks,
          processMutations: () => Effect.succeed(undefined),
          processRelationships: internalManager.processRelationships,
        })

        const sql = yield* SqlClient.SqlClient

        // Check that included Email was processed
        const emails = yield* sql`
          SELECT * FROM "openfaith_emails" 
          WHERE "orgId" = 'test_org_123'
        `
        expect(emails.length).toBeGreaterThan(0)

        // Verify email data from mock
        const firstEmail = emails[0]
        expect(firstEmail?.address).toBe('peter@gmail.com')

        // Check that included Address was processed
        const addresses = yield* sql`
          SELECT * FROM "openfaith_addresses" 
          WHERE "orgId" = 'test_org_123'
        `
        expect(addresses.length).toBeGreaterThan(0)

        // Verify address data from mock
        const firstAddress = addresses[0]
        expect(firstAddress?.city).toBe('Washington')
        expect(firstAddress?.state).toBe('DC')

        // Check that included PhoneNumber was processed
        const phoneNumbers = yield* sql`
          SELECT * FROM "openfaith_phoneNumbers" 
          WHERE "orgId" = 'test_org_123'
        `
        expect(phoneNumbers.length).toBeGreaterThan(0)

        // Verify phone data from mock
        const firstPhone = phoneNumbers[0]
        expect(firstPhone?.number).toBe('2825658985')
      }),
    { timeout: 120000 },
  )

  it.effect(
    'syncEntityType creates relationships between Person and related entities',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData

        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        yield* adapterManager.syncEntityType({
          entityType: 'Person',
          processEntities: internalManager.processEntities,
          processExternalLinks: internalManager.processExternalLinks,
          processMutations: () => Effect.succeed(undefined),
          processRelationships: internalManager.processRelationships,
        })

        const sql = yield* SqlClient.SqlClient

        // Check that relationships were created (edges table)
        const edges = yield* sql`
          SELECT * FROM "openfaith_edges" 
          WHERE "orgId" = 'test_org_123'
        `
        expect(edges.length).toBeGreaterThan(0)

        // Verify relationship types exist
        const relationshipTypes = pipe(
          edges,
          Array.map((edge) => edge.relationshipType),
        )

        // Should have person_has_email relationships
        const hasEmailRel = pipe(
          relationshipTypes,
          Array.some((type) => type === 'person_has_email'),
        )
        expect(hasEmailRel).toBe(true)

        // Should have person_has_address relationships
        const hasAddressRel = pipe(
          relationshipTypes,
          Array.some((type) => type === 'person_has_address'),
        )
        expect(hasAddressRel).toBe(true)

        // Should have person_has_phonenumber relationships
        const hasPhoneRel = pipe(
          relationshipTypes,
          Array.some((type) => type === 'person_has_phonenumber'),
        )
        expect(hasPhoneRel).toBe(true)
      }),
    { timeout: 120000 },
  )

  // ===== ERROR HANDLING TESTS =====

  it.effect(
    'syncEntityType throws AdapterEntityNotFoundError for unsupported entity type',
    () =>
      Effect.gen(function* () {
        yield* createTestTables

        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        const result = yield* Effect.either(
          adapterManager.syncEntityType({
            entityType: 'NonExistentEntity',
            processEntities: internalManager.processEntities,
            processExternalLinks: internalManager.processExternalLinks,
            processMutations: () => Effect.succeed(undefined),
            processRelationships: internalManager.processRelationships,
          }),
        )

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          expect(result.left).toBeInstanceOf(AdapterEntityNotFoundError)
          expect(result.left.adapter).toBe('pco')
          expect(result.left.entityType).toBe('NonExistentEntity')
        }
      }),
    { timeout: 120000 },
  )

  // ===== INTEGRATION TESTS =====

  it.effect(
    'Integration: syncEntityType creates complete data graph for Person',
    () =>
      Effect.gen(function* () {
        yield* createTestTables
        yield* cleanupTestData

        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        // Sync Person entities
        yield* adapterManager.syncEntityType({
          entityType: 'Person',
          processEntities: internalManager.processEntities,
          processExternalLinks: internalManager.processExternalLinks,
          processMutations: () => Effect.succeed(undefined),
          processRelationships: internalManager.processRelationships,
        })

        const sql = yield* SqlClient.SqlClient

        // Verify complete data graph exists
        // 1. Person entity
        const people = yield* sql`
          SELECT * FROM "openfaith_people" 
          WHERE "orgId" = 'test_org_123'
        `
        expect(people.length).toBe(1)
        const person = people[0]

        if (!person) {
          throw new Error('Expected person to exist')
        }

        const personId = person.id as string

        // 2. External link for person
        const personLinks = yield* sql`
          SELECT * FROM "openfaith_externalLinks" 
          WHERE "entityId" = ${personId}
          AND "orgId" = 'test_org_123'
        `
        expect(personLinks.length).toBe(1)
        expect(personLinks[0]?.externalId).toBe('160290623')

        // 3. Email entities linked to person
        const emails = yield* sql`
          SELECT * FROM "openfaith_emails" 
          WHERE "orgId" = 'test_org_123'
        `
        expect(emails.length).toBe(1)

        // 4. Edge connecting person to email
        const emailEdges = yield* sql`
          SELECT * FROM "openfaith_edges" 
          WHERE "sourceEntityId" = ${personId}
          AND "targetEntityTypeTag" = 'email'
          AND "orgId" = 'test_org_123'
        `
        expect(emailEdges.length).toBe(1)

        // 5. Verify entity relationships table was updated
        const entityRelationships = yield* sql`
          SELECT * FROM "openfaith_entityRelationships" 
          WHERE "orgId" = 'test_org_123'
          AND "entityTypeTag" = 'person'
        `
        expect(entityRelationships.length).toBeGreaterThan(0)

        // Should have relationships to email, address, phonenumber
        const relatedTypes = pipe(
          entityRelationships,
          Array.flatMap((rel) => {
            const typeTags = rel.relatedEntityTypeTags
            if (Array.isArray(typeTags)) {
              return typeTags
            }
            return []
          }),
        )
        expect(relatedTypes).toContain('email')
        expect(relatedTypes).toContain('address')
        expect(relatedTypes).toContain('phonenumber')
      }),
    { timeout: 120000 },
  )

  // ===== TYPE-LEVEL TESTING =====

  it.effect(
    'Type validation: syncEntityType has correct signature',
    () =>
      Effect.gen(function* () {
        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        // Should compile correctly with proper types
        const syncResult = adapterManager.syncEntityType({
          entityType: 'Person',
          processEntities: internalManager.processEntities,
          processExternalLinks: internalManager.processExternalLinks,
          processMutations: () => Effect.succeed(undefined),
          processRelationships: internalManager.processRelationships,
        })

        expect(typeof syncResult).toBe('object')
      }),
    { timeout: 120000 },
  )

  it.effect(
    'Type validation: AdapterManager methods return proper Effect types',
    () =>
      Effect.gen(function* () {
        const adapterManager = yield* AdapterManager
        const internalManager = yield* InternalManager

        // syncEntityType should return Effect<void, ...errors>
        const syncResult = adapterManager.syncEntityType({
          entityType: 'Person',
          processEntities: internalManager.processEntities,
          processExternalLinks: internalManager.processExternalLinks,
          processMutations: () => Effect.succeed(undefined),
          processRelationships: internalManager.processRelationships,
        })

        // getEntityManifest should return AdapterEntityManifest
        const manifest = adapterManager.getEntityManifest()

        // These should all compile correctly
        expect(typeof syncResult).toBe('object')
        expect(typeof manifest).toBe('object')
      }),
    { timeout: 120000 },
  )
})
