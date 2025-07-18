# Effect Mutator Bridge Implementation

This document explains the implementation of the Effect-based mutator bridge that allows you to write pure Effect.fn mutators and automatically converts them to Zero's Promise-based interface.

## ✅ What You Wanted

You wanted to be able to write mutators like this:

```typescript
export function createMutatorsEf(
  authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
) {
  return {
    people: {
      update: Effect.fn("updatePerson")(function* (
        tx: Transaction<ZSchema>,
        input: UpdatePersonInput,
      ) {
        if (!authData) {
          throw new Error("Not authenticated");
        }
        // Optionally, add schema validation here
        yield* tx.mutate.people.update({
          ...input,
        });
      }),
    },
  } as const satisfies CustomMutatorEfDefs<ZSchema>;
}
```

## ✅ What Was Implemented

### 1. **CustomMutatorEfDefs Type**

```typescript
// packages/zero/effectMutatorDefs.ts
export type CustomMutatorEfDefs<TSchema extends Schema> = {
  readonly [TableName in keyof TSchema["tables"]]?: {
    readonly [MutatorName: string]: (
      ...args: ReadonlyArray<any>
    ) => Effect.Effect<void, unknown, never>;
  };
};
```

This type mirrors Zero's `CustomMutatorDefs` but expects Effect-returning functions instead of Promise-returning functions.

### 2. **Conversion Bridge**

```typescript
// packages/zero/effectMutatorDefs.ts
export function convertEffectMutatorsToPromise<TSchema extends Schema>(
  effectMutators: CustomMutatorEfDefs<TSchema>,
  runtime: Runtime.Runtime<never>,
): CustomMutatorDefs<TSchema> {
  const promiseMutators: any = {};

  for (const [tableName, tableMutators] of Object.entries(effectMutators)) {
    if (tableMutators) {
      promiseMutators[tableName] = {};

      for (const [mutatorName, mutatorFn] of Object.entries(tableMutators)) {
        if (typeof mutatorFn === "function") {
          promiseMutators[tableName][mutatorName] = (
            ...args: ReadonlyArray<any>
          ) => {
            const effect = mutatorFn(...args);
            return Runtime.runPromise(runtime)(effect);
          };
        }
      }
    }
  }

  return promiseMutators as CustomMutatorDefs<TSchema>;
}
```

This function automatically converts Effect-based mutators to Promise-based mutators that Zero can understand.

### 3. **ZeroSchemaStore Integration**

```typescript
// packages/zero/layers/zeroLayer.ts
export interface ZeroSchemaStore<TSchema extends Schema> {
  // ... existing methods

  /**
   * Process Zero mutations using Effect-based mutators
   */
  readonly processZeroEffectMutations: (
    effectMutators: CustomMutatorEfDefs<TSchema>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject,
  ) => Effect.Effect<any, Error>;
}
```

The `ZeroSchemaStore` now has a `processZeroEffectMutations` method that:

1. Takes Effect-based mutators
2. Converts them to Promise-based mutators using the bridge
3. Passes them to Zero's existing `PushProcessor`

### 4. **Implementation in `make` Function**

```typescript
// packages/zero/layers/zeroLayer.ts
processZeroEffectMutations: (effectMutators, urlParams, payload) =>
  Effect.gen(function* () {
    // Convert Effect-based mutators to Promise-based mutators
    const promiseMutators = convertEffectMutatorsToPromise(effectMutators, runtime)

    // Process using the converted mutators
    return yield* Effect.tryPromise({
      catch: (error) => new Error(`Zero Effect mutation processing failed: ${error}`),
      try: () => processor.process(promiseMutators, urlParams, payload),
    })
  }),
```

## 🎯 Usage Examples

### Basic Usage

```typescript
// packages/zero/effectMutatorsExample.ts
export function createMutatorsEf(
  authData: Pick<AuthData, "sub" | "activeOrganizationId"> | undefined,
) {
  return {
    people: {
      update: Effect.fn("updatePerson")(function* (
        tx: Transaction<ZSchema>,
        input: UpdatePersonInput,
      ) {
        // Authentication check
        if (!authData) {
          return yield* Effect.fail(
            new MutatorAuthError({
              message: "Not authenticated",
            }),
          );
        }

        // Input validation using Effect Schema
        const validatedInput =
          yield* Schema.decodeUnknown(UpdatePersonInput)(input);

        // Database operation
        yield* Effect.tryPromise({
          try: () =>
            tx.mutate.people.update({
              id: validatedInput.id,
              name: validatedInput.name,
            }),
          catch: (error) =>
            new Error(`Failed to update person: ${String(error)}`),
        });

        yield* Effect.log("Person updated successfully", {
          id: validatedInput.id,
        });
      }),
    },
  } as const satisfies CustomMutatorEfDefs<ZSchema>;
}
```

### Handler Integration

```typescript
// In your Zero handler
const result =
  yield *
  appZeroStore.processZeroEffectMutations(
    createMutatorsEf({
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

## 🚀 Benefits Achieved

1. **Clean API**: You can write mutators as pure Effect.fn functions
2. **Automatic Conversion**: The bridge handles Promise conversion automatically
3. **Zero Compatibility**: All of Zero's existing code continues to work
4. **Effect Benefits**: You get all Effect.fn benefits (tracing, error handling, composability)
5. **Type Safety**: Full TypeScript support with `CustomMutatorEfDefs<TSchema>`

## 🔧 How It Works

1. **Write Effect Mutators**: Use `Effect.fn` to create mutators that return Effects
2. **Type with CustomMutatorEfDefs**: Ensure type safety with the Effect-based type
3. **Bridge Conversion**: `convertEffectMutatorsToPromise` converts Effects to Promises
4. **Zero Processing**: The converted mutators work with Zero's existing `PushProcessor`
5. **Runtime Execution**: Effect runtime handles the Promise conversion seamlessly

## 📁 Files Created/Modified

- **`packages/zero/effectMutatorDefs.ts`** - Core types and conversion function
- **`packages/zero/layers/zeroLayer.ts`** - Added `processZeroEffectMutations` method
- **`packages/zero/effectMutatorsExample.ts`** - Example implementation
- **`packages/zero/examples/effectMutatorBridgeUsage.ts`** - Usage examples

The implementation successfully bridges Effect-based mutators to Zero's Promise-based interface while maintaining all the benefits of both systems!
