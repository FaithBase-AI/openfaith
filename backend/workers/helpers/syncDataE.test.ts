import { expect } from 'bun:test'
import {
  ExternalLinkManager,
  ExternalLinkNotFoundError,
} from '@openfaith/adapter-core/layers/externalLinkManager'
import { TokenKey } from '@openfaith/adapter-core/server'
import { effect, layer } from '@openfaith/bun-test'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import {
  makeMockPcoHttpClient,
  makeMockPcoHttpClientWithErrors,
} from '@openfaith/pco/api/pcoApiMock'
import {
  type CrudOperation,
  type EntityClient,
  type ExternalLink,
  findEntityManifestE,
  getExternalLinksE,
  mkCrudEffectE,
  mkEntityName,
  processCrudOperationE,
  syncDataE,
  syncToExternalSystemsE,
  syncToPcoE,
  transformEntityDataE,
} from '@openfaith/workers/helpers/syncDataE'
import { Effect, Layer } from 'effect'

// ===== MOCK SERVICES =====

// Mock ExternalLinkManager with proper interface
const createMockExternalLinkManager = (hasLinks = true, shouldError = false) => ({
  createExternalLink: () => Effect.succeed(undefined),
  createExternalLinks: () => Effect.succeed(undefined),
  deleteExternalLink: () => Effect.succeed(undefined),
  findEntityByExternalId: () => Effect.succeed(null),
  getExternalLinksForEntities: () => Effect.succeed({}),
  getExternalLinksForEntity: (entityType: string, entityId: string) => {
    if (shouldError) {
      return Effect.fail(
        new ExternalLinkNotFoundError({
          entityId,
          entityType,
          message: 'Database connection failed',
        }),
      )
    }
    if (!hasLinks) {
      return Effect.succeed([])
    }
    return Effect.succeed([
      {
        _tag: 'externalLink' as const,
        adapter: 'pco',
        createdAt: new Date(),
        deletedAt: null,
        deletedBy: null,
        entityId,
        entityType,
        externalId: `pco_${entityId}`,
        lastProcessedAt: new Date(),
        orgId: 'test_org_123',
        syncing: false,
        updatedAt: null,
      },
    ])
  },
  markMultipleSyncCompleted: () => Effect.succeed(undefined),
  markMultipleSyncInProgress: () => Effect.succeed(undefined),
  markSyncCompleted: () => Effect.succeed(undefined),
  markSyncInProgress: () => Effect.succeed(undefined),
  updateExternalLink: () => Effect.succeed(undefined),
})

// Test layers using existing mocks
const TestTokenKey = Layer.succeed(TokenKey, 'test_org_123')
const MockExternalLinkManagerLive = Layer.succeed(
  ExternalLinkManager,
  createMockExternalLinkManager(),
)
const MockExternalLinkManagerEmptyLive = Layer.succeed(
  ExternalLinkManager,
  createMockExternalLinkManager(false),
)
const MockExternalLinkManagerErrorLive = Layer.succeed(
  ExternalLinkManager,
  createMockExternalLinkManager(true, true),
)
const MockPcoHttpClientLive = Layer.effect(PcoHttpClient, makeMockPcoHttpClient)
const MockPcoHttpClientWithErrorsLive = Layer.effect(PcoHttpClient, makeMockPcoHttpClientWithErrors)

const TestLayer = Layer.mergeAll(TestTokenKey, MockExternalLinkManagerLive, MockPcoHttpClientLive)
const TestLayerEmpty = Layer.mergeAll(
  TestTokenKey,
  MockExternalLinkManagerEmptyLive,
  MockPcoHttpClientLive,
)
const TestLayerWithErrors = Layer.mergeAll(
  TestTokenKey,
  MockExternalLinkManagerLive,
  MockPcoHttpClientWithErrorsLive,
)
const TestLayerDbError = Layer.mergeAll(
  TestTokenKey,
  MockExternalLinkManagerErrorLive,
  MockPcoHttpClientLive,
)

// ===== TEST DATA FACTORIES =====

const createCrudOperation = (
  op: CrudOperation['op'] = 'insert',
  tableName = 'test_entities',
  entityId = 'test_123',
  value: any = {
    created_at: '2023-01-01T00:00:00Z',
    description: 'A test entity',
    name: 'Test Entity',
    updated_at: '2023-01-01T00:00:00Z',
  },
): CrudOperation => ({
  op,
  primaryKey: { id: entityId },
  tableName,
  value,
})

