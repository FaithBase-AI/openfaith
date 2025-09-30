import { env } from '@openfaith/shared'
import type { Config } from 'drizzle-kit'

export default {
  dbCredentials: {
    database: env.DB_NAME,
    host: env.DB_HOST_PRIMARY,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
    ssl: false,
    user: env.DB_USERNAME,
  },
  dialect: 'postgresql',
  // Pick up all our schema files
  out: './migrations',
  schema: './schema/drizzleSchema.ts',
  tablesFilter: ['openfaith_*'],
} satisfies Config
