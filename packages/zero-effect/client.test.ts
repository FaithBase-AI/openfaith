import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  type CustomMutatorEfDefs,
  convertEffectMutatorsToPromise,
  createEffectTransaction,
  EffectTransaction,
  ZeroMutationProcessingError,
  ZeroMutatorAuthError,
  ZeroMutatorDatabaseError,
  ZeroMutatorValidationError,
} from '@openfaith/zero-effect/client'
import { Effect, Layer, Runtime } from 'effect'

// ===== MOCK ZERO TRANSACTION =====

const createMockTransaction = (shouldFail = false) =>
  ({
    mutate: {
      groups: {
        create: (data: any) => {
          if (shouldFail) throw new Error('Group creation failed')
          return Promise.resolve({ id: 'new_group_123', ...data })
        },
      },
      people: {
        create: (data: any) => {
          if (shouldFail) throw new Error('Database connection failed')
          return Promise.resolve({ id: 'new_person_123', ...data })
        },
        delete: () => {
          if (shouldFail) throw new Error('Delete failed')
          return Promise.resolve(undefined)
        },
        update: (data: any) => {
          if (shouldFail) throw new Error('Update failed')
          return Promise.resolve({ id: data.id, ...data })
        },
      },
    },
    query: {
      groups: {
        all: () => {
          if (shouldFail) throw new Error('Query failed')
          return Promise.resolve([
            {
              description: 'A test group',
              id: 'group_123',
              name: 'Test Group',
            },
          ])
        },
      },
      people: {
        all: () => {
          if (shouldFail) throw new Error('Query failed')
          return Promise.resolve([{ email: 'john@example.com', id: '1', name: 'John Doe' }])
        },
      },
    },
  }) as any

// ===== ERROR CLASS TESTS =====

effect('ZeroMutatorAuthError should be properly constructed', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const error = new ZeroMutatorAuthError({
      message: 'User not authenticated',
    })

    expect(error._tag).toBe('ZeroMutatorAuthError')
    expect(error.message).toBe('User not authenticated')
    expect(error instanceof Error).toBe(true)
  }),
)

effect('ZeroMutatorValidationError should be properly constructed', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const error = new ZeroMutatorValidationError({
      field: 'email',
      message: 'Invalid email format',
    })

    expect(error._tag).toBe('ZeroMutatorValidationError')
    expect(error.field).toBe('email')
    expect(error.message).toBe('Invalid email format')
    expect(error instanceof Error).toBe(true)
  }),
)

effect('ZeroMutatorValidationError should handle optional field', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const error = new ZeroMutatorValidationError({
      message: 'General validation error',
    })

    expect(error._tag).toBe('ZeroMutatorValidationError')
    expect(error.field).toBeUndefined()
    expect(error.message).toBe('General validation error')
  }),
)

effect('ZeroMutatorDatabaseError should be properly constructed', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const originalError = new Error('Connection timeout')
    const error = new ZeroMutatorDatabaseError({
      cause: originalError,
      message: 'Database operation failed',
    })

    expect(error._tag).toBe('ZeroMutatorDatabaseError')
    expect(error.cause).toBe(originalError)
    expect(error.message).toBe('Database operation failed')
    expect(error instanceof Error).toBe(true)
  }),
)

effect('ZeroMutationProcessingError should be properly constructed', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const originalError = new Error('Processing failed')
    const error = new ZeroMutationProcessingError({
      cause: originalError,
      message: 'Mutation processing failed',
    })

    expect(error._tag).toBe('ZeroMutationProcessingError')
    expect(error.cause).toBe(originalError)
    expect(error.message).toBe('Mutation processing failed')
    expect(error instanceof Error).toBe(true)
  }),
)

// ===== EFFECT TRANSACTION TESTS =====

effect('createEffectTransaction should create EffectTransaction instance', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction()
    const effectTx = createEffectTransaction(mockTx)

    expect(effectTx).toBeInstanceOf(EffectTransaction)
    expect(effectTx.mutate).toBeDefined()
    expect(effectTx.query).toBeDefined()
  }),
)

effect('EffectTransaction mutate operations should return Effects', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction()
    const effectTx = createEffectTransaction(mockTx)

    // Test create mutation
    const createResult = yield* effectTx.mutate.people.create({
      email: 'john@example.com',
      name: 'John Doe',
    })

    expect(createResult.id).toBe('new_person_123')
    expect(createResult.name).toBe('John Doe')
    expect(createResult.email).toBe('john@example.com')

    // Test update mutation
    const updateResult = yield* effectTx.mutate.people.update({
      id: 'person_123',
      name: 'Jane Doe',
    })

    expect(updateResult.id).toBe('person_123')
    expect(updateResult.name).toBe('Jane Doe')

    // Test delete mutation
    const deleteResult = yield* effectTx.mutate.people.delete('person_123')
    expect(deleteResult).toBeUndefined()
  }).pipe(Effect.provide(Layer.empty)),
)

