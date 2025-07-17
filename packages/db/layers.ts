import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { PgClient } from '@effect/sql-pg'
import { env } from '@openfaith/shared'
import { Boolean, Effect, Layer, pipe, Redacted } from 'effect'
import type postgres from 'postgres'

export const PgLive = PgClient.layer({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: Redacted.make(env.DB_PASSWORD),
  port: env.DB_PORT,
  ssl: pipe(
    env.DB_HOST_PRIMARY === '127.0.0.1',
    Boolean.match({
      onFalse: () => ({ rejectUnauthorized: false }),
      onTrue: () => false,
    }),
  ),
  username: env.DB_USERNAME,
})

export const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive))
export const DBLive = Layer.mergeAll(PgLive, DrizzleLive)

/**
 * Extract the underlying postgres connection from the Effect PgClient.
 * This is useful when you need direct access to the postgres client for
 * operations not covered by the Effect SQL API.
 *
 * Note: This accesses internal implementation details and should be used sparingly.
 */
export const getPostgresConnection = Effect.gen(function* () {
  const pgClient = yield* PgClient.PgClient

  // Access the underlying postgres connection through the acquirer
  const connection = yield* pgClient.reserve

  // The connection has a 'pg' property that contains the postgres client
  const postgresClient: postgres.Sql = (connection as any).pg

  return postgresClient
})
