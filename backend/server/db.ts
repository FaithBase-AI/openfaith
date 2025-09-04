import { schema } from "@openfaith/db";
import { env } from "@openfaith/shared";
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { Boolean, pipe } from "effect";

const connection = new SQL({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  // When DB_SSL=false: SSL disabled. When DB_SSL=true: SSL enabled but ignore cert errors
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  user: env.DB_USERNAME,
});

export const db = drizzle(connection, {
  schema,
});
