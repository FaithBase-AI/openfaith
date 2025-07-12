import * as schema from '@openfaith/db/schema/drizzleSchema'
import { drizzleZeroConfig } from 'drizzle-zero'

export default drizzleZeroConfig(schema, {})
