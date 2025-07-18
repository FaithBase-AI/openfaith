# @openfaith/zero-effect

Generic Effect-TS to Zero bridge utilities. This package provides reusable utilities for creating Zero mutators using Effect-TS patterns.

## Features

- **`effectFnToPromise()`** - Converts Effect generator functions to Promise-based functions for Zero compatibility
- **Error Classes** - Structured error handling with `MutatorAuthError`, `MutatorValidationError`, `MutatorDatabaseError`
- **Type Safety** - Full TypeScript support with Effect Schema integration
- **Zero Compatibility** - Seamless integration with Zero's Promise-based API

## Usage

```typescript
import { effectFnToPromise, MutatorAuthError } from "@openfaith/zero-effect";

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

## Installation

This is a workspace package. Add it to your dependencies:

```json
{
  "dependencies": {
    "@openfaith/zero-effect": "workspace:*"
  }
}
```
