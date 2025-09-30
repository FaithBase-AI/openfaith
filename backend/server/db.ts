import { schema } from '@openfaith/db'
import { env } from '@openfaith/shared'
import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'

const connection = new SQL({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: false,
  user: env.DB_USERNAME,
})

export const db = drizzle(connection, {
  schema,
})
