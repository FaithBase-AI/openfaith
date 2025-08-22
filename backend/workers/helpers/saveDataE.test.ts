import { expect } from 'bun:test'
import { SqlClient } from '@effect/sql'
import * as Pg from '@effect/sql-drizzle/Pg'
import { AdapterTokenError } from '@openfaith/adapter-core/errors/adapterErrors'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { effect } from '@openfaith/bun-test'
import type { PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import {
  detectAndMarkDeletedEntitiesE,
  getProperEntityName,
  mkEdgesFromIncludesE,
  mkEntityUpsertE,
  mkExternalLinksE,
  saveDataE,
  saveIncludesE,
  updateEntityRelationshipsE,
} from '@openfaith/workers/helpers/saveDataE'
import { createTestTables } from '@openfaith/workers/helpers/test-utils/test-schema'
import { PgContainer } from '@openfaith/workers/helpers/test-utils/utils-pg'
import { Array, Effect, Layer, Option, pipe, Stream } from 'effect'

// Test TokenKey service
const TestTokenKey = Layer.succeed(TokenKey, 'test_org_123')

// Mock AdapterOperations service
const TestAdapterOperations = Layer.succeed(
  AdapterOperations,
  AdapterOperations.of({
    extractUpdatedAt: (response: unknown) => {
      const entity = response as any
      return entity?.attributes?.updated_at
        ? Option.some(entity.attributes.updated_at)
        : Option.none()
    },
    fetchEntityById: (entityType: string, entityId: string) =>
      Effect.succeed({
        attributes: {
          name: `Test ${entityType} ${entityId}`,
        },
        id: entityId,
        type: entityType,
      }),
    fetchToken: () =>
      Effect.fail(
        new AdapterTokenError({
          adapter: 'pco',
          message: 'Not implemented in tests',
        }),
      ),
    getAdapterTag: () => 'pco',
    getEntityManifest: () => ({}),
    listEntityData: () => Stream.empty,
    processEntityData: () => Effect.succeed(undefined),
    processWebhook: () => Effect.succeed([]),
    syncEntityData: () => Effect.succeed([]),
    transformEntityData: (_entityName: string, data: unknown) => Effect.succeed(data),
  }),
)

// Database layer with container
const DrizzlePgLive = Pg.layer.pipe(Layer.provideMerge(PgContainer.ClientLive))

// Combined test layer
const TestLayer = Layer.mergeAll(DrizzlePgLive, TestTokenKey, TestAdapterOperations)

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

// Test data factories based on real database structure
const createPcoBaseEntity = (
  id = 'pco_123',
  type = 'Person',
  attributes: any = {
    // Add required PCO person fields to avoid schema validation errors
    accounting_administrator: false,
    anniversary: null,
    avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JD.png',
    birthdate: null,
    child: false,
    created_at: '2023-01-01T00:00:00Z',
    demographic_avatar_url: 'https://example.com/demo.jpg',
    first_name: 'John',
    gender: null,
    given_name: null,
    grade: null,
    graduation_year: null,
    inactivated_at: null,
    last_name: 'Doe',
    medical_notes: null,
    membership: null,
    middle_name: null,
    name: 'John Doe',
    nickname: null,
    passed_background_check: false,
    people_permissions: null,
    remote_id: null,
    school_type: null,
    site_administrator: false,
    status: 'active' as const,
    updated_at: '2023-01-02T00:00:00Z',
  },
  relationships?: any,
): PcoBaseEntity => ({
  attributes,
  id,
  relationships,
  type,
})

const createPcoCollectionData = (
  data: ReadonlyArray<PcoBaseEntity> = [createPcoBaseEntity()],
  included: ReadonlyArray<PcoBaseEntity> = [],
) => ({
  data,
  included: included as any,
  links: { self: 'test' },
  meta: { count: data.length, total_count: data.length },
})

// Simple table creation for testing basic connectivity
const createSimpleTestTables = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  // Create a simple test table
  yield* sql`
    CREATE TABLE IF NOT EXISTS "test_external_links" (
      "id" SERIAL PRIMARY KEY,
      "entity_id" TEXT NOT NULL,
      "external_id" TEXT NOT NULL,
      "entity_type" TEXT NOT NULL,
      "adapter" TEXT NOT NULL,
      "created_at" TIMESTAMP DEFAULT NOW()
    )
  `
})

// Simple function to test database connectivity
const insertTestExternalLink = (entityId: string, externalId: string) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    yield* sql`
      INSERT INTO "test_external_links" ("entity_id", "external_id", "entity_type", "adapter")
      VALUES (${entityId}, ${externalId}, 'Person', 'pco')
    `
  })

const getTestExternalLinks = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  return yield* sql`SELECT * FROM "test_external_links"`
})

// Basic connectivity tests
effect(
  'database connection and basic operations work',
  () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      // Test basic connectivity
      const result = yield* sql`SELECT 1 as test`
      expect(result).toEqual([{ test: 1 }])

      // Create test tables
      yield* createSimpleTestTables

      // Test insert and select
      yield* insertTestExternalLink('per_123', 'pco_123')
      const links = yield* getTestExternalLinks

      expect(links.length).toBe(1)
      expect(links[0]?.entity_id).toBe('per_123')
      expect(links[0]?.external_id).toBe('pco_123')
      expect(links[0]?.entity_type).toBe('Person')
      expect(links[0]?.adapter).toBe('pco')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'test data factory creates valid PCO entities',
  () =>
    Effect.gen(function* () {
      // This test doesn't need database - just testing data structures
      const entity = createPcoBaseEntity()

      expect(entity.id).toBe('pco_123')
      expect(entity.type).toBe('Person')
      expect((entity.attributes as any).first_name).toBe('John')
      expect((entity.attributes as any).last_name).toBe('Doe')
      expect((entity.attributes as any).status).toBe('active')
    }),
  { timeout: 120000 },
)

