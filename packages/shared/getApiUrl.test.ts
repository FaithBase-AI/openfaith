import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect } from 'effect'

// Test basic API URL generation
effect('getApiUrl should generate correct API URLs', () =>
  Effect.gen(function* () {
    // Mock the environment variable for testing
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'https://example.com',
    }

    const result = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        // Clear module cache to get fresh import with test env
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          return getApiUrl('/users')
        }),
      () =>
        Effect.sync(() => {
          // Restore original environment
          process.env = originalEnv
        }),
    )

    expect(result).toBe('https://example.com/api/users')
  }),
)

// Test API URL with different paths
effect('getApiUrl should handle different path formats', () =>
  Effect.gen(function* () {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'http://localhost:3000',
    }

    const testCases = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          return [
            { expected: 'http://localhost:3000/api/users', path: '/users' },
            {
              expected: 'http://localhost:3000/api/auth/login',
              path: '/auth/login',
            },
            { expected: 'http://localhost:3000/api/v1/data', path: '/v1/data' },
            { expected: 'http://localhost:3000/api/health', path: '/health' },
            {
              expected: 'http://localhost:3000/api/users/123/profile',
              path: '/users/123/profile',
            },
          ].map(({ path, expected }) => ({
            actual: getApiUrl(path as `/${string}`),
            expected,
            path,
          }))
        }),
      () =>
        Effect.sync(() => {
          process.env = originalEnv
        }),
    )

    for (const testCase of testCases) {
      expect(testCase.actual).toBe(testCase.expected)
    }
  }),
)

// Test API URL with query parameters and fragments (should be preserved)
effect('getApiUrl should preserve path structure', () =>
  Effect.gen(function* () {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'https://api.example.com',
    }

    const result = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          return getApiUrl('/users/search')
        }),
      () =>
        Effect.sync(() => {
          process.env = originalEnv
        }),
    )

    expect(result).toBe('https://api.example.com/api/users/search')
  }),
)

// Test API URL with trailing slash in base URL
effect('getApiUrl should handle base URL with trailing slash', () =>
  Effect.gen(function* () {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'https://example.com/',
    }

    const result = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          return getApiUrl('/users')
        }),
      () =>
        Effect.sync(() => {
          process.env = originalEnv
        }),
    )

    expect(result).toBe('https://example.com//api/users')
  }),
)

// Test API URL with different protocols
effect('getApiUrl should work with different protocols', () =>
  Effect.gen(function* () {
    const protocols = ['http', 'https']

    for (const protocol of protocols) {
      const originalEnv = process.env
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        VITE_BASE_URL: `${protocol}://example.com`,
      }

      const result = yield* Effect.acquireUseRelease(
        Effect.sync(() => {
          delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
          delete require.cache[require.resolve('@openfaith/shared/env')]
          return true
        }),
        () =>
          Effect.sync(() => {
            const { getApiUrl } = require('@openfaith/shared/getApiUrl')
            return getApiUrl('/test')
          }),
        () =>
          Effect.sync(() => {
            process.env = originalEnv
          }),
      )

      expect(result).toBe(`${protocol}://example.com/api/test`)
    }
  }),
)

// Test API URL with port numbers
effect('getApiUrl should handle URLs with port numbers', () =>
  Effect.gen(function* () {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'http://localhost:8080',
    }

    const result = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          return getApiUrl('/api-test')
        }),
      () =>
        Effect.sync(() => {
          process.env = originalEnv
        }),
    )

    expect(result).toBe('http://localhost:8080/api/api-test')
  }),
)

// Test that path parameter must start with slash
effect('getApiUrl should enforce path starts with slash', () =>
  Effect.gen(function* () {
    // This test verifies the TypeScript type constraint
    // The function signature requires `/${string}` which enforces the leading slash

    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'https://example.com',
    }

    const result = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          // This should work fine as it starts with /
          return getApiUrl('/valid-path')
        }),
      () =>
        Effect.sync(() => {
          process.env = originalEnv
        }),
    )

    expect(result).toBe('https://example.com/api/valid-path')
  }),
)

// Test API URL with complex paths
effect('getApiUrl should handle complex nested paths', () =>
  Effect.gen(function* () {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'https://api.example.com',
    }

    const complexPaths = [
      '/users/123/posts/456/comments',
      '/organizations/abc/members/def/roles',
      '/v2/admin/settings/permissions',
      '/webhooks/github/push',
      '/auth/oauth/callback',
    ]

    const results = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          return complexPaths.map((path) => ({
            expected: `https://api.example.com/api${path}`,
            path,
            result: getApiUrl(path as `/${string}`),
          }))
        }),
      () =>
        Effect.sync(() => {
          process.env = originalEnv
        }),
    )

    for (const { result, expected } of results) {
      expect(result).toBe(expected)
    }
  }),
)

// Test function behavior with empty path
effect('getApiUrl should handle root API path', () =>
  Effect.gen(function* () {
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      VITE_BASE_URL: 'https://example.com',
    }

    const result = yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        delete require.cache[require.resolve('@openfaith/shared/getApiUrl')]
        delete require.cache[require.resolve('@openfaith/shared/env')]
        return true
      }),
      () =>
        Effect.sync(() => {
          const { getApiUrl } = require('@openfaith/shared/getApiUrl')
          return getApiUrl('/')
        }),
      () =>
        Effect.sync(() => {
          process.env = originalEnv
        }),
    )

    expect(result).toBe('https://example.com/api/')
  }),
)
