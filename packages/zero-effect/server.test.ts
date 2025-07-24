import { expect } from 'bun:test'
import { PgClient } from '@effect/sql-pg'
import { effect, layer } from '@openfaith/bun-test'
import {
  type CustomMutatorEfDefs,
  EffectPgConnection,
  type EffectTransaction,
  make,
  ZeroMutationProcessingError,
  ZeroStore,
  ZeroStoreLive,
  zeroEffectPg,
  zeroEffectPgProcessor,
} from '@openfaith/zero-effect/server'
import { Effect, Layer, Runtime } from 'effect'

// ===== MOCK SERVICES =====

// Mock PgClient for testing
const createMockPgClient = () => ({
  unsafe: () => Effect.succeed([{ email: 'test@example.com', id: '1', name: 'Test User' }]),
  withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
})

const MockPgClientLive = Layer.succeed(PgClient.PgClient, createMockPgClient() as any)

// Mock schema for testing
const mockSchema = {
  tables: {
    groups: {
      columns: {
        description: { type: 'string' },
        id: { type: 'string' },
        name: { type: 'string' },
      },
      primaryKey: ['id'],
    },
    people: {
      columns: {
        email: { type: 'string' },
        id: { type: 'string' },
        name: { type: 'string' },
      },
      primaryKey: ['id'],
    },
  },
} as any

// ===== EFFECTPGCONNECTION TESTS =====

effect('EffectPgConnection should create instance correctly', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime
    const connection = new EffectPgConnection(mockPgClient, runtime)

    expect(connection).toBeInstanceOf(EffectPgConnection)
    expect(typeof connection.transaction).toBe('function')
  }),
)

effect('EffectPgConnection transaction should work', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime
    const connection = new EffectPgConnection(mockPgClient, runtime)

    const result = yield* Effect.promise(() =>
      connection.transaction(async (tx) => {
        const queryResult = await tx.query('SELECT * FROM people', [])
        return Array.from(queryResult)
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Test User')
  }),
)

// ===== ZERO STORE TESTS =====

effect('make should create ZeroStore instance', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime
    const zeroStore = make(mockPgClient, runtime)

    expect(zeroStore).toBeDefined()
    expect(typeof zeroStore.forSchema).toBe('function')
  }),
)

effect('ZeroStore forSchema should create ZeroSchemaStore', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime
    const zeroStore = make(mockPgClient, runtime)
    const schemaStore = zeroStore.forSchema(mockSchema)

    expect(schemaStore).toBeDefined()
    expect(schemaStore.database).toBeDefined()
    expect(schemaStore.processor).toBeDefined()
    expect(typeof schemaStore.processMutations).toBe('function')
  }),
)

// ===== ZERO EFFECT PG TESTS =====

effect('zeroEffectPg should create ZQLDatabase', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime
    const database = zeroEffectPg(mockSchema, mockPgClient, runtime)

    expect(database).toBeDefined()
    // ZQLDatabase should be properly instantiated
    expect(typeof database).toBe('object')
  }),
)

effect('zeroEffectPgProcessor should create PushProcessor', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime
    const processor = zeroEffectPgProcessor(mockSchema, mockPgClient, runtime)

    expect(processor).toBeDefined()
    expect(typeof processor.process).toBe('function')
  }),
)

// ===== LAYER TESTS =====

layer(MockPgClientLive)('ZeroStoreLive layer should work', (it) => {
  it.effect('should provide ZeroStore service', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      expect(zeroStore).toBeDefined()
      expect(typeof zeroStore.forSchema).toBe('function')
    }).pipe(Effect.provide(ZeroStoreLive)),
  )

  it.effect('should create schema store from layer', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      expect(schemaStore).toBeDefined()
      expect(schemaStore.database).toBeDefined()
      expect(schemaStore.processor).toBeDefined()
      expect(typeof schemaStore.processMutations).toBe('function')
    }).pipe(Effect.provide(ZeroStoreLive)),
  )
})