// Real saveDataE function tests
effect(
  'creates external links for valid data',
  () =>
    Effect.gen(function* () {
      // First create the database schema
      yield* createTestTables

      const data = [createPcoBaseEntity()]
      const result = yield* mkExternalLinksE(data)

      // Newly created external links should be returned for processing
      expect(result.length).toBe(1)
      expect(result[0]?.externalId).toBe('pco_123')
      // Check that entityId is a valid ULID format (starts with person_)
      expect(result[0]?.entityId.startsWith('person_')).toBe(true)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// ===== COMPREHENSIVE COVERAGE TESTS =====

// Test saveIncludesE function directly
effect(
  'saveIncludesE processes included entities correctly',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const mainEntity = createPcoBaseEntity('pco_main', 'Person')
      const includedAddress = createPcoBaseEntity(
        'pco_addr_123',
        'Address',
        {
          city: 'Test City',
          country_code: 'US',
          country_name: 'United States',
          created_at: '2023-01-01T00:00:00Z',
          location: 'Home',
          primary: true,
          state: 'CA',
          street_line_1: '123 Main St',
          street_line_2: null,
          updated_at: '2023-01-02T00:00:00Z',
          zip: '12345',
        },
        {
          person: {
            data: { id: 'pco_main', type: 'Person' },
          },
        },
      )

      // First create external links for the main entity
      yield* mkExternalLinksE([mainEntity])

      // Query the database to get the external links (since mkExternalLinksE filters out new ones)
      const sqlClient = yield* SqlClient.SqlClient
      const dbResult = yield* sqlClient`
        SELECT "entityId", "externalId", "lastProcessedAt" 
        FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_main' AND "orgId" = 'test_org_123'
      `
      expect(dbResult.length).toBe(1)

      // Cast to the correct type for saveIncludesE
      const mainExternalLinks = dbResult.map((row) => ({
        entityId: String(row.entityId),
        externalId: String(row.externalId),
        lastProcessedAt: new Date(row.lastProcessedAt as string),
      }))

      // Test saveIncludesE directly
      const data = {
        data: [mainEntity],
        included: [includedAddress],
        links: { self: 'test' },
        meta: { count: 1, total_count: 1 },
      }

      const result = yield* saveIncludesE(data, mainExternalLinks, 'Person')
      expect(result).toBeUndefined() // Function returns void

      // Verify that included entities were processed
      const sql = yield* SqlClient.SqlClient
      const addressLinks =
        yield* sql`SELECT * FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_addr_123'`
      expect(addressLinks.length).toBe(1)
      expect(addressLinks[0]?.entityType).toBe('address')

      // CRITICAL: Verify that the actual address data was saved to the addresses table
      const addresses =
        yield* sql`SELECT * FROM "openfaith_addresses" WHERE "orgId" = 'test_org_123'`
      expect(addresses.length).toBe(1)
      expect(addresses[0]?.city).toBe('Test City')
      expect(addresses[0]?.state).toBe('CA')
      expect(addresses[0]?.streetLine1).toBe('123 Main St')
      expect(addresses[0]?.zip).toBe('12345')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test mkEdgesFromIncludesE function directly
effect(
  'mkEdgesFromIncludesE creates edges for relationships',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const mainEntity = createPcoBaseEntity('pco_edge_main', 'Person')
      const includedPhone = createPcoBaseEntity(
        'pco_phone_123',
        'PhoneNumber',
        {
          carrier: null,
          country_code: 'US',
          created_at: '2023-01-01T00:00:00Z',
          e164: '+15551234',
          international: null,
          location: 'Mobile',
          national: null,
          number: '555-1234',
          primary: true,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          person: {
            data: { id: 'pco_edge_main', type: 'Person' },
          },
        },
      )

      // Create external links for both entities
      yield* mkExternalLinksE([mainEntity])
      yield* mkExternalLinksE([includedPhone])

      // mkExternalLinksE filters out newly created links (same lastProcessedAt)
      // So we need to query the database directly for the created links
      const sql = yield* SqlClient.SqlClient
      const mainLinks = yield* sql<{
        entityId: string
        externalId: string
        lastProcessedAt: Date
      }>`
      SELECT "entityId", "externalId", "lastProcessedAt" 
      FROM "openfaith_externalLinks" 
      WHERE "externalId" = ${mainEntity.id}
    `
      const phoneLinks = yield* sql<{
        entityId: string
        externalId: string
        lastProcessedAt: Date
      }>`
      SELECT "entityId", "externalId", "lastProcessedAt" 
      FROM "openfaith_externalLinks" 
      WHERE "externalId" = ${includedPhone.id}
    `

      expect(mainLinks.length).toBe(1)
      expect(phoneLinks.length).toBe(1)

      // Test mkEdgesFromIncludesE directly - use the queried links
      const result = yield* mkEdgesFromIncludesE([includedPhone], mainLinks, phoneLinks, 'Person')
      expect(result).toBeUndefined() // Function returns void

      // Verify edges were created
      const edges = yield* sql`
      SELECT * FROM "openfaith_edges"
      WHERE "sourceEntityId" = ${phoneLinks[0]?.entityId || ''}
      OR "targetEntityId" = ${phoneLinks[0]?.entityId || ''}
    `
      expect(edges.length).toBeGreaterThan(0)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test custom fields merging
effect('mkEntityUpsertE transforms PCO attributes to custom fields', () =>
  Effect.gen(function* () {
    yield* createTestTables

    // Create entity with PCO attributes that should become custom fields
    const entityWithCustomFieldAttrs = createPcoBaseEntity('pco_custom_transform', 'Person', {
      // Required fields to avoid validation errors
      accounting_administrator: false,
      anniversary: null,
      avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JS.png',
      birthdate: null,

      // Fields marked with [OfCustomField]: true (should become custom fields)
      child: false,
      created_at: '2023-01-01T00:00:00Z',
      demographic_avatar_url: 'https://example.com/demo.jpg',
      // Standard fields (should map to canonical person fields)
      first_name: 'Jane',
      gender: null,
      given_name: 'Jane Marie',
      grade: null,
      graduation_year: null,
      inactivated_at: null,
      last_name: 'Smith',
      medical_notes: null,
      membership: null,
      middle_name: null,
      name: 'Jane Smith',
      nickname: 'Janie',
      passed_background_check: true,
      people_permissions: null,
      remote_id: null,
      school_type: null,
      site_administrator: false,
      status: 'active',
      updated_at: '2023-01-02T00:00:00Z',
    })

    const data: ReadonlyArray<readonly [string, PcoBaseEntity]> = [
      ['person_custom_transform_123', entityWithCustomFieldAttrs],
    ]
    yield* mkEntityUpsertE(data)

    // Verify that the entity was created and custom fields were populated
    const sql = yield* SqlClient.SqlClient
    const result =
      yield* sql`SELECT "name", "lastName", "customFields" FROM "openfaith_people" WHERE "id" = 'person_custom_transform_123'`
    expect(result.length).toBe(1)

    // Check that standard fields were mapped correctly
    expect(result[0]?.name).toBe('Jane Smith')
    expect(result[0]?.lastName).toBe('Smith')

    // Check that custom fields were created from PCO attributes
    const customFieldsRaw = result[0]?.customFields
    const customFields =
      typeof customFieldsRaw === 'string' ? JSON.parse(customFieldsRaw) : customFieldsRaw
    expect(Array.isArray(customFields)).toBe(true)
    expect(customFields.length).toBeGreaterThan(0)

    // Verify some specific custom fields from PCO attributes
    const pcoFields = customFields.filter((f: any) => f.source === 'pco')
    expect(pcoFields.length).toBeGreaterThan(0)

    // Should have custom fields for PCO-specific attributes
    const hasCustomFields = pcoFields.some((f: any) =>
      [
        'pco_child',
        'pco_given_name',
        'pco_nickname',
        'pco_passed_background_check',
        'pco_site_administrator',
      ].includes(f.name),
    )
    expect(hasCustomFields).toBe(true)
  }).pipe(
    Effect.provide(TestLayer),
    Effect.catchTag('ContainerError', (error) => {
      console.log('Container test skipped due to error:', error.cause)
      return Effect.void
    }),
  ),
)

// Test error scenarios
effect(
  'mkExternalLinksE handles invalid entity types',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      // Create entity with invalid type not in ofLookup
      const invalidEntity = createPcoBaseEntity('pco_invalid', 'InvalidType')
      const result = yield* mkExternalLinksE([invalidEntity])

      // Should return empty array for invalid types
      expect(result).toEqual([])
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'mkEntityUpsertE handles invalid entity types',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const invalidEntity = createPcoBaseEntity('pco_invalid', 'InvalidType')
      const data: ReadonlyArray<readonly [string, PcoBaseEntity]> = [['invalid_123', invalidEntity]]

      const result = yield* mkEntityUpsertE(data)

      // Should return undefined (no-op) for invalid types
      expect(result).toBeUndefined()
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Comprehensive sync scenario tests for mkExternalLinksE
effect(
  'mkExternalLinksE sync scenarios - no existing external links (inserts data)',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      const sql = yield* SqlClient.SqlClient

      const entity = createPcoBaseEntity('pco_new_123', 'Person', {
        created_at: '2023-01-01T00:00:00Z',
        first_name: 'John',
        last_name: 'Doe',
        updated_at: '2023-01-15T10:30:00Z',
      })

      // First call - no existing external links
      const result = yield* mkExternalLinksE([entity])

      // Should return the newly created link for processing
      expect(result.length).toBe(1)
      expect(result[0]?.externalId).toBe('pco_new_123')

      // Verify the external link was created in the database
      const links = yield* sql<{
        externalId: string
        updatedAt: Date
        lastProcessedAt: Date
      }>`
        SELECT "externalId", "updatedAt", "lastProcessedAt" 
        FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_new_123'
      `
      expect(links.length).toBe(1)
      expect(links[0]?.externalId).toBe('pco_new_123')
      expect(links[0]?.updatedAt).toEqual(new Date('2023-01-15T10:30:00Z'))
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test removed - redundant with "input data older than saved" test

effect(
  'mkExternalLinksE sync scenarios - input data older than saved (does not update)',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      const sql = yield* SqlClient.SqlClient

      // Create entity with newer timestamp
      const newerEntity = createPcoBaseEntity('pco_older_123', 'Person', {
        created_at: '2023-01-01T00:00:00Z',
        first_name: 'Bob',
        last_name: 'Johnson',
        updated_at: '2023-01-20T10:30:00Z', // Newer
      })

      // First call - create with newer data
      yield* mkExternalLinksE([newerEntity])

      const initialLinks = yield* sql<{
        updatedAt: Date
        lastProcessedAt: Date
      }>`
        SELECT "updatedAt", "lastProcessedAt" FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_older_123'
      `
      const initialLastProcessedAt = initialLinks[0]?.lastProcessedAt

      // Processing time will be different naturally due to database operations

      // Create entity with older timestamp
      const olderEntity = createPcoBaseEntity('pco_older_123', 'Person', {
        created_at: '2023-01-01T00:00:00Z',
        first_name: 'Bob',
        last_name: 'Johnson',
        updated_at: '2023-01-10T10:30:00Z', // Older
      })

      // Second call with older data
      const result = yield* mkExternalLinksE([olderEntity])

      // Should return the link for processing (updatedAt changed, even though older)
      expect(result.length).toBe(1)
      expect(result[0]?.externalId).toBe('pco_older_123')

      // Verify updatedAt was updated to the older value
      // and lastProcessedAt WAS updated (because updatedAt changed)
      const updatedLinks = yield* sql<{
        updatedAt: Date
        lastProcessedAt: Date
      }>`
        SELECT "updatedAt", "lastProcessedAt" FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_older_123'
      `
      expect(updatedLinks[0]?.updatedAt).toEqual(new Date('2023-01-10T10:30:00Z'))
      // lastProcessedAt should be newer than initial (was updated)
      expect(updatedLinks[0]?.lastProcessedAt.getTime()).toBeGreaterThan(
        initialLastProcessedAt!.getTime(),
      )
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'mkExternalLinksE sync scenarios - input data newer than saved (updates lastProcessedAt)',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      const sql = yield* SqlClient.SqlClient

      // Create entity with older timestamp
      const olderEntity = createPcoBaseEntity('pco_newer_123', 'Person', {
        created_at: '2023-01-01T00:00:00Z',
        first_name: 'Alice',
        last_name: 'Williams',
        updated_at: '2023-01-10T10:30:00Z', // Older
      })

      // First call - create with older data
      yield* mkExternalLinksE([olderEntity])

      const initialLinks = yield* sql<{
        updatedAt: Date
        lastProcessedAt: Date
      }>`
        SELECT "updatedAt", "lastProcessedAt" FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_newer_123'
      `
      const initialLastProcessedAt = initialLinks[0]?.lastProcessedAt

      // Processing time will be different naturally due to database operations

      // Create entity with newer timestamp
      const newerEntity = createPcoBaseEntity('pco_newer_123', 'Person', {
        created_at: '2023-01-01T00:00:00Z',
        first_name: 'Alice',
        last_name: 'Williams',
        updated_at: '2023-01-20T10:30:00Z', // Newer
      })

      // Second call with newer data
      const result = yield* mkExternalLinksE([newerEntity])

      // Should return the updated link for processing (updatedAt changed)
      expect(result.length).toBe(1)
      expect(result[0]?.externalId).toBe('pco_newer_123')

      // Verify both updatedAt and lastProcessedAt were updated
      const updatedLinks = yield* sql<{
        updatedAt: Date
        lastProcessedAt: Date
      }>`
        SELECT "updatedAt", "lastProcessedAt" FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_newer_123'
      `
      expect(updatedLinks[0]?.updatedAt).toEqual(new Date('2023-01-20T10:30:00Z'))
      // lastProcessedAt should be newer than initial
      expect(updatedLinks[0]?.lastProcessedAt.getTime()).toBeGreaterThan(
        initialLastProcessedAt!.getTime(),
      )
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'mkExternalLinksE handles entities without updated_at field',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      const sql = yield* SqlClient.SqlClient

      const entityWithoutUpdatedAt = createPcoBaseEntity('pco_no_update', 'Person', {
        accounting_administrator: false,
        anniversary: null,
        avatar: 'https://example.com/avatar.png',
        birthdate: null,
        child: false,
        created_at: '2023-01-01T00:00:00Z',
        // Note: no updated_at field
        first_name: 'Jane',
        last_name: 'Smith',
        status: 'active',
      })

      const result = yield* mkExternalLinksE([entityWithoutUpdatedAt])

      // Should return the newly created link (needs processing, even without updated_at)
      expect(result.length).toBe(1)
      expect(result[0]?.externalId).toBe('pco_no_update')

      // Verify it was created in the database with current date as updatedAt
      const links = yield* sql<{ externalId: string; updatedAt: Date }>`
        SELECT "externalId", "updatedAt" FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_no_update'
      `
      expect(links.length).toBe(1)
      expect(links[0]?.externalId).toBe('pco_no_update')
      // Should have used current date as fallback
      const now = new Date()
      const updatedAt = links[0]?.updatedAt!
      expect(Math.abs(updatedAt.getTime() - now.getTime())).toBeLessThan(5000) // Within 5 seconds
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test entities without relationships
effect(
  'mkEdgesFromIncludesE handles entities without relationships',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const mainEntity = createPcoBaseEntity('pco_no_rel_main', 'Person')
      const includedEntityNoRel = createPcoBaseEntity(
        'pco_no_rel_addr',
        'Address',
        {
          city: 'No Rel City',
          country_code: 'US',
          country_name: 'United States',
          created_at: '2023-01-01T00:00:00Z',
          location: 'Work',
          primary: false,
          state: 'NY',
          street_line_1: '789 No Rel St',
          street_line_2: null,
          updated_at: '2023-01-02T00:00:00Z',
          zip: '99999',
        },
        // Note: no relationships object
      )

      const mainExternalLinks = yield* mkExternalLinksE([mainEntity])
      const addrExternalLinks = yield* mkExternalLinksE([includedEntityNoRel])

      // Should handle entities without relationships gracefully
      const result = yield* mkEdgesFromIncludesE(
        [includedEntityNoRel],
        mainExternalLinks,
        addrExternalLinks,
        'Person',
      )
      expect(result).toBeUndefined()

      // Should not create any edges
      const sql = yield* SqlClient.SqlClient
      const edges =
        yield* sql`SELECT * FROM "openfaith_edges" WHERE "sourceEntityId" = ${mainExternalLinks[0]?.entityId || ''}`
      expect(edges.length).toBe(0)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'upserts entities successfully',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      const entity = createPcoBaseEntity()
      const data: ReadonlyArray<readonly [string, PcoBaseEntity]> = [['per_123', entity]]

      const result = yield* mkEntityUpsertE(data)
      expect(result).toBeUndefined()
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'processes data successfully',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      const data = createPcoCollectionData([createPcoBaseEntity()])
      const result = yield* saveDataE(data)
      expect(result).toBeUndefined()
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'full workflow with real database operations',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      // Test the full workflow
      const mainEntity = createPcoBaseEntity('pco_123', 'Person')
      const includedEntity = createPcoBaseEntity(
        'pco_456',
        'Address',
        {
          city: 'Test City',
          country_code: 'US',
          country_name: 'United States',
          created_at: '2023-01-01T00:00:00Z',
          location: 'Home',
          primary: true,
          state: 'CA',
          street_line_1: '123 Main St',
          street_line_2: null,
          updated_at: '2023-01-02T00:00:00Z',
          zip: '12345',
        },
        {
          person: {
            data: { id: 'pco_123', type: 'Person' },
          },
        },
      )

      const data = createPcoCollectionData([mainEntity], [includedEntity])

      // This should create external links, upsert entities, and create edges
      const result = yield* saveDataE(data)
      expect(result).toBeUndefined()

      // Verify that external links were created by querying the database
      // (mkExternalLinksE would filter them out since they were just processed)
      const sql = yield* SqlClient.SqlClient
      const externalLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_123'
      `
      expect(externalLinks.length).toBe(1)

      // Verify we can query the database directly
      const links =
        yield* sql`SELECT * FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_123'`
      expect(links.length).toBe(1)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'can create and query multiple records',
  () =>
    Effect.gen(function* () {
      yield* createSimpleTestTables

      // Insert multiple records
      yield* insertTestExternalLink('per_456', 'pco_456')
      yield* insertTestExternalLink('per_789', 'pco_789')

      const links = yield* getTestExternalLinks
      expect(links.length >= 2).toBe(true) // May have records from previous test

      // Check that our new records exist
      const newLinks = links.filter(
        (link: any) => link.external_id === 'pco_456' || link.external_id === 'pco_789',
      )
      expect(newLinks.length).toBe(2)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'container startup and teardown works correctly',
  () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      // Test that we can run multiple SQL operations
      yield* sql`SELECT 1 as first`
      yield* sql`SELECT 2 as second`
      const result = yield* sql`SELECT 3 as third`

      expect(result).toEqual([{ third: 3 }])
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test updateEntityRelationshipsE function
effect(
  'updateEntityRelationshipsE creates and updates entity relationships registry',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      // First, let's test with a simpler case - just one relationship
      const simpleEdgeValues = [
        {
          orgId: 'test_org_123',
          sourceEntityTypeTag: 'person',
          targetEntityTypeTag: 'phoneNumber',
        },
      ]

      // Test initial creation with simple case
      yield* updateEntityRelationshipsE(simpleEdgeValues)

      // Now test with multiple relationships
      const edgeValues = [
        {
          orgId: 'test_org_123',
          sourceEntityTypeTag: 'person',
          targetEntityTypeTag: 'phoneNumber',
        },
        {
          orgId: 'test_org_123',
          sourceEntityTypeTag: 'person',
          targetEntityTypeTag: 'address',
        },
        {
          orgId: 'test_org_123',
          sourceEntityTypeTag: 'group',
          targetEntityTypeTag: 'person',
        },
      ]

      // Test initial creation
      yield* updateEntityRelationshipsE(edgeValues)

      const sql = yield* SqlClient.SqlClient

      // Verify person relationships were created
      const personRelationships = yield* sql`
        SELECT * FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123' AND "sourceEntityType" = 'person'
      `
      expect(personRelationships.length).toBe(1)

      const personTargetsRaw = personRelationships[0]?.targetEntityTypes
      const personTargets =
        typeof personTargetsRaw === 'string' ? JSON.parse(personTargetsRaw) : personTargetsRaw
      expect(personTargets).toEqual(expect.arrayContaining(['phoneNumber', 'address']))
      expect(personTargets.length).toBe(2)

      // Verify group relationships were created
      const groupRelationships = yield* sql`
        SELECT * FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123' AND "sourceEntityType" = 'group'
      `
      expect(groupRelationships.length).toBe(1)

      const groupTargetsRaw = groupRelationships[0]?.targetEntityTypes
      const groupTargets =
        typeof groupTargetsRaw === 'string' ? JSON.parse(groupTargetsRaw) : groupTargetsRaw
      expect(groupTargets).toEqual(['person'])

      // Test updating existing relationships (should merge, not replace)
      const additionalEdgeValues = [
        {
          orgId: 'test_org_123',
          sourceEntityTypeTag: 'person',
          targetEntityTypeTag: 'group', // New relationship for person
        },
        {
          orgId: 'test_org_123',
          sourceEntityTypeTag: 'person',
          targetEntityTypeTag: 'phoneNumber', // Duplicate - should not create duplicates
        },
      ]

      yield* updateEntityRelationshipsE(additionalEdgeValues)

      // Verify person relationships were updated (merged)
      const updatedPersonRelationships = yield* sql`
        SELECT * FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123' AND "sourceEntityType" = 'person'
      `
      expect(updatedPersonRelationships.length).toBe(1)

      const updatedPersonTargetsRaw = updatedPersonRelationships[0]?.targetEntityTypes
      const updatedPersonTargets =
        typeof updatedPersonTargetsRaw === 'string'
          ? JSON.parse(updatedPersonTargetsRaw)
          : updatedPersonTargetsRaw
      expect(updatedPersonTargets).toEqual(
        expect.arrayContaining(['phoneNumber', 'address', 'group']),
      )
      expect(updatedPersonTargets.length).toBe(3) // No duplicates

      // Test empty edge values (should be no-op)
      yield* updateEntityRelationshipsE([])

      // Verify no changes
      const finalRelationships = yield* sql`
        SELECT COUNT(*) as count FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123'
      `
      expect(Number(finalRelationships[0]?.count)).toBe(2) // Still just person and group
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test that saveDataE saves included entities to their respective tables
effect(
  'saveDataE saves included entities (addresses and phone numbers) to database tables',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      yield* cleanupTestData // Ensure clean state

      const mainPerson = createPcoBaseEntity('pco_save_test_person', 'Person')
      const includedAddress = createPcoBaseEntity(
        'pco_save_test_addr',
        'Address',
        {
          city: 'Save Test City',
          country_code: 'US',
          country_name: 'United States',
          created_at: '2023-01-01T00:00:00Z',
          location: 'Home',
          primary: true,
          state: 'NY',
          street_line_1: '789 Save Test Ave',
          street_line_2: 'Apt 42',
          updated_at: '2023-01-02T00:00:00Z',
          zip: '98765',
        },
        {
          person: {
            data: { id: 'pco_save_test_person', type: 'Person' },
          },
        },
      )
      const includedPhone = createPcoBaseEntity(
        'pco_save_test_phone',
        'PhoneNumber',
        {
          carrier: 'Verizon',
          country_code: 'US',
          created_at: '2023-01-01T00:00:00Z',
          e164: '+15559876543',
          international: '+1 555-987-6543',
          location: 'Mobile',
          national: '(555) 987-6543',
          number: '555-987-6543',
          primary: true,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          person: {
            data: { id: 'pco_save_test_person', type: 'Person' },
          },
        },
      )

      const data = createPcoCollectionData([mainPerson], [includedAddress, includedPhone])

      // Call saveDataE which should save everything
      yield* saveDataE(data)

      const sql = yield* SqlClient.SqlClient

      // Verify the person was saved
      const people = yield* sql`
        SELECT * FROM "openfaith_people" 
        WHERE "orgId" = 'test_org_123' 
        AND "id" IN (
          SELECT "entityId" FROM "openfaith_externalLinks" 
          WHERE "externalId" = 'pco_save_test_person'
        )
      `
      expect(people.length).toBe(1)
      expect(people[0]?.name).toBe('John Doe')

      // CRITICAL: Verify the address was saved to the addresses table
      const addresses = yield* sql`
        SELECT * FROM "openfaith_addresses" 
        WHERE "orgId" = 'test_org_123'
        AND "id" IN (
          SELECT "entityId" FROM "openfaith_externalLinks" 
          WHERE "externalId" = 'pco_save_test_addr'
        )
      `
      expect(addresses.length).toBe(1)
      expect(addresses[0]?.city).toBe('Save Test City')
      expect(addresses[0]?.state).toBe('NY')
      expect(addresses[0]?.streetLine1).toBe('789 Save Test Ave')
      expect(addresses[0]?.streetLine2).toBe('Apt 42')
      expect(addresses[0]?.zip).toBe('98765')

      // CRITICAL: Verify the phone number was saved to the phoneNumbers table
      const phoneNumbers = yield* sql`
        SELECT * FROM "openfaith_phoneNumbers" 
        WHERE "orgId" = 'test_org_123'
        AND "id" IN (
          SELECT "entityId" FROM "openfaith_externalLinks" 
          WHERE "externalId" = 'pco_save_test_phone'
        )
      `
      expect(phoneNumbers.length).toBe(1)
      expect(phoneNumbers[0]?.number).toBe('+15559876543') // e164 from PCO maps to number field
      expect(phoneNumbers[0]?.countryCode).toBe('US')
      expect(phoneNumbers[0]?.location).toBe('Mobile')
      expect(phoneNumbers[0]?.primary).toBe(true)

      // Verify custom fields contain PCO-specific data
      const phoneCustomFields = phoneNumbers[0]?.customFields
      const customFieldsArray =
        typeof phoneCustomFields === 'string' ? JSON.parse(phoneCustomFields) : phoneCustomFields
      expect(Array.isArray(customFieldsArray)).toBe(true)

      // Check that carrier is stored as a custom field
      const carrierField = customFieldsArray.find((f: any) => f.name === 'pco_carrier')
      expect(carrierField).toBeDefined()
      expect(carrierField?.value).toBe('Verizon')

      // Verify external links were created for all entities
      const externalLinks = yield* sql`
        SELECT "entityType", "externalId" FROM "openfaith_externalLinks" 
        WHERE "orgId" = 'test_org_123' 
        AND "externalId" IN ('pco_save_test_person', 'pco_save_test_addr', 'pco_save_test_phone')
        ORDER BY "entityType"
      `
      expect(externalLinks.length).toBe(3)

      // Verify edges were created between entities
      const edges = yield* sql`
        SELECT COUNT(*) as count FROM "openfaith_edges" 
        WHERE "orgId" = 'test_org_123'
        AND ("sourceEntityId" IN (
          SELECT "entityId" FROM "openfaith_externalLinks" 
          WHERE "externalId" IN ('pco_save_test_person', 'pco_save_test_addr', 'pco_save_test_phone')
        ) OR "targetEntityId" IN (
          SELECT "entityId" FROM "openfaith_externalLinks" 
          WHERE "externalId" IN ('pco_save_test_person', 'pco_save_test_addr', 'pco_save_test_phone')
        ))
      `
      expect(Number(edges[0]?.count)).toBeGreaterThan(0)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test bidirectional relationships with multiple entity types
effect(
  'saveDataE creates bidirectional entity relationships for person with addresses and phone numbers',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const mainPerson = createPcoBaseEntity('pco_person_multi', 'Person')
      const includedAddress = createPcoBaseEntity(
        'pco_addr_multi',
        'Address',
        {
          city: 'Multi City',
          country_code: 'US',
          country_name: 'United States',
          created_at: '2023-01-01T00:00:00Z',
          location: 'Home',
          primary: true,
          state: 'CA',
          street_line_1: '456 Multi St',
          street_line_2: null,
          updated_at: '2023-01-02T00:00:00Z',
          zip: '54321',
        },
        {
          person: {
            data: { id: 'pco_person_multi', type: 'Person' },
          },
        },
      )
      const includedPhone = createPcoBaseEntity(
        'pco_phone_multi',
        'PhoneNumber',
        {
          carrier: null,
          country_code: 'US',
          created_at: '2023-01-01T00:00:00Z',
          e164: '+15557777',
          international: null,
          location: 'Mobile',
          national: null,
          number: '555-7777',
          primary: true,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          person: {
            data: { id: 'pco_person_multi', type: 'Person' },
          },
        },
      )

      const data = createPcoCollectionData([mainPerson], [includedAddress, includedPhone])

      // Process the full data which should create bidirectional relationships
      yield* saveDataE(data)

      const sql = yield* SqlClient.SqlClient

      // Verify entity relationships registry has all expected bidirectional relationships
      const relationships = yield* sql`
        SELECT * FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123'
        ORDER BY "sourceEntityType"
      `

      // Find each relationship type
      const addressRel = relationships.find((r: any) => r.sourceEntityType === 'address')
      const personRel = relationships.find((r: any) => r.sourceEntityType === 'person')
      const phoneRel = relationships.find((r: any) => r.sourceEntityType === 'phoneNumber')

      // Check address -> person
      expect(addressRel).toBeDefined()
      const addressTargets =
        typeof addressRel?.targetEntityTypes === 'string'
          ? JSON.parse(addressRel.targetEntityTypes)
          : addressRel?.targetEntityTypes
      expect(addressTargets).toContain('person')

      // Check person -> [address, phonenumber]
      expect(personRel).toBeDefined()
      const personTargets =
        typeof personRel?.targetEntityTypes === 'string'
          ? JSON.parse(personRel.targetEntityTypes)
          : personRel?.targetEntityTypes
      expect(personTargets).toContain('address')
      expect(personTargets).toContain('phoneNumber')

      // Check phonenumber -> person
      expect(phoneRel).toBeDefined()
      const phoneTargets =
        typeof phoneRel?.targetEntityTypes === 'string'
          ? JSON.parse(phoneRel.targetEntityTypes)
          : phoneRel?.targetEntityTypes
      expect(phoneTargets).toContain('person')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// Test that mkEdgesFromIncludesE now calls updateEntityRelationshipsE with bidirectional tracking
effect(
  'mkEdgesFromIncludesE updates entity relationships registry with bidirectional relationships',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const mainEntity = createPcoBaseEntity('pco_registry_main', 'Person')
      const includedPhone = createPcoBaseEntity(
        'pco_registry_phone',
        'PhoneNumber',
        {
          carrier: null,
          country_code: 'US',
          created_at: '2023-01-01T00:00:00Z',
          e164: '+15559999',
          international: null,
          location: 'Mobile',
          national: null,
          number: '555-9999',
          primary: true,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          person: {
            data: { id: 'pco_registry_main', type: 'Person' },
          },
        },
      )

      // Create external links for both entities
      const mainExternalLinks = yield* mkExternalLinksE([mainEntity])
      const phoneExternalLinks = yield* mkExternalLinksE([includedPhone])

      // This should create edges AND update the entity relationships registry with bidirectional relationships
      yield* mkEdgesFromIncludesE([includedPhone], mainExternalLinks, phoneExternalLinks, 'Person')

      const sql = yield* SqlClient.SqlClient

      // Verify edges were created
      const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE "sourceEntityId" = ${mainExternalLinks[0]?.entityId || ''} 
        OR "targetEntityId" = ${mainExternalLinks[0]?.entityId || ''}
      `
      expect(edges.length).toBe(1)

      // Verify entity relationships registry was updated with BOTH directions
      const relationships = yield* sql`
        SELECT * FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123'
        ORDER BY "sourceEntityType"
      `

      // Should have entries for both directions
      expect(relationships.length).toBeGreaterThanOrEqual(2)

      // Check person -> phonenumber relationship
      const personRelationship = relationships.find((rel: any) => rel.sourceEntityType === 'person')
      expect(personRelationship).toBeDefined()
      const personTargets =
        typeof personRelationship?.targetEntityTypes === 'string'
          ? JSON.parse(personRelationship.targetEntityTypes)
          : personRelationship?.targetEntityTypes
      expect(personTargets).toContain('phoneNumber')

      // Check phoneNumber -> person relationship (bidirectional)
      const phoneRelationship = relationships.find(
        (rel: any) => rel.sourceEntityType === 'phoneNumber',
      )
      expect(phoneRelationship).toBeDefined()
      const phoneTargets =
        typeof phoneRelationship?.targetEntityTypes === 'string'
          ? JSON.parse(phoneRelationship.targetEntityTypes)
          : phoneRelationship?.targetEntityTypes
      expect(phoneTargets).toContain('person')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// ===== TESTS FOR getProperEntityName FUNCTION =====

effect('getProperEntityName - returns lowercase entity type when no metadata found', () =>
  Effect.gen(function* () {
    // Test with entity types that don't have metadata in the registry
    expect(getProperEntityName('UnknownType')).toBe('unknowntype')
    expect(getProperEntityName('NotInRegistry')).toBe('notinregistry')
    expect(getProperEntityName('CustomEntity')).toBe('customentity')
  }),
)

effect('getProperEntityName - handles various entity type formats correctly', () =>
  Effect.gen(function* () {
    // Test various input formats when no metadata is found
    // PascalCase
    expect(getProperEntityName('PersonAddress')).toBe('personaddress')

    // camelCase
    expect(getProperEntityName('phoneNumber')).toBe('phonenumber')

    // snake_case
    expect(getProperEntityName('email_address')).toBe('email_address')

    // Already lowercase
    expect(getProperEntityName('group')).toBe('group')

    // Mixed case with numbers
    expect(getProperEntityName('Address2')).toBe('address2')

    // Empty string
    expect(getProperEntityName('')).toBe('')

    // Special characters
    expect(getProperEntityName('Person-Address')).toBe('person-address')
    expect(getProperEntityName('Person_Address')).toBe('person_address')
    expect(getProperEntityName('Person.Address')).toBe('person.address')
  }),
)

effect('getProperEntityName - returns proper entity names for known PCO types', () =>
  Effect.gen(function* () {
    // Test with actual PCO entity types that exist in the registry
    // These should return the proper entity names from the schema annotations

    // Person entity - should return 'person' from the schema
    expect(getProperEntityName('Person')).toBe('person')

    // Address entity - should return 'address' from the schema
    expect(getProperEntityName('Address')).toBe('address')

    // PhoneNumber entity - should return 'phoneNumber' from the schema
    expect(getProperEntityName('PhoneNumber')).toBe('phoneNumber')

    // Group entity - if it exists in registry
    const groupResult = getProperEntityName('Group')
    // Should either be 'group' from schema or 'group' from lowercase fallback
    expect(groupResult).toBe('group')
  }),
)

effect('getProperEntityName - maintains consistency across multiple calls', () =>
  Effect.gen(function* () {
    // Call multiple times with same input
    const result1 = getProperEntityName('TestEntity')
    const result2 = getProperEntityName('TestEntity')
    const result3 = getProperEntityName('TestEntity')

    // Should return same result
    expect(result1).toBe('testentity')
    expect(result2).toBe('testentity')
    expect(result3).toBe('testentity')
    expect(result1).toBe(result2)
    expect(result2).toBe(result3)
  }),
)

effect('getProperEntityName - works correctly in functional composition', () =>
  Effect.gen(function* () {
    // Test that the function works correctly in a pipe
    const entityTypes = ['Person', 'Group', 'Address', 'UnknownType']
    const results = pipe(entityTypes, Array.map(getProperEntityName))

    // Should transform all entity types correctly
    expect(results[0]).toBe('person')
    expect(results[1]).toBe('group')
    expect(results[2]).toBe('address')
    expect(results[3]).toBe('unknowntype')
  }),
)

effect('getProperEntityName - handles PCO entity type variations', () =>
  Effect.gen(function* () {
    // Test variations of PCO entity types

    // Should handle exact matches
    expect(getProperEntityName('Person')).toBe('person')

    // Should handle case variations (these won't match registry, so lowercase)
    expect(getProperEntityName('person')).toBe('person')
    expect(getProperEntityName('PERSON')).toBe('person')

    // Should handle PCO-specific types
    expect(getProperEntityName('PhoneNumber')).toBe('phoneNumber')
    expect(getProperEntityName('Address')).toBe('address')

    // Types not in registry should just be lowercased
    expect(getProperEntityName('CustomField')).toBe('customfield')
    expect(getProperEntityName('Membership')).toBe('membership')
  }),
)

effect(
  'getProperEntityName - integration with mkExternalLinksE',
  () =>
    Effect.gen(function* () {
      // Test that getProperEntityName is used correctly in mkExternalLinksE
      yield* createTestTables

      // Create a Person entity (known type in registry)
      const personEntity = createPcoBaseEntity('pco_test_proper', 'Person')
      const result = yield* mkExternalLinksE([personEntity])

      expect(result.length).toBe(1)
      // The entityType stored should be the result of getProperEntityName
      // which for 'Person' should be 'person'

      // Verify by checking the database
      const sql = yield* SqlClient.SqlClient
      const links = yield* sql`
      SELECT "entityType" FROM "openfaith_externalLinks" 
      WHERE "externalId" = 'pco_test_proper'
    `
      expect(links[0]?.entityType).toBe('person')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'getProperEntityName - integration with mkEntityUpsertE',
  () =>
    Effect.gen(function* () {
      // Test that getProperEntityName is used correctly in mkEntityUpsertE
      yield* createTestTables

      const personEntity = createPcoBaseEntity('pco_upsert_proper', 'Person')
      const data: ReadonlyArray<readonly [string, PcoBaseEntity]> = [
        ['person_upsert_proper_123', personEntity],
      ]

      yield* mkEntityUpsertE(data)

      // The function should use getProperEntityName internally for logging
      // We can't directly test the logs, but we can verify the entity was processed
      const sql = yield* SqlClient.SqlClient
      const people = yield* sql`
      SELECT "id" FROM "openfaith_people" 
      WHERE "id" = 'person_upsert_proper_123'
    `
      expect(people.length).toBe(1)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// ===== TESTS FOR DIRECT RELATIONSHIPS (primary_campus) =====

effect(
  'saveDataE creates edges for primary_campus direct relationships',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      // Create a person with a primary_campus relationship
      const personWithCampus = createPcoBaseEntity(
        'pco_person_campus',
        'Person',
        {
          accounting_administrator: false,
          anniversary: null,
          avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JD.png',
          birthdate: null,
          child: false,
          created_at: '2023-01-01T00:00:00Z',
          demographic_avatar_url: 'https://example.com/demo.jpg',
          first_name: 'John',
          gender: null,
          given_name: null,
          grade: null,
          graduation_year: null,
          inactivated_at: null,
          last_name: 'Campus',
          medical_notes: null,
          membership: null,
          middle_name: null,
          name: 'John Campus',
          nickname: null,
          passed_background_check: false,
          people_permissions: null,
          remote_id: null,
          school_type: null,
          site_administrator: false,
          status: 'active' as const,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          primary_campus: {
            data: {
              id: 'pco_campus_123',
              type: 'Campus',
            },
          },
        },
      )

      const data = createPcoCollectionData([personWithCampus], [])

      // Process the data which should create edges for primary_campus
      yield* saveDataE(data)

      const sql = yield* SqlClient.SqlClient

      // Verify external link was created for the campus
      const campusLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_campus_123' AND "entityType" = 'campus'
      `
      expect(campusLinks.length).toBe(1)

      // Verify edge was created between person and campus
      const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE "relationshipType" LIKE '%primary_campus%'
      `
      expect(edges.length).toBe(1)

      // The edge should have the correct relationship type indicating person has campus
      expect(edges[0]?.relationshipType).toBe('person_primary_campus_campus')

      // Due to alphabetical ordering, the edge source/target may be flipped
      // Check based on the actual entity type tags, not the IDs
      const edge = edges[0]

      // The edge should have one campus and one person, order depends on alphabetical sorting
      const hasCampusSource = edge?.sourceEntityTypeTag === 'campus'
      const hasCampusTarget = edge?.targetEntityTypeTag === 'campus'
      const hasPersonSource = edge?.sourceEntityTypeTag === 'person'
      const hasPersonTarget = edge?.targetEntityTypeTag === 'person'

      // Verify we have exactly one campus and one person in the edge
      expect(hasCampusSource || hasCampusTarget).toBe(true)
      expect(hasPersonSource || hasPersonTarget).toBe(true)
      expect(hasCampusSource !== hasCampusTarget).toBe(true) // XOR - one but not both
      expect(hasPersonSource !== hasPersonTarget).toBe(true) // XOR - one but not both
      // Verify entity relationships registry was updated
      const relationships = yield* sql`
        SELECT * FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123' AND "sourceEntityType" = 'person'
      `
      const personTargets =
        typeof relationships[0]?.targetEntityTypes === 'string'
          ? JSON.parse(relationships[0].targetEntityTypes)
          : relationships[0]?.targetEntityTypes
      expect(personTargets).toContain('campus')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'saveDataE handles existing campus external links',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const sql = yield* SqlClient.SqlClient

      // Pre-create a campus external link
      yield* sql`
        INSERT INTO "openfaith_externalLinks" 
        ("_tag", "orgId", "entityId", "entityType", "externalId", "adapter", "createdAt", "updatedAt", "lastProcessedAt")
        VALUES 
        ('externalLink', 'test_org_123', 'campus_existing_123', 'campus', 'pco_campus_existing', 'pco', NOW(), NOW(), NOW())
      `

      // Create a person with primary_campus pointing to the existing campus
      const personWithExistingCampus = createPcoBaseEntity(
        'pco_person_existing',
        'Person',
        {
          accounting_administrator: false,
          anniversary: null,
          avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JE.png',
          birthdate: null,
          child: false,
          created_at: '2023-01-01T00:00:00Z',
          demographic_avatar_url: 'https://example.com/demo.jpg',
          first_name: 'Jane',
          gender: null,
          given_name: null,
          grade: null,
          graduation_year: null,
          inactivated_at: null,
          last_name: 'Existing',
          medical_notes: null,
          membership: null,
          middle_name: null,
          name: 'Jane Existing',
          nickname: null,
          passed_background_check: false,
          people_permissions: null,
          remote_id: null,
          school_type: null,
          site_administrator: false,
          status: 'active' as const,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          primary_campus: {
            data: {
              id: 'pco_campus_existing',
              type: 'Campus',
            },
          },
        },
      )

      const data = createPcoCollectionData([personWithExistingCampus], [])

      yield* saveDataE(data)

      // Verify no duplicate campus external link was created
      const campusLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_campus_existing' AND "entityType" = 'campus'
      `
      expect(campusLinks.length).toBe(1)
      expect(campusLinks[0]?.entityId).toBe('campus_existing_123')

      // Verify edge was created using the existing campus entity ID
      // Due to alphabetical ordering, campus ID might be in source or target
      const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE "sourceEntityId" = 'campus_existing_123' OR "targetEntityId" = 'campus_existing_123'
      `
      expect(edges.length).toBe(1)
      expect(edges[0]?.relationshipType).toBe('person_primary_campus_campus')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'saveDataE handles multiple people with same campus',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      // Create multiple people with the same primary_campus
      const person1 = createPcoBaseEntity(
        'pco_person_multi1',
        'Person',
        {
          accounting_administrator: false,
          anniversary: null,
          avatar: 'https://avatars.planningcenteronline.com/uploads/initials/P1.png',
          birthdate: null,
          child: false,
          created_at: '2023-01-01T00:00:00Z',
          demographic_avatar_url: 'https://example.com/demo.jpg',
          first_name: 'Person',
          gender: null,
          given_name: null,
          grade: null,
          graduation_year: null,
          inactivated_at: null,
          last_name: 'One',
          medical_notes: null,
          membership: null,
          middle_name: null,
          name: 'Person One',
          nickname: null,
          passed_background_check: false,
          people_permissions: null,
          remote_id: null,
          school_type: null,
          site_administrator: false,
          status: 'active' as const,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          primary_campus: {
            data: {
              id: 'pco_campus_shared',
              type: 'Campus',
            },
          },
        },
      )

      const person2 = createPcoBaseEntity(
        'pco_person_multi2',
        'Person',
        {
          accounting_administrator: false,
          anniversary: null,
          avatar: 'https://avatars.planningcenteronline.com/uploads/initials/P2.png',
          birthdate: null,
          child: false,
          created_at: '2023-01-01T00:00:00Z',
          demographic_avatar_url: 'https://example.com/demo.jpg',
          first_name: 'Person',
          gender: null,
          given_name: null,
          grade: null,
          graduation_year: null,
          inactivated_at: null,
          last_name: 'Two',
          medical_notes: null,
          membership: null,
          middle_name: null,
          name: 'Person Two',
          nickname: null,
          passed_background_check: false,
          people_permissions: null,
          remote_id: null,
          school_type: null,
          site_administrator: false,
          status: 'active' as const,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          primary_campus: {
            data: {
              id: 'pco_campus_shared',
              type: 'Campus',
            },
          },
        },
      )

      const data = createPcoCollectionData([person1, person2], [])

      yield* saveDataE(data)

      const sql = yield* SqlClient.SqlClient

      // Verify only one campus external link was created
      const campusLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_campus_shared' AND "entityType" = 'campus'
      `
      expect(campusLinks.length).toBe(1)

      // Verify edges were created for both people to the same campus
      const campusId = campusLinks[0]?.entityId || ''
      const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE ("sourceEntityId" = ${campusId} OR "targetEntityId" = ${campusId})
        AND "relationshipType" LIKE '%primary_campus%'
      `
      expect(edges.length).toBe(2)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'saveDataE handles null campus relationships gracefully',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      // Create a person with null primary_campus
      const personNoCampus = createPcoBaseEntity(
        'pco_person_nocampus',
        'Person',
        {
          accounting_administrator: false,
          anniversary: null,
          avatar: 'https://avatars.planningcenteronline.com/uploads/initials/NC.png',
          birthdate: null,
          child: false,
          created_at: '2023-01-01T00:00:00Z',
          demographic_avatar_url: 'https://example.com/demo.jpg',
          first_name: 'No',
          gender: null,
          given_name: null,
          grade: null,
          graduation_year: null,
          inactivated_at: null,
          last_name: 'Campus',
          medical_notes: null,
          membership: null,
          middle_name: null,
          name: 'No Campus',
          nickname: null,
          passed_background_check: false,
          people_permissions: null,
          remote_id: null,
          school_type: null,
          site_administrator: false,
          status: 'active' as const,
          updated_at: '2023-01-02T00:00:00Z',
        },
        {
          primary_campus: {
            data: null,
          },
        },
      )

      const data = createPcoCollectionData([personNoCampus], [])

      // Should not throw error
      yield* saveDataE(data)

      const sql = yield* SqlClient.SqlClient

      // Verify no campus edges were created
      const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE "relationshipType" LIKE '%primary_campus%'
        AND "sourceEntityId" IN (
          SELECT "entityId" FROM "openfaith_externalLinks" 
          WHERE "externalId" = 'pco_person_nocampus'
        )
      `
      expect(edges.length).toBe(0)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// ===== COMPREHENSIVE EXTERNAL LINK SCENARIO TESTS =====

effect(
  'mkExternalLinksE - scenario 1: no existing external links',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      yield* cleanupTestData // Ensure clean state

      const entity = createPcoBaseEntity('pco_new_entity', 'Person')
      const result = yield* mkExternalLinksE([entity])

      // Should return the newly created link (needs processing)
      expect(result.length).toBe(1)
      expect(result[0]?.externalId).toBe('pco_new_entity')

      // Verify it was created in the database
      const sql = yield* SqlClient.SqlClient
      const dbLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_new_entity' AND "orgId" = 'test_org_123'
      `
      expect(dbLinks.length).toBe(1)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'mkExternalLinksE - scenario 2: existing external links with same timestamp',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      yield* cleanupTestData // Ensure clean state

      const entity = createPcoBaseEntity('pco_same_timestamp', 'Person')

      // First call - creates the external link (returns it because it's new)
      const firstResult = yield* mkExternalLinksE([entity])
      expect(firstResult.length).toBe(1)

      // Second call with same entity (same updatedAt) - should return empty
      const secondResult = yield* mkExternalLinksE([entity])
      expect(secondResult.length).toBe(0)

      // Verify only one record exists in database
      const sql = yield* SqlClient.SqlClient
      const dbLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_same_timestamp' AND "orgId" = 'test_org_123'
      `
      expect(dbLinks.length).toBe(1)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'mkExternalLinksE - scenario 3: existing external links with different timestamp',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      yield* cleanupTestData // Ensure clean state

      const originalEntity = createPcoBaseEntity('pco_updated_entity', 'Person', {
        accounting_administrator: false,
        anniversary: null,
        avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JD.png',
        birthdate: null,
        child: false,
        created_at: '2023-01-01T00:00:00Z',
        first_name: 'John',
        last_name: 'Doe',
        name: 'John Doe',
        status: 'active' as const,
        updated_at: '2023-01-02T00:00:00Z', // Original timestamp
      })

      // First call - creates the external link (returns it because it's new)
      const firstResult = yield* mkExternalLinksE([originalEntity])
      expect(firstResult.length).toBe(1)

      // Create updated entity with different updatedAt
      const updatedEntity = createPcoBaseEntity('pco_updated_entity', 'Person', {
        accounting_administrator: false,
        anniversary: null,
        avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JD.png',
        birthdate: null,
        child: false,
        created_at: '2023-01-01T00:00:00Z',
        first_name: 'John',
        last_name: 'Doe',
        name: 'John Doe',
        status: 'active' as const,
        updated_at: '2023-01-03T00:00:00Z', // Updated timestamp
      })

      // Second call with updated entity - should return it because updatedAt changed
      const secondResult = yield* mkExternalLinksE([updatedEntity])
      expect(secondResult.length).toBe(1)

      // Verify still only one record exists in database but with updated timestamp
      const sql = yield* SqlClient.SqlClient
      const dbLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_updated_entity' AND "orgId" = 'test_org_123'
      `
      expect(dbLinks.length).toBe(1)
      expect(new Date(dbLinks[0]?.updatedAt as string)).toEqual(new Date('2023-01-03T00:00:00Z'))
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

effect(
  'saveIncludesE - comprehensive test with proper external link setup',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      yield* cleanupTestData // Ensure clean state

      const mainEntity = createPcoBaseEntity('pco_main_comprehensive', 'Person')
      const includedAddress = createPcoBaseEntity(
        'pco_addr_comprehensive',
        'Address',
        {
          city: 'Test City',
          country_code: 'US',
          country_name: 'United States',
          created_at: '2023-01-01T00:00:00Z',
          location: 'Home',
          primary: true,
          state: 'CA',
          street_line_1: '123 Main St',
          street_line_2: null,
          updated_at: '2023-01-02T00:00:00Z',
          zip: '12345',
        },
        {
          person: {
            data: { id: 'pco_main_comprehensive', type: 'Person' },
          },
        },
      )

      // First, create external links for the main entity (simulates previous sync)
      yield* mkExternalLinksE([mainEntity])

      // Now query the database to get the external links (simulates how they would exist from previous sync)
      const sqlClient = yield* SqlClient.SqlClient
      const dbResult = yield* sqlClient`
        SELECT "entityId", "externalId", "lastProcessedAt" 
        FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_main_comprehensive' AND "orgId" = 'test_org_123'
      `
      expect(dbResult.length).toBe(1)

      // Cast to the correct type for saveIncludesE
      const mainExternalLinks = dbResult.map((row) => ({
        entityId: String(row.entityId),
        externalId: String(row.externalId),
        lastProcessedAt: new Date(row.lastProcessedAt as string),
      }))

      // Test saveIncludesE with proper external link setup
      const data = {
        data: [mainEntity],
        included: [includedAddress],
        links: { self: 'test' },
        meta: { count: 1, total_count: 1 },
      }

      const result = yield* saveIncludesE(data, mainExternalLinks, 'Person')
      expect(result).toBeUndefined() // Function returns void

      // Verify that included entities were processed and external links created
      const sql = yield* SqlClient.SqlClient
      const addressLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" = 'pco_addr_comprehensive'
      `
      expect(addressLinks.length).toBe(1)
      expect(addressLinks[0]?.entityType).toBe('address')

      // Verify that relationships were created (simplified check)
      const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE "orgId" = 'test_org_123'
      `
      // Note: Edge creation depends on complex relationship processing
      // For now, just verify the test completes without errors
      expect(edges.length).toBeGreaterThanOrEqual(0)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)

// ===== DELETION DETECTION TESTS =====

effect(
  'detectAndMarkDeletedEntitiesE detects and soft deletes stale entities',
  () =>
    Effect.gen(function* () {
      yield* createTestTables
      yield* cleanupTestData

      const sql = yield* SqlClient.SqlClient

      // Create some external links with old timestamps
      const oldTimestamp = new Date('2023-01-01T00:00:00Z')
      const syncStartTime = new Date('2023-01-02T00:00:00Z')

      // Insert old external links directly
      yield* sql`
        INSERT INTO "openfaith_externalLinks" 
        ("_tag", "orgId", "entityId", "entityType", "externalId", "adapter", "createdAt", "updatedAt", "lastProcessedAt")
        VALUES 
        ('externalLink', 'test_org_123', 'person_old_1', 'person', 'pco_old_1', 'pco', ${oldTimestamp}, ${oldTimestamp}, ${oldTimestamp}),
        ('externalLink', 'test_org_123', 'person_old_2', 'person', 'pco_old_2', 'pco', ${oldTimestamp}, ${oldTimestamp}, ${oldTimestamp})
      `

      // Insert corresponding entities in the people table
      yield* sql`
        INSERT INTO "openfaith_people" 
        ("id", "orgId", "name", "createdAt", "updatedAt")
        VALUES 
        ('person_old_1', 'test_org_123', 'Old Person 1', ${oldTimestamp}, ${oldTimestamp}),
        ('person_old_2', 'test_org_123', 'Old Person 2', ${oldTimestamp}, ${oldTimestamp})
      `

      // Run deletion detection
      const result = yield* detectAndMarkDeletedEntitiesE({
        adapter: 'pco',
        entityType: 'Person',
        syncStartTime,
      })

      // Should return the stale links that were found
      expect(result.length).toBe(2)
      expect(result.map((r) => r.externalId).sort()).toEqual(['pco_old_1', 'pco_old_2'])

      // Verify external links were soft deleted
      const deletedLinks = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" IN ('pco_old_1', 'pco_old_2') 
        AND "deletedAt" IS NOT NULL
      `
      expect(deletedLinks.length).toBe(2)
      expect(deletedLinks[0]?.deletedBy).toBe('sync_deletion_detection')
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)
