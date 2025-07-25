import { expect } from 'bun:test'
import {
  AdapterEntityManifest,
  SyncResult,
  TokenResponse,
} from '@openfaith/adapter-core/layers/adapterOperations'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'

effect('TokenResponse schema should validate valid token data', () =>
  Effect.gen(function* () {
    const validTokenData = {
      accessToken: 'abc123',
      createdAt: 1640995200000,
      expiresIn: 3600,
      refreshToken: 'refresh123',
      tokenType: 'Bearer',
    }

    const result = yield* Schema.decodeUnknown(TokenResponse)(validTokenData)
    expect(result).toEqual(validTokenData)
  }),
)

effect('TokenResponse schema should reject invalid token data', () =>
  Effect.gen(function* () {
    const invalidTokenData = {
      accessToken: 'abc123',
      createdAt: 'invalid-timestamp',
      expiresIn: 3600,
      refreshToken: 'refresh123',
      tokenType: 'Bearer',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(TokenResponse)(invalidTokenData))
    expect(result._tag).toBe('Failure')
  }),
)

effect('TokenResponse schema should reject missing required fields', () =>
  Effect.gen(function* () {
    const incompleteTokenData = {
      accessToken: 'abc123',
      createdAt: 1640995200000,
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(TokenResponse)(incompleteTokenData))
    expect(result._tag).toBe('Failure')
  }),
)

effect('TokenResponse schema should accept extra fields (Effect Schema default behavior)', () =>
  Effect.gen(function* () {
    const tokenDataWithExtra = {
      accessToken: 'abc123',
      createdAt: 1640995200000,
      expiresIn: 3600,
      extraField: 'should-be-ignored',
      refreshToken: 'refresh123',
      tokenType: 'Bearer',
    }

    const result = yield* Schema.decodeUnknown(TokenResponse)(tokenDataWithExtra)
    expect(result.accessToken).toBe('abc123')
    expect(result.expiresIn).toBe(3600)
  }),
)

effect('AdapterEntityManifest schema should validate valid manifest data', () =>
  Effect.gen(function* () {
    const validManifestData = {
      Group: {
        endpoint: '/groups',
        endpoints: {
          list: '/groups',
        },
        entity: 'Group',
        skipSync: true,
      },
      Person: {
        endpoint: '/people',
        endpoints: {
          create: '/people',
          delete: '/people/{id}',
          list: '/people',
          update: '/people/{id}',
        },
        entity: 'Person',
        skipSync: false,
        transformer: { type: 'pco-person' },
      },
    }

    const result = yield* Schema.decodeUnknown(AdapterEntityManifest)(validManifestData)
    expect(result).toEqual(validManifestData)
  }),
)

effect('AdapterEntityManifest schema should handle optional transformer field', () =>
  Effect.gen(function* () {
    const manifestWithoutTransformer = {
      Person: {
        endpoint: '/people',
        endpoints: {
          list: '/people',
        },
        entity: 'Person',
        skipSync: false,
      },
    }

    const result = yield* Schema.decodeUnknown(AdapterEntityManifest)(manifestWithoutTransformer)
    expect(result.Person?.transformer).toBeUndefined()
  }),
)

effect('AdapterEntityManifest schema should reject invalid manifest structure', () =>
  Effect.gen(function* () {
    const invalidManifestData = {
      Person: {
        endpoint: '/people',
        entity: 'Person',
        skipSync: 'not-a-boolean',
      },
    }

    const result = yield* Effect.exit(
      Schema.decodeUnknown(AdapterEntityManifest)(invalidManifestData),
    )
    expect(result._tag).toBe('Failure')
  }),
)

effect('AdapterEntityManifest schema should reject missing required fields', () =>
  Effect.gen(function* () {
    const incompleteManifestData = {
      Person: {
        endpoint: '/people',
      },
    }

    const result = yield* Effect.exit(
      Schema.decodeUnknown(AdapterEntityManifest)(incompleteManifestData),
    )
    expect(result._tag).toBe('Failure')
  }),
)

effect('SyncResult schema should validate valid sync result data', () =>
  Effect.gen(function* () {
    const validSyncResultData = {
      entityName: 'Person',
      error: 'Validation failed',
      externalId: 'ext-123',
      operation: 'create',
      success: false,
    }

    const result = yield* Schema.decodeUnknown(SyncResult)(validSyncResultData)
    expect(result).toEqual(validSyncResultData)
  }),
)

effect('SyncResult schema should handle optional error field', () =>
  Effect.gen(function* () {
    const syncResultWithoutError = {
      entityName: 'Person',
      externalId: 'ext-123',
      operation: 'update',
      success: true,
    }

    const result = yield* Schema.decodeUnknown(SyncResult)(syncResultWithoutError)
    expect(result.error).toBeUndefined()
    expect(result.success).toBe(true)
  }),
)