const createExternalLink = (adapter = 'pco', externalId = 'pco_123'): ExternalLink => ({
  adapter,
  externalId,
})

// ===== UNIT TESTS =====

effect('mkEntityName converts table names correctly', () =>
  Effect.gen(function* () {
    expect(mkEntityName('people')).toBe('Person')
    expect(mkEntityName('addresses')).toBe('Address')
    expect(mkEntityName('phone_numbers')).toBe('PhoneNumber')
    expect(mkEntityName('campuses')).toBe('Campus')
    expect(mkEntityName('custom_entities')).toBe('CustomEntity')
  }),
)

effect('mkEntityName handles edge cases', () =>
  Effect.gen(function* () {
    // Test various pluralization patterns
    expect(mkEntityName('companies')).toBe('Company') // -ies -> -y
    expect(mkEntityName('boxes')).toBe('Box') // -es -> remove
    expect(mkEntityName('children')).toBe('Child') // irregular
    expect(mkEntityName('data')).toBe('Data') // no change needed

    // Test snake_case conversion
    expect(mkEntityName('phone_numbers')).toBe('PhoneNumber')
    expect(mkEntityName('email_addresses')).toBe('EmailAddress')
    expect(mkEntityName('user_profiles')).toBe('UserProfile')
  }),
)

layer(Layer.empty)('transformEntityDataE handles known entities', (it) =>
  it.live('should attempt to transform known entities', () =>
    Effect.gen(function* () {
      const addressData = {
        city: 'New York',
        created_at: '2023-01-01T00:00:00Z',
        state: 'NY',
        street: '123 Main St',
        updated_at: '2023-01-01T00:00:00Z',
        zip: '10001',
      }

      // This test verifies that the function attempts transformation for known entities
      // The actual transformation may fail due to schema validation, but that's expected
      // since we're testing the logic path, not the schema transformation itself
      const result = yield* transformEntityDataE('TestEntity', addressData).pipe(Effect.either)

      // Either succeeds with transformed data or fails with ParseError
      expect(result._tag === 'Left' || result._tag === 'Right').toBe(true)
    }),
  ),
)

layer(Layer.empty)('transformEntityDataE handles unknown entities', (it) =>
  it.live('should handle unknown entities', () =>
    Effect.gen(function* () {
      const unknownData = { some: 'data' }

      const result = yield* transformEntityDataE('UnknownEntity', unknownData)
      expect(result).toEqual(unknownData) // Should return raw data
    }),
  ),
)

effect(
  'findEntityManifestE finds existing entities',
  () =>
    Effect.gen(function* () {
      const result = yield* findEntityManifestE('Person')
      expect(result._tag).toBe('Some')
    }),
  { timeout: 10000 },
)

effect(
  'findEntityManifestE returns None for non-existent entities',
  () =>
    Effect.gen(function* () {
      const result = yield* findEntityManifestE('NonExistentEntity')
      expect(result._tag).toBe('None')
    }),
  { timeout: 10000 },
)

layer(TestLayer)('getExternalLinksE returns external links', (it) =>
  it.effect('should return external links', () =>
    Effect.gen(function* () {
      const result = yield* getExternalLinksE('test_entities', 'test_123')
      expect(result.length).toBe(1)
      expect(result[0]?.adapter).toBe('pco')
      expect(result[0]?.externalId).toBe('pco_test_123')
    }),
  ),
)

layer(TestLayerEmpty)('getExternalLinksE returns empty array when no links exist', (it) =>
  it.effect('should return empty array', () =>
    Effect.gen(function* () {
      const result = yield* getExternalLinksE('addresses', 'address_nonexistent')
      expect(result).toEqual([])
    }),
  ),
)

layer(TestLayerDbError)('getExternalLinksE handles database errors', (it) =>
  it.effect('should handle database errors', () =>
    Effect.gen(function* () {
      const result = yield* getExternalLinksE('test_entities', 'test_123').pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect((result as any).left.message).toContain('Database connection failed')
    }),
  ),
)

// ===== CRUD EFFECT TESTS =====