effect('EffectTransaction query operations should return Effects', () =>
  // @ts-ignore - Effect type inference issue with test framework
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction()
    const effectTx = createEffectTransaction(mockTx)

    // Test query all
    const allPeople = yield* effectTx.query.people.all()
    expect(allPeople).toHaveLength(1)
    expect(allPeople[0]?.name).toBe('John Doe')
  }),
)

effect('EffectTransaction should handle mutation errors', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction(true) // shouldFail = true
    const effectTx = createEffectTransaction(mockTx)

    const result = yield* effectTx.mutate.people
      .create({
        name: 'John Doe',
      })
      .pipe(Effect.either)

    expect(result._tag).toBe('Left')
    if (result._tag === 'Left') {
      expect(result.left).toBeInstanceOf(ZeroMutatorDatabaseError)
      expect(result.left._tag).toBe('ZeroMutatorDatabaseError')
      expect(result.left.message).toContain('Database mutation failed')
      expect(result.left.cause).toBeInstanceOf(Error)
    }
  }),
)

effect('EffectTransaction should handle query errors', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction(true) // shouldFail = true
    const effectTx = createEffectTransaction(mockTx)

    const result = yield* effectTx.query.people.all().pipe(Effect.either)

    expect(result._tag).toBe('Left')
    if (result._tag === 'Left') {
      expect(result.left).toBeInstanceOf(ZeroMutatorDatabaseError)
      expect(result.left._tag).toBe('ZeroMutatorDatabaseError')
      expect(result.left.message).toContain('Database query failed')
      expect(result.left.cause).toBeInstanceOf(Error)
    }
  }),
)

effect('EffectTransaction should handle nested object access', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction()
    const effectTx = createEffectTransaction(mockTx)

    // Test that we can access nested properties
    expect(effectTx.mutate.people).toBeDefined()
    expect(effectTx.mutate.groups).toBeDefined()
    expect(effectTx.query.people).toBeDefined()
    expect(effectTx.query.groups).toBeDefined()

    // Test that functions are properly wrapped
    const createFn = effectTx.mutate.people.create
    expect(typeof createFn).toBe('function')

    const queryFn = effectTx.query.people.all
    expect(typeof queryFn).toBe('function')
  }),
)

// ===== MUTATOR CONVERSION TESTS =====

effect('convertEffectMutatorsToPromise should handle empty mutators', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const effectMutators: CustomMutatorEfDefs<any> = {}
    const runtime = Runtime.defaultRuntime
    const promiseMutators = convertEffectMutatorsToPromise(effectMutators, runtime)

    expect(promiseMutators).toEqual({})
  }),
)

effect('convertEffectMutatorsToPromise should handle undefined table mutators', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const effectMutators: CustomMutatorEfDefs<any> = {
      groups: {
        createGroup: () => Effect.succeed({ id: 'group_123', name: 'Test Group' }),
      },
      people: undefined,
    }
    const runtime = Runtime.defaultRuntime
    const promiseMutators = convertEffectMutatorsToPromise(effectMutators, runtime)

    expect(promiseMutators.people).toBeUndefined()
    expect(promiseMutators.groups).toBeDefined()
    expect(typeof (promiseMutators as any).groups?.createGroup).toBe('function')
  }),
)

// ===== INTEGRATION TESTS =====

effect('Full mutator workflow should work end-to-end', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction()
    const effectTx = createEffectTransaction(mockTx)

    // Test a complete workflow: create, query, update, delete
    const createResult = yield* effectTx.mutate.people.create({
      email: 'john@example.com',
      name: 'John Doe',
    })
    expect(createResult.name).toBe('John Doe')

    const queryResult = yield* effectTx.query.people.all()
    expect(queryResult).toHaveLength(1)
    expect(queryResult[0]?.name).toBe('John Doe')

    const updateResult = yield* effectTx.mutate.people.update({
      id: createResult.id,
      name: 'Jane Doe',
    })
    expect(updateResult.name).toBe('Jane Doe')

    const deleteResult = yield* effectTx.mutate.people.delete(createResult.id)
    expect(deleteResult).toBeUndefined()
  }),
)