effect('SyncResult schema should reject invalid sync result data', () =>
  Effect.gen(function* () {
    const invalidSyncResultData = {
      entityName: 'Person',
      externalId: 'ext-123',
      operation: 'create',
      success: 'not-a-boolean',
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(SyncResult)(invalidSyncResultData))
    expect(result._tag).toBe('Failure')
  }),
)

effect('SyncResult schema should reject missing required fields', () =>
  Effect.gen(function* () {
    const incompleteSyncResultData = {
      entityName: 'Person',
      success: true,
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(SyncResult)(incompleteSyncResultData))
    expect(result._tag).toBe('Failure')
  }),
)

effect('TokenResponse schema should handle edge case values', () =>
  Effect.gen(function* () {
    const edgeCaseTokenData = {
      accessToken: '',
      createdAt: 0,
      expiresIn: -1,
      refreshToken: '',
      tokenType: '',
    }

    const result = yield* Schema.decodeUnknown(TokenResponse)(edgeCaseTokenData)
    expect(result.accessToken).toBe('')
    expect(result.createdAt).toBe(0)
    expect(result.expiresIn).toBe(-1)
  }),
)

effect('AdapterEntityManifest schema should handle complex endpoint structures', () =>
  Effect.gen(function* () {
    const complexManifestData = {
      Person: {
        endpoint: '/people',
        endpoints: {
          create: { method: 'POST', url: '/people' },
          list: { method: 'GET', url: '/people' },
          nested: {
            deep: {
              value: 'complex-structure',
            },
          },
        },
        entity: 'Person',
        skipSync: false,
        transformer: {
          config: {
            mapping: ['field1', 'field2'],
            options: { strict: true },
          },
          type: 'complex',
        },
      },
    }

    const result = yield* Schema.decodeUnknown(AdapterEntityManifest)(complexManifestData)
    const personEndpoints = result.Person?.endpoints as any
    expect(personEndpoints?.nested?.deep?.value).toBe('complex-structure')
  }),
)

effect('SyncResult schema should handle various operation types', () =>
  Effect.gen(function* () {
    const operations = ['create', 'update', 'delete', 'sync', 'custom-operation']

    for (const operation of operations) {
      const syncResultData = {
        entityName: 'TestEntity',
        externalId: 'test-id',
        operation,
        success: true,
      }

      const result = yield* Schema.decodeUnknown(SyncResult)(syncResultData)
      expect(result.operation).toBe(operation)
    }
  }),
)

effect('Schema encoding should work correctly for TokenResponse', () =>
  Effect.gen(function* () {
    const tokenData = {
      accessToken: 'test-token',
      createdAt: 1640995200000,
      expiresIn: 7200,
      refreshToken: 'test-refresh',
      tokenType: 'Bearer',
    }

    const decoded = yield* Schema.decodeUnknown(TokenResponse)(tokenData)
    const encoded = yield* Schema.encode(TokenResponse)(decoded)
    expect(encoded).toEqual(tokenData)
  }),
)

effect('Schema encoding should work correctly for AdapterEntityManifest', () =>
  Effect.gen(function* () {
    const manifestData = {
      TestEntity: {
        endpoint: '/test',
        endpoints: {
          list: '/test',
        },
        entity: 'TestEntity',
        skipSync: true,
      },
    }

    const decoded = yield* Schema.decodeUnknown(AdapterEntityManifest)(manifestData)
    const encoded = yield* Schema.encode(AdapterEntityManifest)(decoded)
    expect(encoded).toEqual(manifestData)
  }),
)

effect('Schema encoding should work correctly for SyncResult', () =>
  Effect.gen(function* () {
    const syncResultData = {
      entityName: 'TestEntity',
      error: 'Test error',
      externalId: 'test-123',
      operation: 'test-op',
      success: false,
    }

    const decoded = yield* Schema.decodeUnknown(SyncResult)(syncResultData)
    const encoded = yield* Schema.encode(SyncResult)(decoded)
    expect(encoded).toEqual(syncResultData)
  }),
)

effect('Schema should provide proper error messages for validation failures', () =>
  Effect.gen(function* () {
    const invalidData = {
      accessToken: 123,
      createdAt: 'invalid',
      expiresIn: 'invalid',
      refreshToken: null,
      tokenType: true,
    }

    const result = yield* Effect.exit(Schema.decodeUnknown(TokenResponse)(invalidData))

    expect(result._tag).toBe('Failure')
    if (result._tag === 'Failure') {
      expect(result.cause).toBeDefined()
    }
  }),
)