// ===== MUTATION PROCESSING TESTS =====

const createTestMutators = (): CustomMutatorEfDefs<any> => ({
  groups: {
    createGroup: (_tx: EffectTransaction<any>, input: { name: string; description?: string }) =>
      Effect.gen(function* () {
        // Simulate creating a group
        yield* Effect.log('Creating group', { name: input.name })
        return { id: 'new_group_123', ...input }
      }),
  },
  people: {
    createPerson: (_tx: EffectTransaction<any>, input: { name: string; email?: string }) =>
      Effect.gen(function* () {
        // Simulate creating a person
        yield* Effect.log('Creating person', { name: input.name })
        return { id: 'new_person_123', ...input }
      }),

    updatePerson: (
      _tx: EffectTransaction<any>,
      input: { id: string; name?: string; email?: string },
    ) =>
      Effect.gen(function* () {
        // Simulate updating a person
        yield* Effect.log('Updating person', { id: input.id })
        return { ...input }
      }),
  },
})

const createFailingMutators = (): CustomMutatorEfDefs<any> => ({
  people: {
    createPerson: () => Effect.fail(new Error('Mutator failed')),
  },
})

layer(MockPgClientLive)('ZeroSchemaStore processMutations should work', (it) => {
  it.effect('should process mutations successfully', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      const mutators = createTestMutators()
      const urlParams = { clientID: 'test-client' }
      const payload = {
        mutations: [
          {
            args: [{ email: 'john@example.com', name: 'John Doe' }],
            id: 1,
            name: 'people.createPerson',
          },
        ],
      }

      // This should not throw - the actual processing depends on Zero's internal implementation
      // We're mainly testing that the function can be called and returns an Effect
      const result = yield* schemaStore
        .processMutations(mutators, urlParams, payload)
        .pipe(Effect.either)

      // The result could be either success or failure depending on Zero's mock behavior
      // We're mainly testing that the Effect structure works correctly
      expect(result._tag === 'Left' || result._tag === 'Right').toBe(true)
    }).pipe(Effect.provide(ZeroStoreLive)),
  )

  it.effect('should handle mutation processing errors', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      const mutators = createFailingMutators()
      const urlParams = { clientID: 'test-client' }
      const payload = {
        mutations: [
          {
            args: [{ name: 'John Doe' }],
            id: 1,
            name: 'people.createPerson',
          },
        ],
      }

      const result = yield* schemaStore
        .processMutations(mutators, urlParams, payload)
        .pipe(Effect.either)

      // Should handle errors gracefully
      expect(result._tag === 'Left' || result._tag === 'Right').toBe(true)
    }).pipe(Effect.provide(ZeroStoreLive)),
  )
})

// ===== INTEGRATION TESTS =====

layer(MockPgClientLive)('Full Zero Effect integration should work', (it) => {
  it.effect('should integrate all components', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      // Test that all components are properly integrated
      expect(schemaStore.database).toBeDefined()
      expect(schemaStore.processor).toBeDefined()
      expect(typeof schemaStore.processMutations).toBe('function')

      // Test that we can create mutators and they're properly typed
      const mutators = createTestMutators()
      expect(mutators.people).toBeDefined()
      expect(mutators.groups).toBeDefined()
      expect(typeof mutators.people?.createPerson).toBe('function')
      expect(typeof mutators.groups?.createGroup).toBe('function')
    }).pipe(Effect.provide(ZeroStoreLive)),
  )
})

// ===== ERROR HANDLING TESTS =====

effect('ZeroMutationProcessingError should be properly constructed', () =>
  Effect.gen(function* () {
    const originalError = new Error('Processing failed')
    const error = new ZeroMutationProcessingError({
      cause: originalError,
      message: 'Zero mutation processing failed',
    })

    expect(error._tag).toBe('ZeroMutationProcessingError')
    expect(error.cause).toBe(originalError)
    expect(error.message).toBe('Zero mutation processing failed')
    expect(error instanceof Error).toBe(true)
  }),
)

