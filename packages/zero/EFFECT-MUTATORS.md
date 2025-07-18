# Effect-Based Zero Mutators

This package provides utilities to create Zero mutators using Effect-TS, allowing you to write mutators with Effect's powerful error handling, logging, and composability features while maintaining compatibility with Zero's Promise-based API.

## Architecture

### Library Code (`packages/zero/`)

The library provides generic utilities for bridging Effect-based code with Zero:

- **`effectMutatorBridge.ts`** - Core bridge utilities
  - `effectFnToPromise()` - Converts Effect generator functions to Promise-based functions
  - Error classes: `MutatorAuthError`, `MutatorValidationError`, `MutatorDatabaseError`
  - Type definitions for consistent error handling

### App Code (`apps/openfaith/data/mutators/`)

App-specific mutator implementations using the library utilities:

- **`mutators.ts`** - Your actual business logic mutators
- **`example.ts`** - Usage examples and patterns

## Usage

### 1. Library Usage (Generic)

```typescript
import {
  effectFnToPromise,
  MutatorAuthError,
} from "@openfaith/zero/effectMutatorBridge";

// Convert an Effect generator to a Promise-based function
const myMutator = effectFnToPromise(function* (tx, input) {
  // Your Effect-based logic here
  if (!authData) {
    return yield* Effect.fail(
      new MutatorAuthError({ message: "Not authenticated" }),
    );
  }
  // ... more logic
});
```

### 2. App Usage (Specific)

```typescript
import { createAppMutators } from "./data/mutators/mutators";

// Create mutators with auth context
const authData = { sub: "user-123", activeOrganizationId: "org-456" };
const mutators = createAppMutators(authData);

// Use with Zero - they're automatically Promise-compatible
```

## Benefits

### Effect-TS Features

- **Structured Error Handling** - Tagged errors with proper typing
- **Logging & Tracing** - Built-in Effect logging and tracing
- **Composability** - Easy to compose and test Effect-based operations
- **Type Safety** - Full TypeScript support with Effect Schema validation

### Zero Compatibility

- **Automatic Conversion** - Effect generators are automatically converted to Promises
- **No Breaking Changes** - Existing Zero code continues to work
- **Performance** - Minimal overhead for the conversion

## Error Handling

The library provides three main error types:

```typescript
// Authentication errors
new MutatorAuthError({ message: "Not authenticated" });

// Validation errors
new MutatorValidationError({
  message: "Invalid input",
  field: "email", // optional
});

// Database errors
new MutatorDatabaseError({
  message: "Database operation failed",
  cause: originalError, // optional
});
```

## Best Practices

1. **Separation of Concerns** - Keep library utilities generic, app logic specific
2. **Error Handling** - Use structured errors for better debugging
3. **Validation** - Use Effect Schema for input validation
4. **Logging** - Use Effect's logging for observability
5. **Testing** - Test Effect generators directly before conversion

## Migration

If you have existing mutators, you can gradually migrate them:

1. Keep existing Promise-based mutators working
2. Create new Effect-based mutators alongside them
3. Use `effectFnToPromise()` to bridge the gap
4. Gradually replace old mutators with Effect-based ones
