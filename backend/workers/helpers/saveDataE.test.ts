import { expect } from 'bun:test'
import { SqlClient } from '@effect/sql'
import * as Pg from '@effect/sql-drizzle/Pg'
import { AdapterTokenError } from '@openfaith/adapter-core/errors/adapterErrors'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { TokenKey } from '@openfaith/adapter-core/server'
import { effect } from '@openfaith/bun-test'
import type { PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import {
  mkEdgesFromIncludesE,
  mkEntityUpsertE,
  mkExternalLinksE,
  saveDataE,
  saveIncludesE,
  updateEntityRelationshipsE,
} from '@openfaith/workers/helpers/saveDataE'
import { createTestTables } from '@openfaith/workers/helpers/test-utils/test-schema'
import { PgContainer } from '@openfaith/workers/helpers/test-utils/utils-pg'
import { Effect, Layer, Option, Stream } from 'effect'

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
    fetchToken: () =>
      Effect.fail(
        new AdapterTokenError({
          adapter: 'test',
          message: 'Not implemented in tests',
        }),
      ),
    getAdapterTag: () => 'test',
    getEntityManifest: () => ({}),
    listEntityData: () => Stream.empty,
    processEntityData: () => Effect.succeed(undefined),
    syncEntityData: () => Effect.succeed([]),
    transformEntityData: (_entityName: string, data: unknown) => Effect.succeed(data),
  }),
)

// Database layer with container
const DrizzlePgLive = Pg.layer.pipe(Layer.provideMerge(PgContainer.ClientLive))

// Combined test layer
const TestLayer = Layer.mergeAll(DrizzlePgLive, TestTokenKey, TestAdapterOperations)

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
      const mainExternalLinks = yield* mkExternalLinksE([mainEntity])
      expect(mainExternalLinks.length).toBe(1)

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
effect('mkEdgesFromIncludesE creates edges for relationships', () =>
  Effect.gen(function* () {
    yield* createTestTables

    const mainEntity = createPcoBaseEntity('pco_edge_main', 'Person')
    const includedPhone = createPcoBaseEntity(
      'pco_phone_123',
      'PhoneNumber',
      {
        created_at: '2023-01-01T00:00:00Z',
        location: 'Mobile',
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
    const mainExternalLinks = yield* mkExternalLinksE([mainEntity])
    const phoneExternalLinks = yield* mkExternalLinksE([includedPhone])

    expect(mainExternalLinks.length).toBe(1)
    expect(phoneExternalLinks.length).toBe(1)

    // Test mkEdgesFromIncludesE directly
    const result = yield* mkEdgesFromIncludesE(
      [includedPhone],
      mainExternalLinks,
      phoneExternalLinks,
      'Person',
    )
    expect(result).toBeUndefined() // Function returns void

    // Verify that edges were created
    const sql = yield* SqlClient.SqlClient
    const edges =
      yield* sql`SELECT * FROM "openfaith_edges" WHERE "relationshipType" LIKE '%person%phone%'`
    expect(edges.length).toBe(1)
    expect(edges[0]?.sourceEntityTypeTag).toBe('person')
    expect(edges[0]?.targetEntityTypeTag).toBe('phonenumber')
  }).pipe(
    Effect.provide(TestLayer),
    Effect.catchTag('ContainerError', (error) => {
      console.log('Container test skipped due to error:', error.cause)
      return Effect.void
    }),
  ),
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

// Test entities without updated_at field
effect(
  'mkExternalLinksE handles entities without updated_at',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

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

      expect(result.length).toBe(1)
      expect(result[0]?.externalId).toBe('pco_no_update')
      // Should use current date as fallback for updatedAt
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

      // Verify that external links were created by running mkExternalLinksE again
      const externalLinks = yield* mkExternalLinksE([mainEntity])
      expect(externalLinks.length).toBe(1)
      expect(externalLinks[0]?.externalId).toBe('pco_123')

      // Verify we can query the database directly
      const sql = yield* SqlClient.SqlClient
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
          targetEntityTypeTag: 'phonenumber',
        },
      ]

      // Test initial creation with simple case
      yield* updateEntityRelationshipsE(simpleEdgeValues)

      // Now test with multiple relationships
      const edgeValues = [
        {
          orgId: 'test_org_123',
          sourceEntityTypeTag: 'person',
          targetEntityTypeTag: 'phonenumber',
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
      expect(personTargets).toEqual(expect.arrayContaining(['phonenumber', 'address']))
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
          targetEntityTypeTag: 'phonenumber', // Duplicate - should not create duplicates
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
        expect.arrayContaining(['phonenumber', 'address', 'group']),
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

// Test that mkEdgesFromIncludesE now calls updateEntityRelationshipsE
effect(
  'mkEdgesFromIncludesE updates entity relationships registry after creating edges',
  () =>
    Effect.gen(function* () {
      yield* createTestTables

      const mainEntity = createPcoBaseEntity('pco_registry_main', 'Person')
      const includedPhone = createPcoBaseEntity(
        'pco_registry_phone',
        'PhoneNumber',
        {
          created_at: '2023-01-01T00:00:00Z',
          location: 'Mobile',
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

      // This should create edges AND update the entity relationships registry
      yield* mkEdgesFromIncludesE([includedPhone], mainExternalLinks, phoneExternalLinks, 'Person')

      const sql = yield* SqlClient.SqlClient

      // Verify edges were created
      const edges = yield* sql`
        SELECT * FROM "openfaith_edges" 
        WHERE "sourceEntityId" = ${mainExternalLinks[0]?.entityId || ''} 
        OR "targetEntityId" = ${mainExternalLinks[0]?.entityId || ''}
      `
      expect(edges.length).toBe(1)

      // Verify entity relationships registry was updated
      const relationships = yield* sql`
        SELECT * FROM "openfaith_entityRelationships" 
        WHERE "orgId" = 'test_org_123'
      `
      expect(relationships.length).toBeGreaterThan(0)

      // Should have a relationship entry for the source entity type
      const hasPersonRelationship = relationships.some((rel: any) => {
        const targets =
          typeof rel.targetEntityTypes === 'string'
            ? JSON.parse(rel.targetEntityTypes)
            : rel.targetEntityTypes
        return rel.sourceEntityType === 'person' && targets.includes('phonenumber')
      })
      expect(hasPersonRelationship).toBe(true)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.catchTag('ContainerError', (error) => {
        console.log('Container test skipped due to error:', error.cause)
        return Effect.void
      }),
    ),
  { timeout: 120000 },
)