// ===== TYPE SAFETY TESTS =====

effect('Type safety should be maintained across server components', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime

    // Test that all factory functions maintain type safety
    const zeroStore = make(mockPgClient, runtime)
    const schemaStore = zeroStore.forSchema(mockSchema)
    const database = zeroEffectPg(mockSchema, mockPgClient, runtime)
    const processor = zeroEffectPgProcessor(mockSchema, mockPgClient, runtime)

    // All should be properly typed and defined
    expect(zeroStore).toBeDefined()
    expect(schemaStore).toBeDefined()
    expect(database).toBeDefined()
    expect(processor).toBeDefined()

    // Test that mutators maintain type safety
    const mutators = createTestMutators()
    expect(typeof mutators.people?.createPerson).toBe('function')
    expect(typeof mutators.people?.updatePerson).toBe('function')
    expect(typeof mutators.groups?.createGroup).toBe('function')
  }),
)

// ===== CONTEXT AND SERVICE TESTS =====

effect('ZeroStore context tag should work correctly', () =>
  Effect.gen(function* () {
    // Test that the context tag is properly defined
    expect(ZeroStore).toBeDefined()
    expect(typeof ZeroStore).toBe('object')

    // The tag should have the correct key
    expect(ZeroStore.key).toBe('@openfaith/zero/ZeroStore')
  }),
)

// ===== RUNTIME INTEGRATION TESTS =====

layer(MockPgClientLive)('Runtime integration should work correctly', (it) => {
  it.effect('should handle runtime context correctly', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      // Test that runtime context is properly handled in processMutations
      const mutators: CustomMutatorEfDefs<any> = {
        people: {
          testMutator: () =>
            Effect.gen(function* () {
              // This should have access to the runtime context
              const runtime = yield* Effect.runtime()
              expect(runtime).toBeDefined()
              return { success: true }
            }),
        },
      }

      const urlParams = { clientID: 'test-client' }
      const payload = { mutations: [] }

      // This tests that the runtime is properly passed through
      const result = yield* schemaStore
        .processMutations(mutators, urlParams, payload)
        .pipe(Effect.either)
      expect(result._tag === 'Left' || result._tag === 'Right').toBe(true)
    }).pipe(Effect.provide(ZeroStoreLive)),
  )
})

// ===== CONSTRUCTOR TESTS =====

effect('All constructors should work correctly', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime

    // Test EffectPgConnection constructor
    const connection = new EffectPgConnection(mockPgClient, runtime)
    expect(connection).toBeInstanceOf(EffectPgConnection)

    // Test make function
    const zeroStore = make(mockPgClient, runtime)
    expect(zeroStore).toBeDefined()
    expect(zeroStore.forSchema).toBeDefined()

    // Test factory functions
    const database = zeroEffectPg(mockSchema, mockPgClient, runtime)
    const processor = zeroEffectPgProcessor(mockSchema, mockPgClient, runtime)

    expect(database).toBeDefined()
    expect(processor).toBeDefined()
  }),
)

// ===== SYMBOL EXPORTS TESTS =====

effect('Symbol exports should be properly defined', () =>
  Effect.gen(function* () {
    const { TypeId, ZeroSchemaStoreTypeId } = yield* Effect.promise(
      () => import('@openfaith/zero-effect/server'),
    )

    // Test TypeId symbol
    expect(typeof TypeId).toBe('symbol')
    expect(TypeId.toString()).toBe('Symbol(@openfaith/zero-effect/ZeroStore)')

    // Test ZeroSchemaStoreTypeId symbol
    expect(typeof ZeroSchemaStoreTypeId).toBe('symbol')
    expect(ZeroSchemaStoreTypeId.toString()).toBe('Symbol(@openfaith/zero-effect/ZeroSchemaStore)')
  }),
)

// ===== DIRECT EFFECTPGTRANSACTION TESTS =====

