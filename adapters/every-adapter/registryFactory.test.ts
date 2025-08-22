import { expect } from 'bun:test'
import { AdapterOperations, UnsupportedAdapterError } from '@openfaith/adapter-core'
import { effect } from '@openfaith/bun-test'
import { AdapterRegistry } from '@openfaith/every-adapter/adapterRegistry'
import { makeAdapterRegistry } from '@openfaith/every-adapter/registryFactory'
import { Effect, Layer, Option, Stream } from 'effect'

// Mock adapter operations for testing
const createMockAdapterOperations = (tag: string) =>
  AdapterOperations.of({
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
  })

// Create mock adapter layers
const MockPcoAdapterLayer = Layer.succeed(AdapterOperations, createMockAdapterOperations('pco'))
const MockCcbAdapterLayer = Layer.succeed(AdapterOperations, createMockAdapterOperations('ccb'))

effect('makeAdapterRegistry should create registry with single adapter', () =>
  Effect.gen(function* () {
    const registryLayer = makeAdapterRegistry([{ layer: MockPcoAdapterLayer, tag: 'pco' }])

    const registry = yield* Effect.provide(AdapterRegistry, registryLayer)

    const supportedAdapters = registry.listSupportedAdapters()
    expect(supportedAdapters).toEqual(['pco'])
    expect(supportedAdapters).toHaveLength(1)

    expect(registry.isAdapterSupported('pco')).toBe(true)
    expect(registry.isAdapterSupported('ccb')).toBe(false)
  }),
)

effect('makeAdapterRegistry should create registry with multiple adapters', () =>
  Effect.gen(function* () {
    const registryLayer = makeAdapterRegistry([
      { layer: MockPcoAdapterLayer, tag: 'pco' },
      { layer: MockCcbAdapterLayer, tag: 'ccb' },
    ])

    const registry = yield* Effect.provide(AdapterRegistry, registryLayer)

    const supportedAdapters = registry.listSupportedAdapters()
    expect(supportedAdapters).toEqual(['pco', 'ccb'])
    expect(supportedAdapters).toHaveLength(2)

    expect(registry.isAdapterSupported('pco')).toBe(true)
    expect(registry.isAdapterSupported('ccb')).toBe(true)
    expect(registry.isAdapterSupported('unsupported')).toBe(false)
  }),
)

effect('makeAdapterRegistry should create registry with empty adapters list', () =>
  Effect.gen(function* () {
    const registryLayer = makeAdapterRegistry([])

    const registry = yield* Effect.provide(AdapterRegistry, registryLayer)

    const supportedAdapters = registry.listSupportedAdapters()
    expect(supportedAdapters).toEqual([])
    expect(supportedAdapters).toHaveLength(0)

    expect(registry.isAdapterSupported('pco')).toBe(false)
    expect(registry.isAdapterSupported('ccb')).toBe(false)
  }),
)

effect('makeAdapterRegistry should return correct operations for registered adapters', () =>
  Effect.gen(function* () {
    const registryLayer = makeAdapterRegistry([
      { layer: MockPcoAdapterLayer, tag: 'pco' },
      { layer: MockCcbAdapterLayer, tag: 'ccb' },
    ])

    const registry = yield* Effect.provide(AdapterRegistry, registryLayer)

    // Test PCO operations
    const pcoOperations = yield* registry.getOperations('pco')
    expect(pcoOperations.getAdapterTag()).toBe('pco')

    const pcoToken = yield* pcoOperations.fetchToken({
      code: 'test',
      redirectUri: 'test',
    })
    expect(pcoToken.accessToken).toBe('mock-token-pco')

    // Test CCB operations
    const ccbOperations = yield* registry.getOperations('ccb')
    expect(ccbOperations.getAdapterTag()).toBe('ccb')

    const ccbToken = yield* ccbOperations.fetchToken({
      code: 'test',
      redirectUri: 'test',
    })
    expect(ccbToken.accessToken).toBe('mock-token-ccb')
  }),
)

effect('makeAdapterRegistry should fail for unregistered adapters', () =>
  Effect.gen(function* () {
    const registryLayer = makeAdapterRegistry([{ layer: MockPcoAdapterLayer, tag: 'pco' }])

    const registry = yield* Effect.provide(AdapterRegistry, registryLayer)

    const result = yield* Effect.exit(registry.getOperations('unsupported'))

    expect(result._tag).toBe('Failure')
    if (result._tag === 'Failure') {
      expect(result.cause._tag).toBe('Fail')
      if (result.cause._tag === 'Fail') {
        const error = result.cause.error as UnsupportedAdapterError
        expect(error).toBeInstanceOf(UnsupportedAdapterError)
        expect(error.adapter).toBe('unsupported')
        expect(error.message).toContain('not supported')
        expect(error.message).toContain('pco')
      }
    }
  }),
)

effect('makeAdapterRegistry should handle operations correctly', () =>
  Effect.gen(function* () {
    const registryLayer = makeAdapterRegistry([{ layer: MockPcoAdapterLayer, tag: 'pco' }])

    const registry = yield* Effect.provide(AdapterRegistry, registryLayer)
    const operations = yield* registry.getOperations('pco')

    // Test extractUpdatedAt
    const updatedAt = operations.extractUpdatedAt({ updated_at: '2023-01-01' })
    expect(updatedAt._tag).toBe('Some')

    // Test syncEntityData
    const syncResults = yield* operations.syncEntityData('person', [
      {
        op: 'insert',
        primaryKey: { id: '1' },
        tableName: 'person',
        value: { name: 'John' },
      },
    ])
    expect(syncResults).toHaveLength(1)
    expect(syncResults[0]?.success).toBe(true)

    // Test getEntityManifest
    const manifest = operations.getEntityManifest()
    expect(manifest.person).toBeDefined()

    // Test transformEntityData
    const testData = { name: 'John' }
    const transformed = yield* operations.transformEntityData('person', testData, 'create')
    expect(transformed).toEqual(testData)
  }),
)
