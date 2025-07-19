# Effect-Based Zero Mutators

This document describes the Effect-based wrapper for Zero custom mutators, providing type-safe, composable, and error-handled mutations.

## Overview

The Effect-based mutators provide several advantages over the traditional Promise-based approach:

- **Type Safety**: Full TypeScript support with Effect Schema validation
- **Error Handling**: Structured error types instead of thrown exceptions
- **Composability**: Easy to compose with other Effect operations
- **Tracing**: Built-in tracing with `Effect.fn`
- **Testability**: Easy mocking and testing with Effect's test utilities

## Core Components

### 1. Effect-Based Mutator Functions

```typescript
import {
  updatePersonMutator,
  type UpdatePersonInput,
} from "@openfaith/zero/effectMutators";

// Direct usage of Effect-based mutator
const effect = updatePersonMutator(tx, input, authData);
const result = await Effect.runPromise(effect);
```

### 2. Zero-Compatible Wrapper

```typescript
import { createEffectMutators } from "@openfaith/zero/effectMutators";

// Create Zero-compatible mutators
const mutators = createEffectMutators(authData);

// Use with Zero's PushProcessor
await processor.process(mutators, urlParams, payload);
```

### 3. Helper Function Approach

```typescript
import {
  createEffectMutatorsWithHelper,
  effectMutatorToPromise,
} from "@openfaith/zero/effectMutators";

// Create mutators using the helper
const mutators = createEffectMutatorsWithHelper(authData);

// Or wrap individual mutators
const wrappedMutator = effectMutatorToPromise(updatePersonMutator);
```

## Error Types

The Effect-based mutators define structured error types:

```typescript
// Authentication errors
class MutatorAuthError extends Schema.TaggedError<MutatorAuthError>()(
  "MutatorAuthError",
  {
    message: Schema.String,
  },
) {}

// Validation errors
class MutatorValidationError extends Schema.TaggedError<MutatorValidationError>()(
  "MutatorValidationError",
  {
    message: Schema.String,
    field: Schema.String.pipe(Schema.optional),
  },
) {}

// Database errors
class MutatorDatabaseError extends Schema.TaggedError<MutatorDatabaseError>()(
  "MutatorDatabaseError",
  {
    message: Schema.String,
    cause: Schema.Unknown.pipe(Schema.optional),
  },
) {}
```

## Usage Examples

### Basic Usage

```typescript
import { Effect } from "effect";
import {
  updatePersonMutator,
  type UpdatePersonInput,
} from "@openfaith/zero/effectMutators";

const updatePerson = Effect.gen(function* () {
  const input: UpdatePersonInput = {
    id: "person-123",
    firstName: "John",
  };

  const authData = {
    sub: "user-456",
    activeOrganizationId: "org-789",
  };

  yield* updatePersonMutator(tx, input, authData);
  yield* Effect.log("Person updated successfully");
});
```

### Error Handling

```typescript
const updatePersonWithErrorHandling = Effect.gen(function* () {
  const result = yield* updatePersonMutator(tx, input, authData).pipe(
    Effect.catchAll((error) => {
      switch (error._tag) {
        case "MutatorAuthError":
          return Effect.log("Authentication failed:", error.message);
        case "MutatorValidationError":
          return Effect.log("Validation failed:", error.message);
        case "MutatorDatabaseError":
          return Effect.log("Database error:", error.message);
        default:
          return Effect.log("Unknown error:", error);
      }
    }),
  );

  return result;
});
```

### Composition with Other Effects

```typescript
const updateMultiplePeople = Effect.gen(function* () {
  const people: UpdatePersonInput[] = [
    { id: "person-1", firstName: "Alice" },
    { id: "person-2", firstName: "Bob" },
    { id: "person-3", firstName: "Charlie" },
  ];

  // Process all updates in parallel
  yield* Effect.forEach(
    people,
    (person) => updatePersonMutator(tx, person, authData),
    { concurrency: 3 },
  );

  yield* Effect.log("All people updated successfully");
});
```

### Integration with Zero Handler

```typescript
// In your Zero handler
import { createEffectMutators } from "@openfaith/zero/effectMutators";

export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const appZeroStore = yield* AppZeroStore;

        const result = yield* appZeroStore.processZeroMutations(
          createEffectMutators({
            activeOrganizationId: pipe(
              session.activeOrganizationIdOpt,
              Option.getOrNull,
            ),
            sub: session.userId,
          }),
          input.urlParams,
          input.payload as unknown as ReadonlyJSONObject,
        );

        return result;
      }),
    ),
);
```

## Key Features

### 1. Effect.fn Integration

All mutators use `Effect.fn` for automatic tracing and better error reporting:

```typescript
export const updatePersonMutator = Effect.fn("updatePerson")(function* (
  tx: Transaction<ZSchema>,
  input: UpdatePersonInput,
  authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
) {
  // Implementation with automatic tracing
});
```

### 2. Schema Validation

Input validation using Effect Schema:

```typescript
const validatedInput =
  yield *
  Schema.decodeUnknown(UpdatePersonInput)(input).pipe(
    Effect.mapError(
      (error) =>
        new MutatorValidationError({
          message: `Invalid input: ${String(error)}`,
        }),
    ),
  );
```

### 3. Promise Compatibility

Easy conversion between Effect and Promise for Zero compatibility:

```typescript
export function effectMutatorToPromise<A extends readonly unknown[], E>(
  effectMutator: (...args: A) => Effect.Effect<void, E, never>,
): (...args: A) => Promise<void> {
  return (...args: A) => Effect.runPromise(effectMutator(...args));
}
```

## Migration from Promise-Based Mutators

### Before (Promise-based)

```typescript
export function createMutators(authData) {
  return {
    people: {
      update: async (tx, input) => {
        if (!authData) {
          throw new Error("Not authenticated");
        }
        await tx.mutate.people.update(input);
      },
    },
  };
}
```

### After (Effect-based)

```typescript
export function createEffectMutators(authData) {
  return {
    people: {
      update: async (tx, input) => {
        const effect = updatePersonMutator(tx, input, authData);
        await Effect.runPromise(effect);
      },
    },
  };
}
```

## Benefits

1. **Type Safety**: Full TypeScript support with runtime validation
2. **Error Handling**: Structured errors instead of thrown exceptions
3. **Composability**: Easy to compose with other Effect operations
4. **Testability**: Easy mocking with Effect's Layer system
5. **Observability**: Built-in tracing and logging
6. **Resource Management**: Proper cleanup and lifecycle management

## Testing

```typescript
import { Effect, Layer } from "effect";
import { updatePersonMutator } from "@openfaith/zero/effectMutators";

// Mock transaction for testing
const MockTransaction = Layer.succeed(Transaction, mockTx);

// Test the mutator
const testEffect = Effect.gen(function* () {
  const result = yield* updatePersonMutator(mockTx, input, authData);
  // Assertions here
}).pipe(Effect.provide(MockTransaction));

await Effect.runPromise(testEffect);
```

This approach provides a clean, type-safe, and composable way to work with Zero mutators while maintaining full compatibility with the existing Zero ecosystem.
