import { env } from '@openfaith/shared'
import type { Config } from 'drizzle-kit'
import { Boolean, pipe } from 'effect'

export default {
  dbCredentials: {
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
    // ssl: { rejectUnauthorized: false },
  },
  dialect: 'postgresql',
  // Pick up all our schema files
  out: './migrations',
  schema: './schema/drizzleSchema.ts',
  tablesFilter: ['openfaith_*'],
} satisfies Config
