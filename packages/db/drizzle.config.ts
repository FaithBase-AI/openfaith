import { env } from "@openfaith/shared";
import type { Config } from "drizzle-kit";
import { Boolean, pipe } from "effect";

export default {
  dbCredentials: {
    database: env.DB_NAME,
    host: env.DB_HOST_PRIMARY,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
    ssl: pipe(
      env.DB_SSL,
      Boolean.match({
        onFalse: () => false,
        onTrue: () => ({ rejectUnauthorized: false }),
      })
    ),
    user: env.DB_USERNAME,
    // ssl: { rejectUnauthorized: false },
  },
  dialect: "postgresql",
  // Pick up all our schema files
  out: "./migrations",
  schema: "./schema/drizzleSchema.ts",
  tablesFilter: ["openfaith_*"],
} satisfies Config;
