import {
  NodeClusterShardManagerSocket,
  NodeRuntime,
} from "@effect/platform-node";
import { PgLive } from "@openfaith/server/live/dbLive";
import { Layer, Logger } from "effect";

NodeClusterShardManagerSocket.layer({
  storage: "sql",
  host: "0.0.0.0", // Bind to all interfaces instead of IPv6 localhost
  port: 8080, // Explicit port configuration
}).pipe(
  Layer.provide(PgLive),
  Layer.provide(Logger.pretty),
  Layer.launch,
  NodeRuntime.runMain
);
