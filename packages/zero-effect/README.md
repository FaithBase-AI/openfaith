# @openfaith/zero-effect

Effect-TS integration for Rocicorp Zero mutations and transactions.

**For Effect-TS first applications** that want to use all their existing Effect services and write everything with `yield*` syntax. This library wraps Zero's transaction API (`tx`) to make it yieldable, so you can seamlessly integrate Zero mutations with your Effect-based business logic, dependency injection, and error handling.

Write your mutators once using Effect generators and `yield*` - they'll work in both client and server environments with different service implementations.

## Installation

```bash
npm add @openfaith/zero-effect
```

```bash
yarn add @openfaith/zero-effect
```

```bash
pnpm add @openfaith/zero-effect
```

```bash
bun add @openfaith/zero-effect
```

## Creating Effect-based Mutators

In an Effect-TS first app, you want to write mutators using `yield*` syntax and integrate with your existing Effect services. `EffectTransaction` wraps Zero's `tx` object to make all operations yieldable.

Instead of Zero's Promise-based `tx.mutate.people.update()`, you can now `yield* tx.mutate.people.update()` and compose it with other Effects.

```ts
import { Effect, Schema } from "effect";
import {
  type EffectTransaction,
  ZeroMutatorAuthError,
  ZeroMutatorValidationError,
} from "@openfaith/zero-effect/client";

// Define your schema - this will be used throughout the examples
const UpdatePersonInput = Schema.Struct({
  id: Schema.String,
  name: Schema.String.pipe(Schema.optional),
  email: Schema.String.pipe(Schema.optional),
});

type UpdatePersonInput = Schema.Schema.Type<typeof UpdatePersonInput>;
type MySchema = typeof mySchema; // Your Zero schema

export function createMutators(authData: { userId: string } | undefined) {
  return {
    people: {
      update: (tx: EffectTransaction<MySchema>, input: UpdatePersonInput) =>
        Effect.gen(function* () {
          // Check authentication
          if (!authData) {
            return yield* Effect.fail(
              new ZeroMutatorAuthError({
                message: "Not authenticated",
              }),
            );
          }

          // Validate input
          const validatedInput = yield* Schema.decodeUnknown(UpdatePersonInput)(
            input,
          ).pipe(
            Effect.mapError(
              (error) =>
                new ZeroMutatorValidationError({
                  message: `Invalid input: ${String(error)}`,
                }),
            ),
          );

          // Perform mutation with Effect error handling
          yield* tx.mutate.people.update({
            ...validatedInput,
          });

          yield* Effect.log("Person updated successfully", {
            id: validatedInput.id,
          });
        }),
    },
  };
}
```

## Converting Effect Mutators for Zero

Zero expects Promise-based mutators, but we've written Effect-based ones. The `convertEffectMutatorsToPromise` function bridges this gap, converting your Effect mutators to Promise-based ones that Zero can use.

The key insight is that you can provide different Effect runtimes for client and server, allowing the same mutator code to behave differently in each environment.

**Basic conversion:**

```ts
import { convertEffectMutatorsToPromise } from "@openfaith/zero-effect/client";
import { Runtime } from "effect";

// Create your Effect mutators first
const effectMutators = createMutators(authData);
```

**Client usage:**

On the client, you'll typically use the default runtime and integrate with React's ZeroProvider:

```tsx
import { convertEffectMutatorsToPromise } from "@openfaith/zero-effect/client";
import { ZeroProvider } from "@rocicorp/zero/react";
import { Runtime } from "effect";
import { useMemo } from "react";

function App({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Your auth hook

  const mutators = useMemo(() => {
    const effectMutators = createMutators(
      user ? { userId: user.id } : undefined,
    );

    return convertEffectMutatorsToPromise(
      effectMutators,
      Runtime.defaultRuntime,
    );
  }, [user?.id]);

  return (
    <ZeroProvider
      schema={mySchema}
      server="https://api.myapp.com/zero"
      mutators={mutators}
      userID={user?.id ?? "anonymous"}
    >
      {children}
    </ZeroProvider>
  );
}
```

**Server usage:**

On the server, you don't directly convert mutators yourself. Instead, the Zero store handles this internally when processing mutations. You'll see this in action in the HTTP handler section below:

