import { expect } from 'bun:test'
import { AdapterOperations, UnsupportedAdapterError } from '@openfaith/adapter-core'
import { layer } from '@openfaith/bun-test'
import { AdapterRegistry } from '@openfaith/every-adapter/adapterRegistry'
import { Effect, Layer, Option, Stream } from 'effect'

// Mock adapter operations for testing
const createMockAdapterOperations = (tag: string) =>
  AdapterOperations.of({
    createEntity: (_entityName, data) =>
      Effect.succeed({
        id: `created-${tag}`,
        ...(data as Record<string, unknown>),
      }),
    extractUpdatedAt: () => Option.some('2023-01-01T00:00:00Z'),

    fetchEntityById: (entityType, entityId) =>
      Effect.succeed({
        id: entityId,
        name: `Mock ${entityType} ${entityId}`,
        type: entityType,
      }),
    fetchToken: () =>
      Effect.succeed({
        accessToken: `mock-token-${tag}`,
        createdAt: Date.now(),
        expiresIn: 3600,
        refreshToken: `mock-refresh-${tag}`,
        tokenType: 'Bearer',
      }),

    getAdapterTag: () => tag,

    getEntityManifest: () => ({
      person: {
        endpoint: '/api/person',
        endpoints: { list: {} },
        entity: 'person',
        skipSync: false,
        transformer: undefined,
      },
    }),

    getWebhookEventTypes: () => [],

    listEntityData: (entityName) => Stream.make({ id: '1', name: `mock-${entityName}` }),

    processEntityData: () => Effect.void,

    processWebhook: () => Effect.succeed([]),

    syncEntityData: (entityName, operations) =>
      Effect.succeed(
        operations.map((op) => ({
          entityName,
          error: undefined,
          externalId: `mock-id-${tag}`,
          operation: op.op,
          success: true,
        })),
      ),

    transformEntityData: (_, data) => Effect.succeed(data),

    updateEntity: (_entityName, entityId, data) =>
      Effect.succeed({
        id: entityId,
        ...(data as Record<string, unknown>),
      }),
  })

// Create mock adapter layers
const MockPcoAdapterLayer = Layer.succeed(AdapterOperations, createMockAdapterOperations('pco'))
const MockCcbAdapterLayer = Layer.succeed(AdapterOperations, createMockAdapterOperations('ccb'))

// Create a test registry with mock adapters
const TestRegistryLayer = Layer.succeed(AdapterRegistry, {
  getOperations: (adapterTag: string) =>
    Effect.gen(function* () {
      switch (adapterTag) {
        case 'pco':
          return yield* Effect.provide(AdapterOperations, MockPcoAdapterLayer)
        case 'ccb':
          return yield* Effect.provide(AdapterOperations, MockCcbAdapterLayer)
        default:
          return yield* Effect.fail(
            new UnsupportedAdapterError({
              adapter: adapterTag,
              message: `Adapter '${adapterTag}' is not supported`,
            }),
          )
      }
    }),

  isAdapterSupported: (adapterTag: string) => ['pco', 'ccb'].includes(adapterTag),

  listSupportedAdapters: () => ['pco', 'ccb'],
})

