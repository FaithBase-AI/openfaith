import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // DB
    DB_HOST_PRIMARY: z.string(),
    DB_NAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_PORT: z.string().transform((x) => Number.parseInt(x)),
    DB_USERNAME: z.string(),

    // Redis
    REDIS_URL: z.string(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    UPSTASH_REDIS_REST_URL: z.string(),

    // Config

    // Auth
    BETTER_AUTH_SECRET: z.string(),

    // Email
    RESEND_API_KEY: z.string(),

    // Planning Center
    PLANNING_CENTER_APPLICATION_ID: z.string(),
    PLANNING_CENTER_SECRET: z.string(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    // Config
    VITE_APP_NAME: z.string(),
    VITE_BASE_URL: z.string(),
    VITE_PROD_ROOT_DOMAIN: z.string(),

    // Planning Center
    VITE_PLANNING_CENTER_CLIENT_ID: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    ...process.env,
    ...import.meta.env,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