```ts
import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import type { ReadonlyJSONObject } from "@rocicorp/zero";

// HTTP handler for Zero mutations - the store handles conversion internally
export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroMutatorsApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const appZeroStore = yield* AppZeroStore;

        // The store converts Effect mutators to Promise mutators internally
        const result = yield* appZeroStore.processMutations(
          createMutators({
            userId: session.userId,
          }),
          input.urlParams,
          input.payload as unknown as ReadonlyJSONObject,
        );

        return result;
      }),
    ),
).pipe(Layer.provide(SessionMiddlewareLayer), Layer.provide(ZeroLive));
```

## Setting up the Server

On the server side, you'll create a schema-specific Zero store and combine it with your application layers.

**Define your app-specific Zero store:**

```ts
import { ZeroStore, type ZeroSchemaStore } from "@openfaith/zero-effect/server";
import { Context, Effect, Layer } from "effect";

// Create your app-specific Zero store tag
export class AppZeroStore extends Context.Tag("@myapp/AppZeroStore")<
  AppZeroStore,
  ZeroSchemaStore<typeof mySchema>
>() {}

export const AppZeroStoreLive = Layer.effect(
  AppZeroStore,
  Effect.gen(function* () {
    const zeroStore = yield* ZeroStore;
    return zeroStore.forSchema(mySchema);
  }),
);
```

**Combine with database and other layers:**

```ts
import { PgClient } from "@effect/sql-pg";
import { Config } from "effect";

// Database layer
const PgLive = PgClient.layer({
  host: Config.string("DB_HOST"),
  port: Config.integer("DB_PORT"),
  database: Config.string("DB_NAME"),
  username: Config.string("DB_USER"),
  password: Config.secret("DB_PASSWORD"),
});

// Combined Zero layer with database
export const ZeroLive = Layer.provide(AppZeroStoreLive, ZeroStore.layer);

// Complete application layer
export const AppLive = Layer.mergeAll(
  PgLive,
  ZeroLive,
  SessionMiddlewareLayer,
  // ... other app layers
);
```

## Processing Mutations in HTTP Handlers

Use the Zero store in your HTTP handlers to process incoming mutations from Zero clients.

**Define your API and error types:**

```ts
import { HttpApiBuilder } from "@effect/platform";
import { Schema } from "effect";

// Define your Zero API
class ZeroMutatorsApi extends HttpApi.empty.add(
  HttpApiEndpoint.post("push", "/zero/push").setPayload(
    Schema.Struct({
      mutations: Schema.Array(Schema.Unknown),
      // ... other Zero payload fields
    }),
  ),
) {}

// Define mutation error type
export class MutatorError extends Schema.TaggedError<MutatorError>()(
  "MutatorError",
  {
    message: Schema.String,
  },
) {}
```

**Create the HTTP handler:**

```ts
import { Effect, Layer, pipe } from "effect";
import type { ReadonlyJSONObject } from "@rocicorp/zero";

export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroMutatorsApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const appZeroStore = yield* AppZeroStore;

        // Log the incoming request
        yield* Effect.log("Processing Zero push request", {
          userId: session.userId,
          mutationCount: input.payload.mutations.length,
        });

        // Process mutations with authentication context
        const result = yield* appZeroStore
          .processMutations(
            createMutators({
              userId: session.userId,
            }),
            input.urlParams,
            input.payload as unknown as ReadonlyJSONObject,
          )
          .pipe(
            // Provide server-specific services
            Effect.provideService(NotifyService, ServerNotifyService),
            Effect.mapError(
              (error) =>
                new MutatorError({
                  message: `Error processing mutations: ${error}`,
                }),
            ),
          );

        return result;
      }),
    ),
).pipe(Layer.provide(SessionMiddlewareLayer), Layer.provide(ZeroLive));
```

## Client-side Integration

The client-side integration was shown above in the "Converting Effect Mutators for Zero" section. The key points are:

- Use `useMemo` to avoid recreating mutators on every render
- Pass authentication data to your mutators
- Convert Effect mutators to Promise mutators for Zero
- Provide the converted mutators to ZeroProvider