effect('Error handling should work throughout the workflow', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction(true) // shouldFail = true
    const effectTx = createEffectTransaction(mockTx)

    // Test that all operations fail with proper error types
    const createResult = yield* effectTx.mutate.people
      .create({
        name: 'John Doe',
      })
      .pipe(Effect.either)

    expect(createResult._tag).toBe('Left')
    if (createResult._tag === 'Left') {
      expect(createResult.left).toBeInstanceOf(ZeroMutatorDatabaseError)
    }

    const queryResult = yield* effectTx.query.people.all().pipe(Effect.either)

    expect(queryResult._tag).toBe('Left')
    if (queryResult._tag === 'Left') {
      expect(queryResult.left).toBeInstanceOf(ZeroMutatorDatabaseError)
    }
  }),
)

// ===== TYPE SAFETY TESTS =====

effect('Type safety should be maintained', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction()
    const effectTx = createEffectTransaction(mockTx)

    // These should compile without issues and maintain type safety
    const person = yield* effectTx.mutate.people.create({
      email: 'john@example.com',
      name: 'John Doe',
    })

    // TypeScript should infer the correct types
    expect(typeof person.id).toBe('string')
    expect(typeof person.name).toBe('string')
    expect(typeof person.email).toBe('string')

    const group = yield* effectTx.mutate.groups.create({
      description: 'A test group',
      name: 'Test Group',
    })

    expect(typeof group.id).toBe('string')
    expect(typeof group.name).toBe('string')
    expect(typeof group.description).toBe('string')
  }),
)

// ===== PROXY BEHAVIOR TESTS =====

effect('EffectTransaction proxy should handle deep nesting', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction()
    const effectTx = createEffectTransaction(mockTx)

    // Test that proxy works for deeply nested properties
    expect(effectTx.mutate).toBeDefined()
    expect(effectTx.mutate.people).toBeDefined()
    expect(effectTx.mutate.people.create).toBeDefined()
    expect(typeof effectTx.mutate.people.create).toBe('function')

    expect(effectTx.query).toBeDefined()
    expect(effectTx.query.people).toBeDefined()
    expect(effectTx.query.people.all).toBeDefined()
    expect(typeof effectTx.query.people.all).toBe('function')
  }),
)

// ===== ERROR PROPAGATION TESTS =====

effect('Error propagation should work correctly', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction(true)
    const effectTx = createEffectTransaction(mockTx)

    // Test that original error is preserved in cause
    const result = yield* effectTx.mutate.people.create({ name: 'Test' }).pipe(Effect.either)

    expect(result._tag).toBe('Left')
    if (result._tag === 'Left') {
      const error = result.left as ZeroMutatorDatabaseError
      expect(error._tag).toBe('ZeroMutatorDatabaseError')
      expect(error.message).toContain('Database mutation failed')
      expect(error.cause).toBeInstanceOf(Error)
      expect((error.cause as Error).message).toBe('Database connection failed')
    }
  }),
)

effect('Query error propagation should work correctly', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = createMockTransaction(true)
    const effectTx = createEffectTransaction(mockTx)

    // Test that original error is preserved in cause for queries
    const result = yield* effectTx.query.people.all().pipe(Effect.either)

    expect(result._tag).toBe('Left')
    if (result._tag === 'Left') {
      const error = result.left as ZeroMutatorDatabaseError
      expect(error._tag).toBe('ZeroMutatorDatabaseError')
      expect(error.message).toContain('Database query failed')
      expect(error.cause).toBeInstanceOf(Error)
      expect((error.cause as Error).message).toBe('Query failed')
    }
  }),
)

// ===== PROXY EDGE CASES =====

effect('EffectTransaction proxy should handle non-function properties', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = {
      mutate: {
        people: {
          config: { timeout: 5000 }, // Non-function property
          create: () => Promise.resolve({ id: 'test' }),
        },
      },
      query: {
        people: {
          all: () => Promise.resolve([]), // Non-function property
          metadata: { version: '1.0' },
        },
      },
    } as any

    const effectTx = createEffectTransaction(mockTx)

    // Test that non-function properties are returned as-is
    expect(effectTx.mutate.people.config).toEqual({ timeout: 5000 })
    expect(effectTx.query.people.metadata).toEqual({ version: '1.0' })

    // Test that functions still work
    const createResult = yield* effectTx.mutate.people.create()
    expect(createResult.id).toBe('test')
  }),
)

effect('EffectTransaction proxy should handle null values', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = {
      mutate: {
        people: {
          create: () => Promise.resolve({ id: 'test' }),
          nullValue: null,
        },
      },
      query: {
        people: {
          all: () => Promise.resolve([]),
          nullValue: null,
        },
      },
    } as any

    const effectTx = createEffectTransaction(mockTx)

    // Test that null values are returned as-is
    expect(effectTx.mutate.people.nullValue).toBe(null)
    expect(effectTx.query.people.nullValue).toBe(null)
  }),
)