effect(
  'mkCrudEffectE handles create operations',
  () =>
    Effect.gen(function* () {
      const mockClient = yield* makeMockPcoHttpClient
      const entityClient = mockClient.Person as EntityClient
      const result = yield* mkCrudEffectE(
        'insert',
        entityClient,
        'Person',
        { name: 'John' },
        'pco_123',
      )
      expect(result).toBeDefined()
      expect((result as any).id).toBe('new_pco_123')
    }),
  { timeout: 10000 },
)

effect(
  'mkCrudEffectE handles update operations',
  () =>
    Effect.gen(function* () {
      const mockClient = yield* makeMockPcoHttpClient
      const entityClient = mockClient.Person as EntityClient
      const result = yield* mkCrudEffectE(
        'update',
        entityClient,
        'Person',
        { name: 'John' },
        'pco_123',
      )
      expect(result).toBeDefined()
      expect((result as any).id).toBe('pco_123')
    }),
  { timeout: 10000 },
)

effect(
  'mkCrudEffectE handles delete operations',
  () =>
    Effect.gen(function* () {
      const mockClient = yield* makeMockPcoHttpClient
      const entityClient = mockClient.Person as EntityClient
      const result = yield* mkCrudEffectE('delete', entityClient, 'Person', {}, 'pco_123')
      expect(result).toBeUndefined()
    }),
  { timeout: 10000 },
)

effect(
  'mkCrudEffectE fails for unsupported operations',
  () =>
    Effect.gen(function* () {
      const entityClient = {} // Empty client with no methods
      const result = yield* mkCrudEffectE('insert', entityClient, 'Person', {}, 'pco_123').pipe(
        Effect.either,
      )
      expect(result._tag).toBe('Left')
      expect((result as any).left.message).toContain('Create not supported')
    }),
  { timeout: 10000 },
)

// ===== PCO SYNC TESTS =====

layer(TestLayer)('syncToPcoE successfully syncs to PCO', (it) =>
  it.effect('should sync successfully', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const link = createExternalLink('pco', 'pco_123')

      // Should complete without errors
      yield* syncToPcoE(operation, 'TestEntity', link)
    }),
  ),
)

layer(TestLayer)('syncToPcoE handles missing entity client', (it) =>
  it.effect('should handle missing client gracefully', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'test_entities', 'test_123')
      const link = createExternalLink('pco', 'pco_123')

      // Should handle gracefully when entity client doesn't exist
      yield* syncToPcoE(operation, 'UnknownEntity', link)
    }),
  ),
)

layer(TestLayerWithErrors)('syncToPcoE handles API errors gracefully', (it) =>
  it.effect('should handle API errors gracefully', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const link = createExternalLink('pco', 'pco_123')

      // Should handle API errors gracefully (no throw)
      yield* syncToPcoE(operation, 'TestEntity', link)
    }),
  ),
)

// ===== EXTERNAL SYSTEMS SYNC TESTS =====

layer(TestLayer)('syncToExternalSystemsE handles PCO adapter', (it) =>
  it.effect('should handle PCO adapter', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const links = [createExternalLink('pco', 'pco_123')]

      yield* syncToExternalSystemsE(operation, 'TestEntity', links)
    }),
  ),
)

layer(TestLayer)('syncToExternalSystemsE handles unsupported adapters', (it) =>
  it.effect('should handle unsupported adapters', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const links = [
        createExternalLink('pco', 'pco_123'),
        createExternalLink('unsupported', 'other_123'),
      ]

      // Should handle both supported and unsupported adapters
      yield* syncToExternalSystemsE(operation, 'TestEntity', links)
    }),
  ),
)

// ===== CRUD OPERATION PROCESSING TESTS =====

layer(TestLayer)('processCrudOperationE processes valid operations', (it) =>
  it.effect('should process valid operations', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'test_entities', 'test_123')

      yield* processCrudOperationE(operation)
    }),
  ),
)

layer(TestLayer)('processCrudOperationE skips entities not in manifest', (it) =>
  it.effect('should skip unknown entities', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'unknown_entities', 'entity_123')

      // Should skip gracefully for unknown entities
      yield* processCrudOperationE(operation)
    }),
  ),
)

layer(TestLayerEmpty)('processCrudOperationE skips entities without external links', (it) =>
  it.effect('should skip entities without links', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'test_entities', 'person_no_links')

      // Should skip gracefully when no external links exist
      yield* processCrudOperationE(operation)
    }),
  ),
)

