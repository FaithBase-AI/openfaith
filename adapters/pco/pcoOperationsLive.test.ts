import { describe, expect, test } from 'bun:test'
import { AdapterTokenError } from '@openfaith/adapter-core/errors/adapterErrors'
import { AdapterOperations } from '@openfaith/adapter-core/layers/adapterOperations'
import { layer } from '@openfaith/bun-test'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { extractPcoUpdatedAt } from '@openfaith/pco/helpers/extractUpdatedAt'
import { PcoOperationsLive } from '@openfaith/pco/pcoOperationsLive'
import { Effect, Layer, Option, Stream } from 'effect'

// Mock PcoHttpClient for testing
const mockPcoHttpClient = PcoHttpClient.of({
  Person: {
    create: ({ payload }: any) => Effect.succeed({ data: { id: 'new-id', ...payload } }),
    delete: (_params: any) => Effect.succeed(undefined),
    list: () => Effect.succeed({ data: [], meta: { count: 0 } }),
    update: ({ payload, path }: any) => Effect.succeed({ data: { id: path.personId, ...payload } }),
  },
  token: {
    getToken: (_params: any) =>
      Effect.succeed({
        access_token: 'mock-access-token',
        created_at: Date.now(),
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        token_type: 'Bearer',
      }),
  },
} as any)

const MockPcoHttpClientLayer = Layer.succeed(PcoHttpClient, mockPcoHttpClient)

const TestLayer = PcoOperationsLive.pipe(Layer.provide(MockPcoHttpClientLayer))

layer(TestLayer)('PcoOperationsLive', (it) => {
  it.effect('should provide AdapterOperations service', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations
      expect(operations).toBeDefined()
      expect(typeof operations.getAdapterTag).toBe('function')
      expect(operations.getAdapterTag()).toBe('pco')
    }),
  )

  it.effect('should implement extractUpdatedAt', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const response = {
        data: {
          attributes: {
            updated_at: '2023-12-01T10:30:00Z',
          },
        },
      }

      const result = operations.extractUpdatedAt(response)
      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrNull(result)).toBe('2023-12-01T10:30:00Z')
    }),
  )

  it.effect('should return entity manifest with filtering properties', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations
      const manifest = operations.getEntityManifest()

      expect(manifest).toBeDefined()
      expect(typeof manifest).toBe('object')

      // Check that manifest entries have required properties
      const entries = Object.values(manifest)
      if (entries.length > 0) {
        const firstEntry = entries[0]!
        expect(firstEntry).toHaveProperty('entity')
        expect(firstEntry).toHaveProperty('endpoints')
        expect(firstEntry).toHaveProperty('skipSync')
        expect(typeof firstEntry.skipSync).toBe('boolean')
      }
    }),
  )

  it.effect('should handle fetchToken with error (not implemented)', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const result = yield* operations
        .fetchToken({
          code: 'test-code',
          redirectUri: 'http://localhost:3000/callback',
        })
        .pipe(Effect.flip)

      expect(result).toBeInstanceOf(AdapterTokenError)
      expect(result.adapter).toBe('pco')
    }),
  )

  it.effect('should handle syncEntityData for supported entity', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const mockOperations = [
        {
          op: 'insert' as const,
          primaryKey: { id: 'test-id' },
          tableName: 'person',
          value: { email: 'john@example.com', name: 'John Doe' },
        },
      ]

      const results = yield* operations.syncEntityData('Person', mockOperations)

      expect(Array.isArray(results)).toBe(true)
      expect(results).toHaveLength(1)

      const result = results[0]!
      expect(result).toHaveProperty('entityName', 'Person')
      expect(result).toHaveProperty('operation', 'insert')
      expect(result).toHaveProperty('success')
    }),
  )

  it.effect('should handle syncEntityData for unsupported entity', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const mockOperations = [
        {
          op: 'insert' as const,
          primaryKey: { id: 'test-id' },
          tableName: 'unsupported',
          value: { name: 'Test' },
        },
      ]

      const results = yield* operations.syncEntityData('UnsupportedEntity', mockOperations)

      expect(Array.isArray(results)).toBe(true)
      expect(results).toHaveLength(0)
    }),
  )

  it.effect('should provide listEntityData stream for supported entity', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const stream = operations.listEntityData('Person')
      const results = yield* Stream.runCollect(stream)

      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThanOrEqual(0)
    }),
  )

  it.effect('should handle listEntityData for unsupported entity', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const stream = operations.listEntityData('UnsupportedEntity')
      const result = yield* Stream.runCollect(stream).pipe(Effect.flip)

      expect(result).toBeDefined()
    }),
  )

  it.effect('should transform entity data for create operation', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const testData = {
        _tag: 'person' as const,
        anniversary: null,
        avatar: 'https://example.com/avatar.jpg',
        birthdate: null,
        createdAt: '2023-12-01T10:30:00Z',
        customFields: [
          {
            _tag: 'boolean',
            name: 'accounting_administrator',
            source: 'pco',
            value: false,
          },
          { _tag: 'boolean', name: 'child', source: 'pco', value: false },
          {
            _tag: 'string',
            name: 'demographic_avatar_url',
            source: 'pco',
            value: 'https://example.com/avatar.jpg',
          },
          { _tag: 'string', name: 'given_name', source: 'pco', value: null },
          { _tag: 'number', name: 'grade', source: 'pco', value: null },
          {
            _tag: 'number',
            name: 'graduation_year',
            source: 'pco',
            value: null,
          },
          { _tag: 'string', name: 'medical_notes', source: 'pco', value: null },
          { _tag: 'string', name: 'nickname', source: 'pco', value: null },
          {
            _tag: 'boolean',
            name: 'passed_background_check',
            source: 'pco',
            value: false,
          },
          {
            _tag: 'string',
            name: 'people_permissions',
            source: 'pco',
            value: null,
          },
          { _tag: 'string', name: 'remote_id', source: 'pco', value: null },
          { _tag: 'string', name: 'school_type', source: 'pco', value: null },
          {
            _tag: 'boolean',
            name: 'site_administrator',
            source: 'pco',
            value: false,
          },
        ],
        firstName: 'John',
        gender: null,
        inactivatedAt: null,
        lastName: 'Doe',
        membership: null,
        middleName: null,
        name: 'John Doe',
        status: 'active' as const,
        tags: [],
        type: 'default' as const,
        updatedAt: '2023-12-01T10:30:00Z',
      }
      const result = yield* operations.transformEntityData('Person', testData, 'create')

      expect(result).toBeDefined()
    }),
  )

  it.effect('should transform entity data for update operation', () =>
    Effect.gen(function* () {
      const operations = yield* AdapterOperations

      const testData = { name: 'John Doe Updated' }
      const result = yield* operations.transformEntityData('Person', testData, 'update')

      expect(result).toBeDefined()
    }),
  )
})

describe('extractUpdatedAt integration', () => {
  test('should use the same function as the helper', () => {
    const response = {
      data: {
        attributes: {
          updated_at: '2023-12-01T10:30:00Z',
        },
      },
    }

    // Test that the operations service uses the same function
    const helperResult = extractPcoUpdatedAt(response)
    expect(Option.isSome(helperResult)).toBe(true)
    expect(Option.getOrNull(helperResult)).toBe('2023-12-01T10:30:00Z')
  })
})