layer(TestRegistryLayer)('AdapterRegistry', (it) => {
  it.effect('should return supported adapters list', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const supportedAdapters = registry.listSupportedAdapters()

      expect(supportedAdapters).toEqual(['pco', 'ccb'])
      expect(supportedAdapters).toHaveLength(2)
    }),
  )

  it.effect('should check if adapter is supported', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry

      expect(registry.isAdapterSupported('pco')).toBe(true)
      expect(registry.isAdapterSupported('ccb')).toBe(true)
      expect(registry.isAdapterSupported('unsupported')).toBe(false)
      expect(registry.isAdapterSupported('')).toBe(false)
    }),
  )

  it.effect('should get operations for supported adapter', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const pcoOperations = yield* registry.getOperations('pco')

      expect(pcoOperations.getAdapterTag()).toBe('pco')

      // Test fetchToken operation
      const tokenResult = yield* pcoOperations.fetchToken({
        code: 'test-code',
        redirectUri: 'http://localhost:3000/callback',
      })

      expect(tokenResult.accessToken).toBe('mock-token-pco')
      expect(tokenResult.tokenType).toBe('Bearer')
    }),
  )

  it.effect('should get different operations for different adapters', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry

      const pcoOperations = yield* registry.getOperations('pco')
      const ccbOperations = yield* registry.getOperations('ccb')

      expect(pcoOperations.getAdapterTag()).toBe('pco')
      expect(ccbOperations.getAdapterTag()).toBe('ccb')

      // Test that they return different tokens
      const pcoToken = yield* pcoOperations.fetchToken({
        code: 'test',
        redirectUri: 'test',
      })
      const ccbToken = yield* ccbOperations.fetchToken({
        code: 'test',
        redirectUri: 'test',
      })

      expect(pcoToken.accessToken).toBe('mock-token-pco')
      expect(ccbToken.accessToken).toBe('mock-token-ccb')
    }),
  )

  it.effect('should fail for unsupported adapter', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const result = yield* Effect.exit(registry.getOperations('unsupported'))

      expect(result._tag).toBe('Failure')
      if (result._tag === 'Failure') {
        expect(result.cause._tag).toBe('Fail')
        if (result.cause._tag === 'Fail') {
          expect(result.cause.error).toBeInstanceOf(UnsupportedAdapterError)
          expect(result.cause.error.adapter).toBe('unsupported')
        }
      }
    }),
  )

  it.effect('should handle empty adapter tag', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const result = yield* Effect.exit(registry.getOperations(''))

      expect(result._tag).toBe('Failure')
      if (result._tag === 'Failure') {
        expect(result.cause._tag).toBe('Fail')
        if (result.cause._tag === 'Fail') {
          expect(result.cause.error).toBeInstanceOf(UnsupportedAdapterError)
          expect(result.cause.error.adapter).toBe('')
        }
      }
    }),
  )

  it.effect('should work with adapter operations - extractUpdatedAt', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const operations = yield* registry.getOperations('pco')

      const updatedAt = operations.extractUpdatedAt({
        updated_at: '2023-01-01',
      })

      expect(updatedAt._tag).toBe('Some')
      if (updatedAt._tag === 'Some') {
        expect(updatedAt.value).toBe('2023-01-01T00:00:00Z')
      }
    }),
  )

  it.effect('should work with adapter operations - syncEntityData', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const operations = yield* registry.getOperations('pco')

      const mockOperations = [
        {
          op: 'insert' as const,
          primaryKey: { id: '1' },
          tableName: 'person',
          value: { name: 'John Doe' },
        },
      ]

      const results = yield* operations.syncEntityData('person', mockOperations)

      expect(results).toHaveLength(1)
      expect(results[0]?.entityName).toBe('person')
      expect(results[0]?.operation).toBe('insert')
      expect(results[0]?.success).toBe(true)
      expect(results[0]?.externalId).toBe('mock-id-pco')
    }),
  )

  it.effect('should work with adapter operations - getEntityManifest', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const operations = yield* registry.getOperations('ccb')

      const manifest = operations.getEntityManifest()

      expect(manifest).toBeDefined()
      expect(typeof manifest).toBe('object')
      expect(manifest.person).toBeDefined()
      expect(manifest.person?.entity).toBe('person')
    }),
  )

  it.effect('should work with adapter operations - transformEntityData', () =>
    Effect.gen(function* () {
      const registry = yield* AdapterRegistry
      const operations = yield* registry.getOperations('pco')

      const testData = { email: 'john@example.com', name: 'John' }
      const transformed = yield* operations.transformEntityData('person', testData, 'create')

      expect(transformed).toEqual(testData)
    }),
  )
})
