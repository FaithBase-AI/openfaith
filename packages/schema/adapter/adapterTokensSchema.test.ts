import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { AdapterToken, BaseAdapterToken } from './adapterTokensSchema'

effect('BaseAdapterToken should have system fields and token-specific fields', () =>
  Effect.gen(function* () {
    // Test that BaseAdapterToken has the expected fields
    const testData = {
      // Token-specific fields
      accessToken: 'test-access-token',
      adapter: 'pco',
      // System fields
      createdAt: '2024-01-01T00:00:00Z',
      customFields: [],
      expiresIn: 3600,
      refreshToken: 'test-refresh-token',
      status: 'active' as const,
      tags: [],
      tokenCreatedAt: 1704067200, // epoch seconds
      updatedAt: '2024-01-01T00:00:00Z',
    }

    // Should decode successfully
    const decoded = yield* Schema.decodeUnknown(BaseAdapterToken)(testData)

    expect(decoded.accessToken).toBe('test-access-token')
    expect(decoded.adapter).toBe('pco')
    expect(decoded.expiresIn).toBe(3600)
    expect(decoded.refreshToken).toBe('test-refresh-token')
    expect(decoded.tokenCreatedAt).toBe(1704067200)
    expect(decoded.status).toBe('active')
    expect(decoded.createdAt).toBe('2024-01-01T00:00:00Z')
  }),
)

effect('AdapterToken should have all BaseAdapterToken fields plus identification fields', () =>
  Effect.gen(function* () {
    // Test that AdapterToken has the expected fields
    const testData = {
      // Token-specific fields
      accessToken: 'test-access-token',
      adapter: 'pco',
      // System fields
      createdAt: '2024-01-01T00:00:00Z',
      customFields: [],
      expiresIn: 3600,
      externalIds: [{ id: 'external_123', type: 'pco' }],

      // Identification fields
      id: 'token_123',
      orgId: 'org_456',
      refreshToken: 'test-refresh-token',
      status: 'active' as const,
      tags: [],
      tokenCreatedAt: 1704067200,
      updatedAt: '2024-01-01T00:00:00Z',
    }

    // Should decode successfully
    const decoded = yield* Schema.decodeUnknown(AdapterToken)(testData)

    // Check token fields
    expect(decoded.accessToken).toBe('test-access-token')
    expect(decoded.adapter).toBe('pco')
    expect(decoded.expiresIn).toBe(3600)
    expect(decoded.refreshToken).toBe('test-refresh-token')
    expect(decoded.tokenCreatedAt).toBe(1704067200)

    // Check system fields
    expect(decoded.status).toBe('active')
    expect(decoded.createdAt).toBe('2024-01-01T00:00:00Z')

    // Check identification fields
    expect(decoded.id).toBe('token_123')
    expect(decoded.orgId).toBe('org_456')
    expect(decoded.externalIds).toEqual([{ id: 'external_123', type: 'pco' }])
  }),
)

effect('AdapterToken should validate required fields', () =>
  Effect.gen(function* () {
    const incompleteData = {
      accessToken: 'test-access-token',
      // Missing required fields
    }

    // Should fail validation
    const result = yield* Schema.decodeUnknown(AdapterToken)(incompleteData).pipe(Effect.either)

    expect(result._tag).toBe('Left')
  }),
)

effect('BaseAdapterToken and AdapterToken should be classes', () =>
  Effect.gen(function* () {
    // Test that they are proper classes
    expect(typeof BaseAdapterToken).toBe('function')
    expect(typeof AdapterToken).toBe('function')

    // Test that they have the expected names
    expect(BaseAdapterToken.name).toBe('BaseAdapterToken')
    expect(AdapterToken.name).toBe('AdapterToken')
  }),
)
