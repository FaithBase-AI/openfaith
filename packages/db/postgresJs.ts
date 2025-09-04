import { env } from "@openfaith/shared";
import { Boolean, pipe } from "effect";
import postgres from "postgres";

// This is just for zero custom mutators
export const pgjsConnection = postgres({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  // When DB_SSL=false: SSL disabled. When DB_SSL=true: SSL enabled but ignore cert errors
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  user: env.DB_USERNAME,
});
