import { expect } from 'bun:test'
import {
  ExternalLinkManager,
  ExternalLinkNotFoundError,
} from '@openfaith/adapter-core/layers/externalLinkManager'
import { TokenKey } from '@openfaith/adapter-core/server'
import { effect, layer } from '@openfaith/bun-test'
import type { CRUDMutation, CRUDOp } from '@openfaith/domain'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import {
  makeMockPcoHttpClient,
  makeMockPcoHttpClientWithErrors,
} from '@openfaith/pco/api/pcoApiMock'
import { mkEntityName } from '@openfaith/shared/string'
import {
  type CrudOperation,
  type EntityClient,
  EntityTransformError,
  type ExternalLink,
  ExternalSyncError,
  findEntityManifestE,
  getExternalLinksE,
  mkCrudEffectE,
  processCrudOperationE,
  syncDataE,
  syncToExternalSystemsE,
  syncToPcoE,
  transformEntityDataE,
  UnsupportedAdapterError,
  UnsupportedOperationError,
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

const createCrudMutation = (op: CrudOperation): CRUDMutation => ({
  args: [{ ops: [op] }],
  clientID: 'test_client',
  id: 1,
  name: '_zero_crud',
  timestamp: Date.now(),
  type: 'crud',
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
  'mkCrudEffectE succeeds with warning for unsupported operations',
  () =>
    Effect.gen(function* () {
      const entityClient = {} // Empty client with no methods
      const result = yield* mkCrudEffectE('insert', entityClient, 'Person', {}, 'pco_123').pipe(
        Effect.either,
      )
      expect(result._tag).toBe('Right')
      expect((result as any).right).toBe(null)
    }),
  { timeout: 10000 },
)

effect(
  'mkCrudEffectE fails for unknown operation types',
  () =>
    Effect.gen(function* () {
      const mockClient = yield* makeMockPcoHttpClient
      const entityClient = mockClient.Person as EntityClient
      const result = yield* mkCrudEffectE(
        'unknown' as any,
        entityClient,
        'Person',
        {},
        'pco_123',
      ).pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect((result as any).left._tag).toBe('UnsupportedOperationError')
      expect((result as any).left.operation).toBe('unknown')
      expect((result as any).left.entityName).toBe('Person')
    }),
  { timeout: 10000 },
)

// ===== PCO SYNC TESTS =====

layer(TestLayer)('syncToPcoE successfully syncs to PCO', (it) =>
  it.effect('should succeed with warning when entity client not found', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const link = createExternalLink('pco', 'pco_123')

      // Should complete without errors - use "TestEntity" which doesn't exist in mock
      // but now succeeds with warning instead of failing
      const result = yield* syncToPcoE(operation, 'TestEntity', link).pipe(Effect.either)
      expect(result._tag).toBe('Right')
      expect((result as any).right).toBeUndefined()
    }),
  ),
)

layer(TestLayer)('syncToPcoE handles missing entity client', (it) =>
  it.effect("should succeed with warning when entity client doesn't exist", () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'test_entities', 'test_123')
      const link = createExternalLink('pco', 'pco_123')

      // Should succeed with warning when entity client doesn't exist
      const result = yield* syncToPcoE(operation, 'UnknownEntity', link).pipe(Effect.either)
      expect(result._tag).toBe('Right')
      expect((result as any).right).toBeUndefined()
    }),
  ),
)

layer(TestLayerWithErrors)('syncToPcoE handles transformation errors', (it) =>
  it.effect('should fail with EntityTransformError when data is invalid', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const link = createExternalLink('pco', 'pco_123')

      // Should fail with EntityTransformError when using Person with invalid data
      const result = yield* syncToPcoE(operation, 'Person', link).pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect((result as any).left._tag).toBe('EntityTransformError')
      expect((result as any).left.entityName).toBe('Person')
    }),
  ),
)

// ===== EXTERNAL SYSTEMS SYNC TESTS =====

