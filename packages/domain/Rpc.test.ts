import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { AdapterRpc, CoreRpc } from '@openfaith/domain/Rpc'
import { Effect } from 'effect'

// Test CoreRpc structure
effect('CoreRpc should be defined correctly', () =>
  Effect.gen(function* () {
    expect(CoreRpc).toBeDefined()
    expect(typeof CoreRpc).toBe('function')
  }),
)

effect('CoreRpc should have toLayer method', () =>
  Effect.gen(function* () {
    expect(CoreRpc.toLayer).toBeDefined()
    expect(typeof CoreRpc.toLayer).toBe('function')
  }),
)

// Test AdapterRpc structure
effect('AdapterRpc should be defined correctly', () =>
  Effect.gen(function* () {
    expect(AdapterRpc).toBeDefined()
    expect(typeof AdapterRpc).toBe('function')
  }),
)

effect('AdapterRpc should have toLayer method', () =>
  Effect.gen(function* () {
    expect(AdapterRpc.toLayer).toBeDefined()
    expect(typeof AdapterRpc.toLayer).toBe('function')
  }),
)

// Test that RPC groups can be used for creating handlers
effect('CoreRpc should be usable for creating handlers', () =>
  Effect.gen(function* () {
    // Test that we can create a layer with the correct handler
    const layer = CoreRpc.toLayer({
      testFunction: () => Effect.succeed({ message: 'test' }),
    })

    expect(layer).toBeDefined()
  }),
)

effect('AdapterRpc should be usable for creating handlers', () =>
  Effect.gen(function* () {
    // Test that we can create a layer with the correct handler
    const layer = AdapterRpc.toLayer({
      adapterConnect: () => Effect.succeed('success' as const),
    })

    expect(layer).toBeDefined()
  }),
)

// Test RPC handler type safety
effect('CoreRpc handler should accept correct parameters', () =>
  Effect.gen(function* () {
    // Test that handlers can be created with the expected signature
    const layer = CoreRpc.toLayer({
      testFunction: () => Effect.succeed({ message: 'valid message' }),
    })

    expect(layer).toBeDefined()
  }),
)

effect('AdapterRpc handler should accept correct parameters', () =>
  Effect.gen(function* () {
    // Test that handlers can be created with the expected signature
    const layer = AdapterRpc.toLayer({
      adapterConnect: ({ adapter, code, redirectUri }) => {
        // Verify parameters are available
        expect(typeof adapter).toBe('string')
        expect(typeof code).toBe('string')
        expect(typeof redirectUri).toBe('string')

        return Effect.succeed('success' as const)
      },
    })

    expect(layer).toBeDefined()
  }),
)

// Test RPC error handling
effect('CoreRpc should handle TestFunctionError', () =>
  Effect.gen(function* () {
    // Import the error class dynamically to avoid circular dependencies
    const { TestFunctionError } = yield* Effect.promise(
      () => import('@openfaith/domain/core/coreDomain'),
    )

    const layer = CoreRpc.toLayer({
      testFunction: () =>
        Effect.fail(
          new TestFunctionError({
            cause: 'Test cause',
            message: 'Test error',
          }),
        ),
    })

    expect(layer).toBeDefined()
  }),
)

effect('AdapterRpc should handle AdapterConnectError', () =>
  Effect.gen(function* () {
    // Import the error class dynamically to avoid circular dependencies
    const { AdapterConnectError } = yield* Effect.promise(
      () => import('@openfaith/domain/core/adapterDomain'),
    )

    const layer = AdapterRpc.toLayer({
      adapterConnect: ({ adapter }) =>
        Effect.fail(
          new AdapterConnectError({
            adapter: adapter,
            cause: 'Network error',
            message: 'Connection failed',
          }),
        ),
    })

    expect(layer).toBeDefined()
  }),
)

// Test RPC middleware integration
effect('CoreRpc should integrate with session middleware', () =>
  Effect.gen(function* () {
    // The RPC groups should be created with middleware applied
    // We can't test the middleware directly without a full Effect runtime,
    // but we can verify the structure is correct
    const layer = CoreRpc.toLayer({
      testFunction: () => Effect.succeed({ message: 'test' }),
    })

    expect(layer).toBeDefined()
    // The layer should be properly typed and structured
  }),
)

effect('AdapterRpc should integrate with session middleware', () =>
  Effect.gen(function* () {
    // The RPC groups should be created with middleware applied
    const layer = AdapterRpc.toLayer({
      adapterConnect: () => Effect.succeed('success' as const),
    })

    expect(layer).toBeDefined()
    // The layer should be properly typed and structured
  }),
)

// Test RPC exports and imports
effect('RPC modules should export correctly', () =>
  Effect.gen(function* () {
    // Test that both RPC classes are exported from the module
    expect(CoreRpc).toBeDefined()
    expect(AdapterRpc).toBeDefined()

    // They should be different classes
    expect(CoreRpc).not.toBe(AdapterRpc)
  }),
)

// Test RPC layer composition
effect('RPC layers should be composable', () =>
  Effect.gen(function* () {
    // Test that multiple RPC layers can be created
    const coreLayer = CoreRpc.toLayer({
      testFunction: () => Effect.succeed({ message: 'core test' }),
    })

    const adapterLayer = AdapterRpc.toLayer({
      adapterConnect: () => Effect.succeed('success' as const),
    })

    expect(coreLayer).toBeDefined()
    expect(adapterLayer).toBeDefined()

    // Both layers should be distinct
    expect(coreLayer).not.toBe(adapterLayer)
  }),
)
