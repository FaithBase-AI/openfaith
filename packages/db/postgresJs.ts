import { env } from '@openfaith/shared'
import postgres from 'postgres'

// This is just for zero custom mutators
export const pgjsConnection = postgres({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: false,
  user: env.DB_USERNAME,
})
