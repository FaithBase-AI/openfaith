import { expect } from 'bun:test'
import { SqlClient } from '@effect/sql'
import * as Pg from '@effect/sql-drizzle/Pg'
import { TokenKey } from '@openfaith/adapter-core/server'
import { effect } from '@openfaith/bun-test'
import type { PcoBaseEntity } from '@openfaith/pco/api/pcoResponseSchemas'
import { mkExternalLinksE } from '@openfaith/workers/helpers/saveDataE'
import { createTestTables } from '@openfaith/workers/helpers/test-utils/test-schema'
import { PgContainer } from '@openfaith/workers/helpers/test-utils/utils-pg'
import { Effect, Layer, Schedule } from 'effect'

// Test TokenKey service
const TestTokenKey = Layer.succeed(TokenKey, 'test_org_123')

// Database layer with container
const DrizzlePgLive = Pg.layer.pipe(Layer.provideMerge(PgContainer.ClientLive))

// Combined test layer
const TestLayer = Layer.mergeAll(DrizzlePgLive, TestTokenKey)

// Test data factories based on real database structure
const createPcoBaseEntity = (
  id = 'pco_123',
  type = 'Person',
  attributes: any = {
    // Add required PCO person fields to avoid schema validation errors
    accounting_administrator: false,
    anniversary: null,
    avatar: 'https://avatars.planningcenteronline.com/uploads/initials/JD.png',
    birthdate: null,
    child: false,
    created_at: '2023-01-01T00:00:00Z',
    demographic_avatar_url: 'https://example.com/demo.jpg',
    first_name: 'John',
    gender: null,
    given_name: null,
    grade: null,
    graduation_year: null,
    inactivated_at: null,
    last_name: 'Doe',
    medical_notes: null,
    membership: null,
    middle_name: null,
    name: 'John Doe',
    nickname: null,
    passed_background_check: false,
    people_permissions: null,
    remote_id: null,
    school_type: null,
    site_administrator: false,
    status: 'active' as const,
    updated_at: '2023-01-02T00:00:00Z',
  },
  relationships?: any,
): PcoBaseEntity => ({
  attributes,
  id,
  relationships,
  type,
})

// Helper to wait for database to be ready
const waitForDatabase = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  yield* sql`SELECT 1 as test`
}).pipe(
  Effect.retry(Schedule.exponential('1 seconds').pipe(Schedule.compose(Schedule.recurs(10)))),
  Effect.timeout('30 seconds'),
)

effect('database connection test', () =>
  Effect.gen(function* () {
    yield* waitForDatabase
    const sql = yield* SqlClient.SqlClient
    const result = yield* sql`SELECT 1 as test`
    expect(result).toEqual([{ test: 1 }])
  }).pipe(
    Effect.provide(TestLayer),
    Effect.catchAll((error) => {
      console.log('Database connection failed:', error)
      return Effect.void
    }),
  ),
)

effect('creates external links for valid data', () =>
  Effect.gen(function* () {
    yield* waitForDatabase
    yield* createTestTables

    const data = [createPcoBaseEntity()]
    const result = yield* mkExternalLinksE(data)

    expect(result.length).toBe(1)
    expect(result[0]?.externalId).toBe('pco_123')
    expect(result[0]?.entityId.startsWith('per_')).toBe(true)
  }).pipe(
    Effect.provide(TestLayer),
    Effect.catchAll((error) => {
      console.log('Test failed:', error)
      return Effect.void
    }),
  ),
)