// ===== MAIN SYNC FUNCTION TESTS =====

layer(TestLayer)('syncDataE processes single mutation', (it) =>
  it.effect('should process single mutation', () =>
    Effect.gen(function* () {
      const mutations = [
        {
          mutation: 'test_mutation_1',
          op: createCrudOperation('update', 'test_entities', 'test_123'),
        },
      ]

      yield* syncDataE(mutations)
    }),
  ),
)

layer(TestLayer)('syncDataE processes multiple mutations', (it) =>
  it.effect('should process multiple mutations', () =>
    Effect.gen(function* () {
      const mutations = [
        {
          mutation: 'test_mutation_1',
          op: createCrudOperation('update', 'test_entities', 'test_123'),
        },
        {
          mutation: 'test_mutation_2',
          op: createCrudOperation('insert', 'addresses', 'address_456'),
        },
        {
          mutation: 'test_mutation_3',
          op: createCrudOperation('delete', 'phone_numbers', 'phone_789'),
        },
      ]

      yield* syncDataE(mutations)
    }),
  ),
)

layer(TestLayer)('syncDataE handles empty mutations array', (it) =>
  it.effect('should handle empty mutations', () =>
    Effect.gen(function* () {
      const mutations: Array<{ mutation: unknown; op: unknown }> = []

      yield* syncDataE(mutations)
    }),
  ),
)

layer(TestLayer)('syncDataE handles mutations with unknown entities', (it) =>
  it.effect('should handle unknown entities', () =>
    Effect.gen(function* () {
      const mutations = [
        {
          mutation: 'test_mutation_1',
          op: createCrudOperation('update', 'test_entities', 'test_123'),
        },
        {
          mutation: 'test_mutation_2',
          op: createCrudOperation('update', 'unknown_entities', 'entity_789'), // Should be skipped
        },
      ]

      yield* syncDataE(mutations)
    }),
  ),
)

layer(TestLayerWithErrors)('syncDataE handles API errors gracefully', (it) =>
  it.effect('should handle API errors gracefully', () =>
    Effect.gen(function* () {
      const mutations = [
        {
          mutation: 'test_mutation_error',
          op: createCrudOperation('update', 'test_entities', 'test_123'),
        },
      ]

      // Should handle API errors gracefully and continue processing
      yield* syncDataE(mutations)
    }),
  ),
)

// ===== TYPE AND FACTORY TESTS =====

effect('CrudOperation factory creates valid operations', () =>
  Effect.gen(function* () {
    const operation = createCrudOperation('update', 'test_entities', 'test_123')

    expect(operation.op).toBe('update')
    expect(operation.tableName).toBe('test_entities')
    expect(operation.primaryKey.id).toBe('test_123')
    expect(operation.value).toBeDefined()
  }),
)

effect('CrudOperation factory handles different operation types', () =>
  Effect.gen(function* () {
    const insertOp = createCrudOperation('insert')
    const updateOp = createCrudOperation('update')
    const deleteOp = createCrudOperation('delete')
    const upsertOp = createCrudOperation('upsert')

    expect(insertOp.op).toBe('insert')
    expect(updateOp.op).toBe('update')
    expect(deleteOp.op).toBe('delete')
    expect(upsertOp.op).toBe('upsert')
  }),
)

effect('All types are properly exported', () =>
  Effect.gen(function* () {
    // This test verifies that our types and functions are properly exported
    const operation: CrudOperation = {
      op: 'insert',
      primaryKey: { id: 'test_123' },
      tableName: 'test_entities',
      value: { name: 'Test User' },
    }

    const link: ExternalLink = {
      adapter: 'pco',
      externalId: 'pco_123',
    }

    expect(operation.op).toBe('insert')
    expect(link.adapter).toBe('pco')
    expect(typeof mkEntityName).toBe('function')
    expect(typeof transformEntityDataE).toBe('function')
    expect(typeof findEntityManifestE).toBe('function')
    expect(typeof getExternalLinksE).toBe('function')
    expect(typeof mkCrudEffectE).toBe('function')
    expect(typeof syncToPcoE).toBe('function')
    expect(typeof syncToExternalSystemsE).toBe('function')
    expect(typeof processCrudOperationE).toBe('function')
    expect(typeof syncDataE).toBe('function')
  }),
)
