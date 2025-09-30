import * as PgDrizzle from '@effect/sql-drizzle/Pg'
import { PgClient } from '@effect/sql-pg'
import { env } from '@openfaith/shared'
import { Layer, Option, pipe, Redacted } from 'effect'

export const PgLive = PgClient.layer({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: Redacted.make(env.DB_PASSWORD),
  port: env.DB_PORT,
  ssl: false, // Disable SSL for local development
  username: env.DB_USERNAME,
})

export const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive))
export const DBLive = Layer.mergeAll(PgLive, DrizzleLive)

// Workflow DB
export const WorkflowPgLive = PgClient.layer({
  database: pipe(
    env.DB_WORKFLOW_NAME,
    Option.fromNullable,
    Option.getOrElse(() => env.DB_NAME),
  ),
  host: pipe(
    env.DB_WORKFLOW_HOST_PRIMARY,
    Option.fromNullable,
    Option.getOrElse(() => env.DB_HOST_PRIMARY),
  ),
  password: Redacted.make(
    pipe(
      env.DB_WORKFLOW_PASSWORD,
      Option.fromNullable,
      Option.getOrElse(() => env.DB_PASSWORD),
    ),
  ),
  port: pipe(
    env.DB_WORKFLOW_PORT,
    Option.fromNullable,
    Option.getOrElse(() => env.DB_PORT),
  ),
  ssl: false, // Disable SSL for local development
  username: pipe(
    env.DB_WORKFLOW_USERNAME,
    Option.fromNullable,
    Option.getOrElse(() => env.DB_USERNAME),
  ),
})