effect('EffectTransaction proxy should handle primitive values', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const mockTx = {
      mutate: {
        people: {
          count: 42,
          create: () => Promise.resolve({ id: 'test' }),
          enabled: true,
          name: 'test',
        },
      },
      query: {
        people: {
          active: false,
          all: () => Promise.resolve([]),
          limit: 100,
          tableName: 'people',
        },
      },
    } as any

    const effectTx = createEffectTransaction(mockTx)

    // Test that primitive values are returned as-is
    expect(effectTx.mutate.people.count).toBe(42)
    expect(effectTx.mutate.people.enabled).toBe(true)
    expect(effectTx.mutate.people.name).toBe('test')
    expect(effectTx.query.people.limit).toBe(100)
    expect(effectTx.query.people.active).toBe(false)
    expect(effectTx.query.people.tableName).toBe('people')
  }),
)

// ===== MUTATOR CONVERSION EDGE CASES =====

effect('convertEffectMutatorsToPromise should handle non-function values', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const effectMutators: any = {
      people: {
        config: { timeout: 5000 }, // Non-function value
        createPerson: () => Effect.succeed({ id: 'person_123' }),
        metadata: 'some string', // Non-function value
      },
    }
    const runtime = Runtime.defaultRuntime
    const promiseMutators = convertEffectMutatorsToPromise(effectMutators, runtime)

    // Non-function values should be ignored
    const peopleTable = (promiseMutators as any).people
    expect(peopleTable?.config).toBeUndefined()
    expect(peopleTable?.metadata).toBeUndefined()

    // Function values should be converted
    expect(typeof peopleTable?.createPerson).toBe('function')
  }),
)

effect('convertEffectMutatorsToPromise should handle complex nested structures', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const effectMutators: any = {
      groups: {
        createGroup: () => Effect.succeed({ id: 'group_123' }),
      },
      people: {
        actions: {
          create: () => Effect.succeed({ id: 'person_123' }), // This won't be converted (nested too deep)
        },
        createPerson: () => Effect.succeed({ id: 'person_123' }),
      },
    }
    const runtime = Runtime.defaultRuntime
    const promiseMutators = convertEffectMutatorsToPromise(effectMutators, runtime)

    // Only direct function properties should be converted
    const mutatorTables = promiseMutators as any
    expect(typeof mutatorTables.people?.createPerson).toBe('function')
    expect(typeof mutatorTables.groups?.createGroup).toBe('function')
    expect(mutatorTables.people?.actions).toBeUndefined()
  }),
)

effect('convertEffectMutatorsToPromise should handle runtime failures', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const effectMutators: CustomMutatorEfDefs<any> = {
      people: {
        failingMutator: () => Effect.fail(new Error('Mutator failed')),
      },
    }
    const runtime = Runtime.defaultRuntime
    const promiseMutators = convertEffectMutatorsToPromise(effectMutators, runtime)

    const mockTx = createMockTransaction()

    // The converted mutator should reject when the Effect fails
    const mutatorTables = promiseMutators as any
    const failingMutator = mutatorTables.people?.failingMutator
    if (failingMutator) {
      const result = yield* Effect.tryPromise({
        catch: (error) => error as Error,
        try: () => failingMutator(mockTx, { test: 'data' }),
      }).pipe(Effect.either)

      expect(result._tag).toBe('Left')
      if (result._tag === 'Left') {
        expect(result.left.message).toBe('Mutator failed')
      }
    }
  }),
)

// ===== ERROR OPTIONAL FIELDS TESTS =====

effect('ZeroMutatorDatabaseError should handle optional cause', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const error = new ZeroMutatorDatabaseError({
      message: 'Database operation failed',
    })

    expect(error._tag).toBe('ZeroMutatorDatabaseError')
    expect(error.cause).toBeUndefined()
    expect(error.message).toBe('Database operation failed')
    expect(error instanceof Error).toBe(true)
  }),
)

effect('ZeroMutationProcessingError should handle optional cause', () =>
  // @ts-ignore - Effect type inference issue with test framework
  Effect.gen(function* () {
    const error = new ZeroMutationProcessingError({
      message: 'Processing failed',
    })

    expect(error._tag).toBe('ZeroMutationProcessingError')
    expect(error.cause).toBeUndefined()
    expect(error.message).toBe('Processing failed')
    expect(error instanceof Error).toBe(true)
  }),
)
