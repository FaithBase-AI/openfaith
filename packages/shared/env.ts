/** biome-ignore-all assist/source/useSortedKeys: Keep it organized by category */
import { createEnv } from "@t3-oss/env-core";
import { Option, pipe } from "effect";
import { z } from "zod";

// Conditional server schema - only validate server variables in server environment (not frontend SSR)
const serverSchema =
  typeof window === "undefined" && !process.env.VITE_APP_NAME
    ? {
        // DB
        DB_HOST_PRIMARY: z.string(),
        DB_NAME: z.string(),
        DB_PASSWORD: z.string(),
        DB_PORT: z.string().transform((x) => Number.parseInt(x, 10)),
        DB_USERNAME: z.string(),
        DB_SSL: z
          .string()
          .transform((x) => x === "true")
          .default("true"),

        // Zero
        ZERO_UPSTREAM_DB: z.string(),
        ZERO_CVR_DB: z.string(),
        ZERO_CHANGE_DB: z.string(),
        ZERO_REPLICA_FILE: z.string(),
        ZERO_AUTH_JWKS_URL: z.string(),
        ZERO_APP_ID: z.string(),
        ZERO_NUM_SYNC_WORKERS: z
          .string()
          .transform((x) => Number.parseInt(x, 10)),
        ZERO_LOG_LEVEL: z.string(),
        ZERO_ADMIN_PASSWORD: z.string(),
        ZERO_PUSH_URL: z.string(),

        // Config
        NODE_ENV: z
          .enum(["development", "production", "test"])
          .default("development"),

        // Auth
        BETTER_AUTH_SECRET: z.string(),

        // Email
        RESEND_API_KEY: z.string(),

        // Planning Center
        PLANNING_CENTER_SECRET: z.string(),
      }
    : {};

// Conditional client schema - only validate if VITE variables are actually available
const hasViteVars = !!(
  process.env.VITE_APP_NAME ||
  (typeof window !== "undefined" &&
    typeof import.meta.env !== "undefined" &&
    import.meta.env.VITE_APP_NAME)
);

const clientSchema = hasViteVars
  ? {
      // Zero
      VITE_ZERO_SERVER: z.string(),

      // Config
      VITE_APP_NAME: z.string(),
      VITE_BASE_URL: z.string(),
      VITE_PROD_ROOT_DOMAIN: z.string(),
      VITE_PROD_EMAIL_DOMAIN: z.string(),

      // Planning Center
      VITE_PLANNING_CENTER_CLIENT_ID: z.string(),
    }
  : {};

export const env = createEnv({
  server: serverSchema,

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",

  client: clientSchema,

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    ...process.env,
    ...pipe(
      process.env.npm_lifecycle_script,
      Option.fromNullable,
      Option.filter((x) => x === "drizzle-kit studio"),
      Option.match({
        onNone: () => import.meta.env,
        onSome: () => ({}),
      })
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
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "prerender" ||
    !!process.env.NITRO_PRESET ||
    // Skip validation in frontend SSR (backend handles server env validation)
    (typeof window === "undefined" && !!process.env.VITE_APP_NAME),
});
