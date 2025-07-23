import { expect } from 'bun:test'
import { SqlClient } from '@effect/sql'
import * as Pg from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import { effect } from '@openfaith/bun-test'
import type { PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import { mkEntityUpsertE, mkExternalLinksE, saveDataE } from '@openfaith/workers/helpers/saveDataE'
import { createTestTables } from '@openfaith/workers/helpers/test-utils/test-schema'
import { PgContainer } from '@openfaith/workers/helpers/test-utils/utils-pg'
import { Effect, Layer } from 'effect'

// Test TokenKey service
const TestTokenKey = Layer.succeed(TokenKey, 'test_org_123')

// Database layer with container
const DrizzlePgLive = Pg.layer.pipe(Layer.provideMerge(PgContainer.ClientLive))

// Combined test layer
const TestLayer = Layer.mergeAll(DrizzlePgLive, TestTokenKey)

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
  { timeout: 10000 },
)

// Real saveDataE function tests
effect('creates external links for valid data', () =>
  Effect.gen(function* () {
    // First create the database schema
    yield* createTestTables

    const data = [createPcoBaseEntity()]
    const result = yield* mkExternalLinksE(data)

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
)

effect('returns empty array for empty data', () =>
  Effect.gen(function* () {
    yield* createTestTables
    const result = yield* mkExternalLinksE([])
    expect(result).toEqual([])
  }).pipe(
    Effect.provide(TestLayer),
    Effect.catchTag('ContainerError', (error) => {
      console.log('Container test skipped due to error:', error.cause)
      return Effect.void
    }),
  ),
)

effect('upserts entities successfully', () =>
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
)

effect('processes data successfully', () =>
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
)

effect('full workflow with real database operations', () =>
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

    // Verify that external links were created by running mkExternalLinksE again
    const externalLinks = yield* mkExternalLinksE([mainEntity])
    expect(externalLinks.length).toBe(1)
    expect(externalLinks[0]?.externalId).toBe('pco_123')

    // Verify we can query the database directly
    const sql = yield* SqlClient.SqlClient
    const links = yield* sql`SELECT * FROM "openfaith_externalLinks" WHERE "externalId" = 'pco_123'`
    expect(links.length).toBe(1)
  }).pipe(
    Effect.provide(TestLayer),
    Effect.catchTag('ContainerError', (error) => {
      console.log('Container test skipped due to error:', error.cause)
      return Effect.void
    }),
  ),
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
