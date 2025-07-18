# Effect.fn Approach for Zero Mutators

This document explains the key difference between wrapping Effects in Promises vs. using Effect.fn directly for Zero mutators.

## The Problem You Wanted to Solve

**Before (wrapping Effects in Promises):**

```typescript
update: async (
  tx: Transaction<ZSchema>,
  input: UpdatePersonInput,
): Promise<void> => {
  // Convert the Effect-based mutator to a Promise for Zero compatibility
  const effect = updatePersonMutator(tx, input, authData);

  // Run the effect and convert to Promise
  await Effect.runPromise(effect);
};
```

**After (using Effect.fn directly):**

```typescript
update: effectFnToPromise(
  Effect.fn("updatePerson")(
    (tx: Transaction<ZSchema>, input: UpdatePersonInput) =>
      Effect.gen(function* () {
        // All the mutator logic here as an Effect
        // ...
      }),
  ),
);
```

## Key Benefits of the Effect.fn Approach

### 1. **Direct Effect.fn Usage**

The mutator function itself is an `Effect.fn`, not a Promise that wraps an Effect:

```typescript
// The mutator IS an Effect.fn
export const updatePersonEffectFn = Effect.fn("updatePerson")(
  (
    tx: Transaction<ZSchema>,
    input: UpdatePersonInput,
    authData: AuthData | undefined,
  ) =>
    Effect.gen(function* () {
      // Effect logic here
    }),
);
```

### 2. **Built-in Tracing**

Since the mutator is an `Effect.fn`, you get automatic:

- Stack traces with location details
- Automatic span creation for tracing
- Better error reporting

### 3. **Helper Function for Zero Compatibility**

The `effectFnToPromise` helper converts any `Effect.fn` to a Promise-based function:

```typescript
export function effectFnToPromise<A extends readonly unknown[], E>(
  effectFn: (...args: A) => Effect.Effect<void, E, never>,
): (...args: A) => Promise<void> {
  return (...args: A) => Effect.runPromise(effectFn(...args));
}
```

### 4. **Multiple Integration Patterns**

#### Pattern 1: Inline Effect.fn Definition

```typescript
export function createEffectMutators(authData) {
  return {
    people: {
      update: effectFnToPromise(
        Effect.fn("updatePerson")((tx, input) =>
          Effect.gen(function* () {
            // Mutator logic here
          }),
        ),
      ),
    },
  };
}
```

#### Pattern 2: Pre-defined Effect.fn Mutators

```typescript
export const updatePersonEffectFn = Effect.fn("updatePerson")(
  (tx, input, authData) =>
    Effect.gen(function* () {
      // Mutator logic here
    }),
);

export function createEffectMutators(authData) {
  return {
    people: {
      update: effectFnToPromise((tx, input) =>
        updatePersonEffectFn(tx, input, authData),
      ),
    },
  };
}
```

#### Pattern 3: Generic Helper

```typescript
export function createMutatorFromEffectFn<TInput>(
  effectFn: (tx, input, authData) => Effect.Effect<void, MutatorError, never>,
  authData,
) {
  return effectFnToPromise((tx, input) => effectFn(tx, input, authData));
}

// Usage
export function createEffectMutators(authData) {
  return {
    people: {
      update: createMutatorFromEffectFn(updatePersonEffectFn, authData),
    },
  };
}
```

## Comparison

### Old Approach (Effect wrapped in Promise)

```typescript
// ❌ The mutator function is a Promise that runs an Effect
update: async (tx, input) => {
  const effect = someEffect(tx, input);
  await Effect.runPromise(effect); // Effect is wrapped
};
```

### New Approach (Effect.fn converted to Promise)

```typescript
// ✅ The mutator function IS an Effect.fn, converted to Promise
update: effectFnToPromise(
  Effect.fn("updatePerson")((tx, input) =>
    Effect.gen(function* () {
      // Effect logic
    }),
  ),
);
```

## Benefits Summary

1. **Better Tracing**: Automatic span creation and stack traces
2. **Cleaner Architecture**: The mutator logic is purely Effect-based
3. **Composability**: Effect.fn mutators can be easily composed with other Effects
4. **Zero Compatibility**: `effectFnToPromise` helper maintains Zero compatibility
5. **Type Safety**: Full TypeScript support throughout
6. **Reusability**: Effect.fn mutators can be used directly in Effect contexts

## Usage in Handler

The handler usage remains the same:

```typescript
const result =
  yield *
  appZeroStore.processZeroMutations(
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
```

But now the mutators themselves are Effect.fn functions with built-in tracing and better error handling, rather than Promise functions that wrap Effects.