This setup ensures your mutators work seamlessly with Zero's React integration while maintaining all the benefits of Effect-TS.

## Working with Effect Services

You can inject Effect services into your mutators. This is especially powerful because you can provide different implementations for client and server, allowing the same mutator code to run in both environments.

**Shared service interface and mutators:**

```ts
// Define a notification service interface
class NotifyService extends Effect.Service<NotifyService>()(
  "app/NotifyService",
  {
    effect: Effect.gen(function* () {
      const notify = (message: string) => Effect.succeed(void 0);
      return { notify } as const;
    }),
  },
) {}

export function createMutators(authData: { userId: string } | undefined) {
  return {
    people: {
      update: (tx: EffectTransaction<MySchema>, input: UpdatePersonInput) =>
        Effect.gen(function* () {
          const notifyService = yield* NotifyService;

          // Perform the mutation
          yield* tx.mutate.people.update(input);

          // Notify about the update - implementation differs by environment
          yield* notifyService.notify(
            `Person ${input.name} updated successfully`,
          );
        }),
    },
  };
}
```

**Server implementation:**

```ts
// Server implementation - sends email
const ServerNotifyService = NotifyService.of({
  notify: (message: string) =>
    Effect.gen(function* () {
      // Send email notification
      yield* Effect.tryPromise(() =>
        sendEmail({
          to: "admin@example.com",
          subject: "Person Updated",
          body: message,
        }),
      );
    }),
});

// Server usage - typically done inside the Zero store
const serverRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideService(NotifyService, ServerNotifyService),
);
const serverMutators = convertEffectMutatorsToPromise(
  createMutators({ userId: "user123" }),
  serverRuntime,
);
```

**Client implementation:**

```ts
// Client implementation - shows toast
const ClientNotifyService = NotifyService.of({
  notify: (message: string) =>
    Effect.sync(() => {
      // Show toast notification
      toast.success(message);
    }),
});

// Client usage
const clientRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideService(NotifyService, ClientNotifyService),
);
const clientMutators = convertEffectMutatorsToPromise(
  createMutators({ userId: "user123" }),
  clientRuntime,
);
```

## Error Handling

The library provides several error types for different failure scenarios. These errors are automatically handled by the Effect runtime and can be caught and transformed as needed:

```ts
import {
  ZeroMutatorAuthError,
  ZeroMutatorValidationError,
  ZeroMutatorDatabaseError,
  ZeroMutationProcessingError,
} from "@openfaith/zero-effect/client";

// Authentication errors
yield *
  Effect.fail(
    new ZeroMutatorAuthError({
      message: "User not authenticated",
    }),
  );

// Validation errors
yield *
  Effect.fail(
    new ZeroMutatorValidationError({
      field: "email",
      message: "Invalid email format",
    }),
  );

// Database operations automatically wrap in ZeroMutatorDatabaseError
yield * tx.mutate.people.update(data); // Can fail with ZeroMutatorDatabaseError
```

## Database Integration

The server automatically integrates with Effect's PostgreSQL client. The Zero store uses the PostgreSQL client from the Effect context, so you just need to provide the database layer:

```ts
import { PgClient } from "@effect/sql-pg";
import { Config } from "effect";

const PgLive = PgClient.layer({
  host: Config.string("DB_HOST"),
  port: Config.integer("DB_PORT"),
  database: Config.string("DB_NAME"),
  username: Config.string("DB_USER"),
  password: Config.secret("DB_PASSWORD"),
});

// The Zero layer automatically uses the PostgreSQL client
const AppLive = Layer.mergeAll(PgLive, ZeroLive);
```

## Transaction Wrapping

All Zero transaction operations are automatically wrapped in Effect operations by the `EffectTransaction` class. This means you get proper error handling and can compose transaction operations with other Effects:

```ts
const mutator = (tx: EffectTransaction<MySchema>, input: any) =>
  Effect.gen(function* () {
    // Mutations return Effects
    yield* tx.mutate.people.create(input);

    // Queries also return Effects
    const person = yield* tx.query.people.where("id", input.id).first();

    // Both can fail with ZeroMutatorDatabaseError
    return person;
  });
```
