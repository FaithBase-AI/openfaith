import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { PgClient } from '@effect/sql-pg'
import { schema } from '@openfaith/db/schema/schema'
import { env } from '@openfaith/shared'
import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'
import { Boolean, Layer, pipe, Redacted } from 'effect'

const connection = new SQL({
  host: env.DB_HOST_PRIMARY,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  database: env.DB_NAME,
  ssl: pipe(
    env.DB_HOST_PRIMARY === '127.0.0.1',
    Boolean.match({
      onFalse: () => ({ rejectUnauthorized: false }),
      onTrue: () => false,
    }),
  ),
})

export const PgLive = PgClient.layer({
  host: env.DB_HOST_PRIMARY,
  username: env.DB_USERNAME,
  password: Redacted.make(env.DB_PASSWORD),
  port: env.DB_PORT,
  database: env.DB_NAME,
  ssl: pipe(
    env.DB_HOST_PRIMARY === '127.0.0.1',
    Boolean.match({
      onFalse: () => ({ rejectUnauthorized: false }),
      onTrue: () => false,
    }),
  ),
})

export const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive))
export const DBLive = Layer.mergeAll(PgLive, DrizzleLive)

export const db = drizzle(connection, {
  schema: schema,
})
