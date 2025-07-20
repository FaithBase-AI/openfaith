import { env } from '@openfaith/shared'
import { Boolean, pipe } from 'effect'
import postgres from 'postgres'

// This is just for zero custom mutators
export const pgjsConnection = postgres({
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