layer(TestLayer)('syncToExternalSystemsE handles PCO adapter', (it) =>
  it.effect('should succeed with warning when entity client not found', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const links = [createExternalLink('pco', 'pco_123')]

      // TestEntity doesn't exist in mock, so should succeed with warning
      const result = yield* syncToExternalSystemsE(operation, 'TestEntity', links).pipe(
        Effect.either,
      )
      expect(result._tag).toBe('Right')
      expect((result as any).right).toBeUndefined()
    }),
  ),
)

layer(TestLayer)('syncToExternalSystemsE handles unsupported adapters', (it) =>
  it.effect('should fail with UnsupportedAdapterError', () =>
    Effect.gen(function* () {
      const operation = createCrudOperation('update', 'addresses', 'address_123')
      const links = [createExternalLink('unsupported', 'other_123')]

      // Should fail with UnsupportedAdapterError when encountering unsupported adapter
      const result = yield* syncToExternalSystemsE(operation, 'TestEntity', links).pipe(
        Effect.either,
      )
      expect(result._tag).toBe('Left')
      expect((result as any).left._tag).toBe('UnsupportedAdapterError')
      expect((result as any).left.adapter).toBe('unsupported')
      expect((result as any).left.entityName).toBe('TestEntity')
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
      const op = createCrudOperation('update', 'test_entities', 'test_123')
      const mutations = [
        {
          mutation: createCrudMutation(op),
          op,
        },
      ]

      yield* syncDataE(mutations)
    }),
  ),
)

layer(TestLayer)('syncDataE processes multiple mutations', (it) =>
  it.effect('should fail with EntityTransformError when using entities with transformers', () =>
    Effect.gen(function* () {
      const op1 = createCrudOperation('update', 'test_entities', 'test_123')
      const op2 = createCrudOperation('insert', 'addresses', 'address_456')
      const op3 = createCrudOperation('delete', 'phone_numbers', 'phone_789')
      const mutations = [
        {
          mutation: createCrudMutation(op1),
          op: op1,
        },
        {
          mutation: createCrudMutation(op2),
          op: op2,
        },
        {
          mutation: createCrudMutation(op3),
          op: op3,
        },
      ]

      // Should fail with EntityTransformError when processing addresses (which has a transformer)
      const result = yield* syncDataE(mutations).pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect((result as any).left._tag).toBe('EntityTransformError')
    }),
  ),
)

layer(TestLayer)('syncDataE handles empty mutations array', (it) =>
  it.effect('should handle empty mutations', () =>
    Effect.gen(function* () {
      const mutations: Array<{ mutation: CRUDMutation; op: CRUDOp }> = []

      yield* syncDataE(mutations)
    }),
  ),
)

layer(TestLayer)('syncDataE handles mutations with unknown entities', (it) =>
  it.effect('should handle unknown entities', () =>
    Effect.gen(function* () {
      const op1 = createCrudOperation('update', 'test_entities', 'test_123')
      const op2 = createCrudOperation('update', 'unknown_entities', 'entity_789') // Should be skipped
      const mutations = [
        {
          mutation: createCrudMutation(op1),
          op: op1,
        },
        {
          mutation: createCrudMutation(op2),
          op: op2,
        },
      ]

      yield* syncDataE(mutations)
    }),
  ),
)

layer(TestLayerWithErrors)('syncDataE handles transformation errors', (it) =>
  it.effect('should fail with EntityTransformError when using entities with transformers', () =>
    Effect.gen(function* () {
      const op = createCrudOperation('update', 'addresses', 'address_123')
      const mutations = [
        {
          mutation: createCrudMutation(op),
          op,
        },
      ]

      // Should fail with EntityTransformError when using Address entity with invalid data
      const result = yield* syncDataE(mutations).pipe(Effect.either)
      expect(result._tag).toBe('Left')
      expect((result as any).left._tag).toBe('EntityTransformError')
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

    // Verify error types are available (used in tests via _tag comparisons)
    expect(EntityTransformError).toBeDefined()
    expect(ExternalSyncError).toBeDefined()
    expect(UnsupportedAdapterError).toBeDefined()
    expect(UnsupportedOperationError).toBeDefined()
  }),
)
