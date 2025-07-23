import { PgClient } from "@effect/sql-pg";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Data, Effect, Layer, Redacted } from "effect";
import * as Pg from "@effect/sql-drizzle/Pg";

export class ContainerError extends Data.TaggedError("ContainerError")<{
  cause: unknown;
}> {}

export class VitestPgContainer extends Effect.Service<VitestPgContainer>()(
  "test/VitestPgContainer",
  {
    scoped: Effect.acquireRelease(
      Effect.tryPromise({
        catch: (cause) => {
          console.error("Container startup error:", cause);
          return new ContainerError({ cause });
        },
        try: async () => {
          console.log("Starting PostgreSQL container for vitest...");
          const container = await new PostgreSqlContainer("postgres:alpine")
            .withStartupTimeout(120000) // 2 minutes
            .start();
          console.log("PostgreSQL container started successfully");
          console.log("Connection URI:", container.getConnectionUri());
          return container;
        },
      }),
      (container) => {
        console.log("Stopping PostgreSQL container...");
        return Effect.promise(() => container.stop());
      },
    ),
  },
) {
  static ClientLive = Layer.unwrapEffect(
    Effect.gen(function* () {
      const container = yield* VitestPgContainer;
      const connectionUri = container.getConnectionUri();
      console.log("Creating PgClient with URI:", connectionUri);
      return PgClient.layer({
        url: Redacted.make(connectionUri),
      });
    }),
  ).pipe(Layer.provide(this.Default));

  static DrizzleLive = Layer.unwrapEffect(
    Effect.gen(function* () {
      const container = yield* VitestPgContainer;
      const connectionUri = container.getConnectionUri();
      console.log("Creating Drizzle client with URI:", connectionUri);
      return Pg.layer.pipe(
        Layer.provideMerge(
          PgClient.layer({
            url: Redacted.make(connectionUri),
          }),
        ),
      );
    }),
  ).pipe(Layer.provide(this.Default));
}
