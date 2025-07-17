import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { PgClient } from '@effect/sql-pg'
import { env } from '@openfaith/shared'
import { Boolean, Layer, pipe, Redacted } from 'effect'

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
