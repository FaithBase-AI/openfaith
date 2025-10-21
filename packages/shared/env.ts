/** biome-ignore-all assist/source/useSortedKeys: Keep it organized by category */
import { createEnv } from '@t3-oss/env-core'
import { Option, pipe, String } from 'effect'
import { z } from 'zod'

declare global {
  interface Window {
    env: Record<string, string>
  }
}

const serverEnv = {
  // DB
  DB_HOST_PRIMARY: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.string().transform((x) => Number.parseInt(x, 10)),
  DB_USERNAME: z.string(),

  // Workflow DB
  DB_WORKFLOW_HOST_PRIMARY: z.string().optional(), // For local dev when connected to prod db
  DB_WORKFLOW_NAME: z.string().optional(), // For local dev when connected to prod db
  DB_WORKFLOW_PASSWORD: z.string().optional(), // For local dev when connected to prod db
  DB_WORKFLOW_PORT: z
    .string()
    .transform((x) => Number.parseInt(x, 10))
    .optional(), // For local dev when connected to prod db
  DB_WORKFLOW_USERNAME: z.string().optional(), // For local dev when connected to prod db

  // Zero
  ZERO_UPSTREAM_DB: z.string(),
  ZERO_CVR_DB: z.string().optional(), // For local dev when connected to prod upstream db
  ZERO_CHANGE_DB: z.string().optional(), // For local dev when connected to prod upstream db
  ZERO_REPLICA_FILE: z.string(),
  ZERO_AUTH_JWKS_URL: z.string(),
  ZERO_APP_ID: z.string(),
  ZERO_LOG_LEVEL: z.string(),
  ZERO_ADMIN_PASSWORD: z.string(),
  ZERO_PUSH_URL: z.string(),

  // Cluster / Workers
  WORKERS_HOST: z.string().optional().default('localhost'),
  SHARD_MANAGER_HOST: z.string().optional().default('localhost'),

  // Config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TUNNEL_URL: z.string().optional(),

  // Auth
  BETTER_AUTH_SECRET: z.string(),

  // Email
  RESEND_API_KEY: z.string(),

  // Planning Center
  PLANNING_CENTER_SECRET: z.string(),

  // AI
  ANTHROPIC_API_KEY: z.string(),
}

export const env = createEnv({
  // If we are prerendering,
  server: process.env.TSS_PRERENDERING
    ? ({
        // DB
        DB_HOST_PRIMARY: z.string().default(''),
        DB_NAME: z.string().default(''),
        DB_PASSWORD: z.string().default(''),
        DB_PORT: z
          .string()
          .default('5432')
          .transform((x) => Number.parseInt(x, 10)),
        DB_USERNAME: z.string().default(''),

        // Workflow DB
        DB_WORKFLOW_HOST_PRIMARY: z.string().optional(), // For local dev when connected to prod db
        DB_WORKFLOW_NAME: z.string().optional(), // For local dev when connected to prod db
        DB_WORKFLOW_PASSWORD: z.string().optional(), // For local dev when connected to prod db
        DB_WORKFLOW_PORT: z
          .string()
          .transform((x) => Number.parseInt(x, 10))
          .optional(), // For local dev when connected to prod db
        DB_WORKFLOW_USERNAME: z.string().optional(), // For local dev when connected to prod db

        // Zero
        ZERO_UPSTREAM_DB: z.string().default(''),
        ZERO_CVR_DB: z.string().optional(), // For local dev when connected to prod upstream db
        ZERO_CHANGE_DB: z.string().optional(), // For local dev when connected to prod upstream db
        ZERO_REPLICA_FILE: z.string().default(''),
        ZERO_AUTH_JWKS_URL: z.string().default(''),
        ZERO_APP_ID: z.string().default(''),
        ZERO_LOG_LEVEL: z.string().default(''),
        ZERO_ADMIN_PASSWORD: z.string().default(''),
        ZERO_PUSH_URL: z.string().default(''),

        // Cluster / Workers
        WORKERS_HOST: z.string().optional().default('localhost'),
        SHARD_MANAGER_HOST: z.string().optional().default('localhost'),

        // Config
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
        TUNNEL_URL: z.string().optional(),

        // Auth
        BETTER_AUTH_SECRET: z.string().default(''),

        // Email
        RESEND_API_KEY: z.string(),

        // Planning Center
        PLANNING_CENTER_SECRET: z.string().default(''),

        // AI
        ANTHROPIC_API_KEY: z.string().default(''),
      } as unknown as typeof serverEnv)
    : serverEnv,

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    // Make sure to update `__root.tsx` if you add / remove any variables here. Vite auto bakes in the client env values
    // into the build output which runes our goals of being able to publish the frontend docker image. Instead we use
    // `vite-plugin-runtime` to remove it, and then we insert the env into the frontend with a cheeky script tag.

    // Zero
    VITE_ZERO_SERVER: z.string(),

    // Config
    VITE_APP_NAME: z.string(),
    VITE_BASE_URL: z.string(),
    VITE_PROD_ROOT_DOMAIN: z.string(),
    VITE_PROD_EMAIL_DOMAIN: z.string(),
    VITE_APP_REDIRECT_URL: z.string().optional().default('/directory/people'),

    // Planning Center
    VITE_PLANNING_CENTER_CLIENT_ID: z.string(),

    // Maps
    VITE_GOOGLE_PLACES_API_KEY: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    // This is the client side env from Vite. We need this for local dev.
    ...pipe(
      process.env.npm_lifecycle_script,
      Option.fromNullable,
      Option.filter((x) => pipe(x, String.includes('drizzle-kit'))),
      Option.match({
        onNone: () => ({
          // Zero
          VITE_ZERO_SERVER: import.meta.env.VITE_ZERO_SERVER,

          // Config
          VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
          VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
          VITE_PROD_ROOT_DOMAIN: import.meta.env.VITE_PROD_ROOT_DOMAIN,
          VITE_PROD_EMAIL_DOMAIN: import.meta.env.VITE_PROD_EMAIL_DOMAIN,
          VITE_APP_REDIRECT_URL: import.meta.env.VITE_APP_REDIRECT_URL,

          // Planning Center
          VITE_PLANNING_CENTER_CLIENT_ID: import.meta.env.VITE_PLANNING_CENTER_CLIENT_ID,

          // Maps
          VITE_GOOGLE_PLACES_API_KEY: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
        }),
        onSome: () => ({}),
      }),
    ),
    // This is the server side env. We need the values for `VITE_` to override what we get from the client side.
    ...process.env,
    // This is the prod client side env. It comes through the script tag that we add in `__root.tsx`
    ...pipe(
      typeof window !== 'undefined'
        ? pipe(
            window.env,
            Option.fromNullable,
            Option.getOrElse(() => {}),
          )
        : {},
    ),
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

  skipValidation:
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'production' ||
    process.env.TSS_PRERENDERING !== undefined,
})
