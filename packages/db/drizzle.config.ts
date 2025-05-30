import { env } from '@openfaith/shared'
import type { Config } from 'drizzle-kit'
import { Boolean, pipe } from 'effect'

export default {
  schema: './schema/*',
  dialect: 'postgresql',
  dbCredentials: {
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
    // ssl: { rejectUnauthorized: false },
  },
  // Pick up all our schema files
  out: './migrations',
  tablesFilter: ['openfaith_*'],
} satisfies Config
