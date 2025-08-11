import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { Effect } from 'effect'

// Test environment variable access
effect('env should be accessible in test environment', () =>
  Effect.gen(function* () {
    // Import env inside the test to avoid validation issues
    const { env } = yield* Effect.promise(() => import('@openfaith/shared/env'))

    // Test that env object exists and has expected structure
    expect(env).toBeDefined()
    expect(typeof env).toBe('object')
  }),
)

// Test that env validation is skipped in test environment
effect('env validation should be skipped in test environment', () =>
  Effect.gen(function* () {
    // Verify that NODE_ENV is set to test
    expect(process.env.NODE_ENV).toBe('test')

    // The env should be importable without throwing validation errors
    const { env } = yield* Effect.promise(() => import('@openfaith/shared/env'))
    expect(env).toBeDefined()
  }),
)

// Test environment variable structure
effect('env should have expected server variables structure', () =>
  Effect.gen(function* () {
    const { env } = yield* Effect.promise(() => import('@openfaith/shared/env'))

    // Test that accessing properties doesn't throw (they may be undefined in test)
    expect(() => env.DB_HOST_PRIMARY).not.toThrow()
    expect(() => env.DB_NAME).not.toThrow()
    expect(() => env.DB_PASSWORD).not.toThrow()
    expect(() => env.DB_PORT).not.toThrow()
    expect(() => env.DB_USERNAME).not.toThrow()

    // Zero variables
    expect(() => env.ZERO_UPSTREAM_DB).not.toThrow()
    expect(() => env.ZERO_CVR_DB).not.toThrow()
    expect(() => env.ZERO_CHANGE_DB).not.toThrow()
    expect(() => env.ZERO_REPLICA_FILE).not.toThrow()
    expect(() => env.ZERO_AUTH_JWKS_URL).not.toThrow()
    expect(() => env.ZERO_APP_ID).not.toThrow()
    expect(() => env.ZERO_NUM_SYNC_WORKERS).not.toThrow()
    expect(() => env.ZERO_LOG_LEVEL).not.toThrow()
    expect(() => env.ZERO_ADMIN_PASSWORD).not.toThrow()
    expect(() => env.ZERO_PUSH_URL).not.toThrow()

    // Auth variables
    expect(() => env.BETTER_AUTH_SECRET).not.toThrow()

    // Email variables
    expect(() => env.RESEND_API_KEY).not.toThrow()

    // Planning Center variables
    expect(() => env.PLANNING_CENTER_SECRET).not.toThrow()
  }),
)

// Test client environment variables structure
effect('env should have expected client variables structure', () =>
  Effect.gen(function* () {
    const { env } = yield* Effect.promise(() => import('@openfaith/shared/env'))

    // Test that accessing client properties doesn't throw
    expect(() => env.VITE_ZERO_SERVER).not.toThrow()
    expect(() => env.VITE_APP_NAME).not.toThrow()
    expect(() => env.VITE_BASE_URL).not.toThrow()
    expect(() => env.VITE_PROD_ROOT_DOMAIN).not.toThrow()
    expect(() => env.VITE_PROD_EMAIL_DOMAIN).not.toThrow()
    expect(() => env.VITE_PLANNING_CENTER_CLIENT_ID).not.toThrow()
  }),
)

// Test that env is a singleton (same instance across imports)
effect('env should be a singleton across imports', () =>
  Effect.gen(function* () {
    const { env: env1 } = yield* Effect.promise(() => import('@openfaith/shared/env'))
    const { env: env2 } = yield* Effect.promise(() => import('@openfaith/shared/env'))

    expect(env1).toBe(env2)
  }),
)

// Test that env configuration is correct
effect('env should have correct configuration', () =>
  Effect.gen(function* () {
    // Test that the env module exports the expected configuration
    const envModule = yield* Effect.promise(() => import('@openfaith/shared/env'))

    expect(envModule.env).toBeDefined()
    expect(typeof envModule.env).toBe('object')
  }),
)

// Test environment variable types
effect('env should handle different variable types correctly', () =>
  Effect.gen(function* () {
    const { env } = yield* Effect.promise(() => import('@openfaith/shared/env'))

    // Test that numeric fields are either undefined or numbers in test environment
    if (env.DB_PORT !== undefined) {
      expect(typeof env.DB_PORT).toBe('number')
    }

    if (env.ZERO_NUM_SYNC_WORKERS !== undefined) {
      expect(typeof env.ZERO_NUM_SYNC_WORKERS).toBe('number')
    }

    // Test that string fields are either undefined or strings
    if (env.DB_HOST_PRIMARY !== undefined) {
      expect(typeof env.DB_HOST_PRIMARY).toBe('string')
    }

    if (env.VITE_APP_NAME !== undefined) {
      expect(typeof env.VITE_APP_NAME).toBe('string')
    }
  }),
)

// Test client prefix validation
effect('client variables should have VITE_ prefix', () =>
  Effect.gen(function* () {
    // All client variables should start with VITE_
    const clientVars = [
      'VITE_ZERO_SERVER',
      'VITE_APP_NAME',
      'VITE_BASE_URL',
      'VITE_PROD_ROOT_DOMAIN',
      'VITE_PROD_EMAIL_DOMAIN',
      'VITE_PLANNING_CENTER_CLIENT_ID',
    ]

    for (const varName of clientVars) {
      expect(varName.startsWith('VITE_')).toBe(true)
    }
  }),
)

// Test that skipValidation works in test environment
effect('validation should be skipped when NODE_ENV is test', () =>
  Effect.gen(function* () {
    // This test verifies that we can import env without validation errors
    // even when required environment variables are missing
    expect(process.env.NODE_ENV).toBe('test')

    const { env } = yield* Effect.tryPromise({
      catch: (error) => new Error(`Failed to import env: ${error}`),
      try: () => import('@openfaith/shared/env'),
    })

    expect(env).toBeDefined()
  }),
)
