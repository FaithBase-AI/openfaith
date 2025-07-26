import { schema } from '@openfaith/db'
import { env } from '@openfaith/shared'
import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'
import { Boolean, pipe } from 'effect'

const connection = new SQL({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: pipe(
    env.DB_HOST_PRIMARY === '127.0.0.1',
    Boolean.match({
      onFalse: () => ({ rejectUnauthorized: false }),
      onTrue: () => false,
    }),
  ),
  user: env.DB_USERNAME,
})

export const db = drizzle(connection, {
  schema: schema,
})