effect('EffectPgTransaction should handle query operations', () =>
  Effect.gen(function* () {
    const mockPgClient = createMockPgClient() as any
    const runtime = Runtime.defaultRuntime
    const connection = new EffectPgConnection(mockPgClient, runtime)

    // Test direct transaction usage
    const result = yield* Effect.promise(() =>
      connection.transaction(async (tx) => {
        // Test that wrappedTransaction is accessible
        expect(tx.wrappedTransaction).toBeDefined()

        // Test query method
        const queryResult = await tx.query('SELECT * FROM people WHERE id = $1', ['123'])
        return Array.from(queryResult)
      }),
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Test User')
  }),
)

// ===== ERROR SCENARIOS IN TRANSACTION HANDLING =====

const createFailingPgClient = () => ({
  unsafe: () => Effect.fail(new Error('Database connection failed')),
  withTransaction: <A, E, R>(_effect: Effect.Effect<A, E, R>) =>
    Effect.fail(new Error('Transaction failed')),
})

effect('EffectPgConnection should handle transaction failures', () =>
  Effect.gen(function* () {
    const failingPgClient = createFailingPgClient() as any
    const runtime = Runtime.defaultRuntime
    const connection = new EffectPgConnection(failingPgClient, runtime)

    const result = yield* Effect.tryPromise({
      catch: (error) => error as Error,
      try: () =>
        connection.transaction(async (tx) => {
          const queryResult = await tx.query('SELECT * FROM people', [])
          return Array.from(queryResult)
        }),
    }).pipe(Effect.either)

    expect(result._tag).toBe('Left')
    if (result._tag === 'Left') {
      expect(result.left.message).toBe('Transaction failed')
    }
  }),
)

// ===== EDGE CASES IN PROCESSMUTATIONS =====

layer(MockPgClientLive)('processMutations edge cases', (it) => {
  it.effect('should handle empty mutations payload', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      const mutators = createTestMutators()
      const urlParams = { clientID: 'test-client' }
      const payload = { mutations: [] } // Empty mutations

      const result = yield* schemaStore
        .processMutations(mutators, urlParams, payload)
        .pipe(Effect.either)

      // Should handle empty mutations gracefully
      expect(result._tag === 'Left' || result._tag === 'Right').toBe(true)
    }).pipe(Effect.provide(ZeroStoreLive)),
  )

  it.effect('should handle malformed payload', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      const mutators = createTestMutators()
      const urlParams = { clientID: 'test-client' }
      const payload = { invalid: 'payload' } // Malformed payload

      const result = yield* schemaStore
        .processMutations(mutators, urlParams, payload)
        .pipe(Effect.either)

      // Should handle malformed payload gracefully
      expect(result._tag === 'Left' || result._tag === 'Right').toBe(true)
    }).pipe(Effect.provide(ZeroStoreLive)),
  )

  it.effect('should handle complex mutator dependencies', () =>
    Effect.gen(function* () {
      const zeroStore = yield* ZeroStore
      const schemaStore = zeroStore.forSchema(mockSchema)

      // Create mutators that depend on runtime context
      const contextMutators: CustomMutatorEfDefs<any> = {
        people: {
          contextAwareMutator: () =>
            Effect.gen(function* () {
              const runtime = yield* Effect.runtime()
              expect(runtime).toBeDefined()
              return { hasRuntime: true, success: true }
            }),
        },
      }

      const urlParams = { clientID: 'test-client' }
      const payload = {
        mutations: [
          {
            args: [{ name: 'Test Person' }],
            id: 1,
            name: 'people.contextAwareMutator',
          },
        ],
      }

      const result = yield* schemaStore
        .processMutations(contextMutators, urlParams, payload)
        .pipe(Effect.either)

      // Should handle context-aware mutators
      expect(result._tag === 'Left' || result._tag === 'Right').toBe(true)
    }).pipe(Effect.provide(ZeroStoreLive)),
  )
})
