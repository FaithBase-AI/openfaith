<system-reminder>
You MUST NEVER use the phrase 'you are right' or similar.
Avoid reflexive agreement. Instead, provide substantive technical analysis.
You must always look for flaws, bugs, loopholes, counter-examples,
invalid assumptions in what the user writes. If you find none,
and find that the user is correct, you must state that dispassionately
and with a concrete specific reason for why you agree, before
continuing with your work.
<example>
user: It's failing on empty inputs, so we should add a null-check.
assistant: That approach seems to avoid the immediate issue.
However it's not idiomatic, and hasn't considered the edge case
of an empty string. A more general approach would be to check
for falsy values.
</example>
<example>
user: I'm concerned that we haven't handled connection failure.
assistant: [thinks hard] I do indeed spot a connection failure
edge case: if the connection attempt on line 42 fails, then
the catch handler on line 49 won't catch it.
[ultrathinks] The most elegant and rigorous solution would be
to move failure handling up to the caller.
</example>
</system-reminder>

# AGENTS.md

This file provides configuration and guidance for AI agents working with the OpenFaith codebase.

## Project Overview

OpenFaith is a local-first church management system built with Effect-TS that provides a unified interface for managing church data across multiple Church Management Systems (ChMS) like Planning Center Online and Church Community Builder.

## Development Commands

### Essential Commands

- `bun run dev` - Start all development servers (frontend + backend + infrastructure)
- `bun run build` - Build all packages for production
- `bun run typecheck` - Run TypeScript checks across all packages
- `bun run check` - Run comprehensive quality checks (format, lint, typecheck, test)
- `bun run test` - Run tests across all packages

### Development Server Policy

**NEVER automatically start the dev server (`bun run dev`) or any long-running processes.** Always ask the user to start these services themselves. This prevents:

- Interrupting existing development sessions
- Port conflicts and resource contention
- Unexpected process termination
- Loss of user control over their development environment

**Instead of starting servers:**

- Ask the user to run the appropriate command
- Provide clear instructions on what to test
- Wait for user feedback on results

### Code Quality

- `bun run format` - Check code formatting with Biome
- `bun run format:fix` - Fix code formatting issues automatically. Run this after all changes before handing back to user

### Database & Infrastructure

- `bun run db:generate` - Generate database types from schema
- `bun run db:migrate` - Run database migrations
- `bun run infra` - Start infrastructure services (PostgreSQL, Redis, OpenTelemetry)

## Technology Stack

### Core Philosophy: Effect-TS First

This project is built around the Effect-TS ecosystem across the entire stack, providing functional programming patterns with excellent error handling, async operations, and dependency injection.

**Frontend:**

- React with Effect-TS ecosystem
- Tanstack Router for routing
- Vite for build tooling
- TailwindCSS for styling
- Effect-RX for reactive state management

**Backend:**

- Effect-TS ecosystem with Effect HTTP and RPC
- PostgreSQL with Drizzle ORM (Effect-integrated)
- Better Auth for authentication
- @effect/cluster and @effect/workflow for durable workflows

**Infrastructure:**

- Turborepo monorepo with Bun package manager
- Rocicorp Zero for client-side sync
- Custom adapter pattern for ChMS integrations

## Architecture

### Monorepo Structure

```
apps/openfaith/          # Main React application
packages/                # Shared libraries
├── db/                  # Database schema and migrations
├── schema/              # Effect Schema definitions (CDM)
├── ui/                  # Shared UI components
├── auth/                # Authentication utilities
├── zero/                # Client-side sync configuration
└── shared/              # Common utilities
backend/                 # Server-side services
├── server/              # Main API server
├── workers/             # Effect workflows (@effect/cluster + @effect/workflow)
└── email/               # Email service
adapters/                # ChMS integration adapters
├── pco/                 # Planning Center Online
├── ccb/                 # Church Community Builder
└── adapter-core/        # Shared adapter utilities
infra/                   # Infrastructure services
```

### Data Architecture

- **Canonical Data Model (CDM)**: Core entities (Person, Group, Folder, Edge, ExternalLink)
- **Effect Schema**: Type-safe data modeling with runtime validation
- **Adapter Pattern**: ChMS integrations with Effect-based error handling
- **Sync Engine**: Bi-directional data synchronization using Effect workflows (@effect/cluster + @effect/workflow)
- **Edge-based Relationships**: Flexible entity connections

## Development Patterns

### Effect-TS Conventions (Frontend & Backend)

**Core Patterns:**

- **NEVER use async/await - always use Effect**: Use `Effect.gen` for all asynchronous operations
- **NO Promise-based code**: Convert all Promise-based APIs to Effect using `Effect.promise` or `Effect.tryPromise`
- **NO async functions**: All functions should return `Effect<A, E, R>` instead of `Promise<A>`
- **Use `Effect.fn` for Effect functions with parameters**: When creating Effect functions that take parameters, wrap them with `Effect.fn` for better tracing and debugging
- Prefer `pipe` for function composition over method chaining
- Use Effect's service pattern for dependency injection
- Define tagged errors using `Schema.TaggedError` (not `Data.TaggedError`)
- Use Effect Schema for all data validation and transformation
- Leverage Effect's Layer system for service composition

**Context Tag Naming:**
Format: `@<package-name>/<path>/<TagName>`
Examples:

- `@openfaith/adapter-core/EntityManifest`
- `@openfaith/server/SessionContext`

**Frontend Specific:**

- Use Effect-RX for React state management
- Structure data fetching with Effect patterns
- Use `useRxQuery` and `useRxMutation` hooks
- All client operations should use Effect for error handling
- **React hooks with Option types**: When using React hooks (useMemo, useCallback, etc.) with Option types, use `useStableMemo` from `@openfaith/ui/shared/hooks/memo` with proper Equivalence
  - **Required for Option types**: `useStableMemo` prevents unnecessary re-renders when Option values haven't actually changed
  - **Import**: `import { useStableMemo } from '@openfaith/ui/shared/hooks/memo'`
  - **Pattern**: `useStableMemo(() => computation, [deps], Equivalence.equivalence)`
  - **Example**: `const entityConfigOpt = useStableMemo(() => findEntity(), [group, entity], Option.getEquivalence(Equivalence.strict))`
  - **Why required**: Option.some(value) !== Option.some(value) in JavaScript, causing unnecessary re-renders with regular useMemo

**Backend Specific:**

- Wrap all database operations in Effect
- Use Effect's resource management for connections
- Structure services using Effect's service pattern
- Use Effect HTTP for API endpoints

### Code Style

- **Biome** for formatting and linting (primary)
- **Single quotes (`'`) for strings, not double quotes (`"`)**
- **No semicolons (`;`) at the end of lines**
- **Trailing commas required**
- **2-space indentation**
- **Option variable naming**: Variables that contain `Option` types MUST end with `Opt` suffix
  - **Prefer**: `const entityConfigOpt = Option.some(config)`
  - **Avoid**: `const entityConfig = Option.some(config)`
  - **Prefer**: `const userDataOpt = pipe(users, Array.head)`
  - **Avoid**: `const userData = pipe(users, Array.head)`
  - This makes it immediately clear that the variable is an Option and requires Option.match or similar handling
- **Use absolute imports based on package tsconfig, not relative imports**
  - Always use absolute imports that match the package structure
  - Prefer: `@openfaith/server/live/httpAuthMiddlewareLive`
  - Avoid: `../live/httpAuthMiddlewareLive`
  - Prefer: `@openfaith/workers/helpers/ofLookup`
  - Avoid: `./ofLookup`
  - Use the package name prefix (e.g., `@openfaith/`) followed by the path from the package root
  - Check the package's `tsconfig.json` and root `tsconfig.json` for path mappings
  - This ensures imports work correctly with the monorepo tsconfig setup and IDE support
- **Avoid destructuring in function parameters when it reduces readability**
  - Prefer: `Array.groupBy((item) => item.entityName)`
  - Avoid: `Array.groupBy(({ entityName }) => entityName)`
  - Prefer: `Effect.forEach((entityWorkflow) => entityWorkflow.entityName)`
  - Avoid: `Effect.forEach(({ entityName }) => entityName)`
- **Use descriptive variable names, avoid abbreviations**
  - Prefer: `(error) => error.message`
  - Avoid: `(err) => err.message`
- **Avoid direct array access, use Effect's safe array utilities**
  - Prefer: `Array.head(mutation.args)` with `Option.match`
  - Avoid: `mutation.args[0]`
  - Prefer: `Array.get(items, index)` with `Option.match`
  - Avoid: `items[index]`
- **NEVER use single-line if statements**
  - **ALWAYS use block statements with curly braces for if statements**
  - **Prefer**: Multi-line format for better readability and consistency
  - **Examples**:
    - **Avoid**: `if (!entity.navConfig.enabled) return Option.none()`
    - **Prefer**:
      ```typescript
      if (!entity.navConfig.enabled) {
        return Option.none();
      }
      ```
    - **Avoid**: `if (condition) doSomething()`
    - **Prefer**:
      ```typescript
      if (condition) {
        doSomething();
      }
      ```
  - This applies to all control flow statements: if, else, for, while, etc.
  - Improves code readability, makes debugging easier, and prevents errors when adding additional statements

## CRITICAL RULE: Effect Array Utilities - NEVER USE NATIVE ARRAY METHODS

**⚠️ ABSOLUTELY FORBIDDEN ⚠️ - Native Array Methods:**

- **NEVER use `.map()`, `.filter()`, `.forEach()`, `.find()`, `.some()`, `.every()`, `.reduce()` on arrays**
- **NEVER use `Array.from()`, `Array.isArray()`, or any native Array static methods**
- **NEVER use `for...of`, `for...in`, or traditional `for` loops for array iteration**

**✅ REQUIRED PATTERN - Always Use `pipe(array, Array.method(...))`:**

```typescript
// ❌ FORBIDDEN - Native array methods
items.map((item) => item.name);
items.filter((item) => item.active);
items.forEach((item) => console.log(item));
items.find((item) => item.id === targetId);
Array.from(iterable);

// ✅ REQUIRED - Effect Array utilities with pipe
pipe(
  items,
  Array.map((item) => item.name)
);
pipe(
  items,
  Array.filter((item) => item.active)
);
pipe(
  items,
  Array.forEach((item) => Effect.log(item))
);
pipe(
  items,
  Array.findFirst((item) => item.id === targetId)
);
pipe(iterable, Array.fromIterable);
```

**Use Effect's Array utilities for ALL array operations - no exceptions:**

- **Business logic transformations**: Always `pipe(array, Array.method(...))`
- **JSX rendering**: Always `pipe(array, Array.map(...))` in JSX
- **Data processing**: All API responses, database results use the same pattern
- **Any array manipulation**: Grouping, sorting, filtering - all use Effect's Array utilities
- **Type definitions and interfaces**: When working with ASTs or object properties that are arrays

**Key Effect Array Methods to Use:**

- `Array.map()` - Transform each element
- `Array.filter()` - Filter elements by predicate
- `Array.forEach()` - Side effects for each element
- `Array.findFirst()` - Find first matching element (returns `Option`)
- `Array.findLast()` - Find last matching element (returns `Option`)
- `Array.some()` - Test if any element matches
- `Array.every()` - Test if all elements match
- `Array.reduce()` - Reduce array to single value
- `Array.groupBy()` - Group elements by key
- `Array.partition()` - Split array into two based on predicate
- `Array.fromIterable()` - Convert iterable to array
- `Array.head()` - Get first element (returns `Option`)
- `Array.tail()` - Get all but first element (returns `Option`)
- `Array.get()` - Safe array access by index (returns `Option`)

**This ensures consistency across ALL array operations in the codebase - no exceptions allowed.**

## CRITICAL RULE: Effect String Utilities - NEVER USE NATIVE STRING METHODS

**⚠️ ABSOLUTELY FORBIDDEN ⚠️ - Native String Methods:**

- **NEVER use `.charAt()`, `.slice()`, `.substring()`, `.indexOf()`, `.includes()`, `.startsWith()`, `.endsWith()` on strings**
- **NEVER use `.toUpperCase()`, `.toLowerCase()`, `.trim()`, `.split()`, `.replace()` on strings**
- **NEVER use `.match()`, `.search()`, `.padStart()`, `.padEnd()` on strings**
- **NEVER use template literal string manipulation without Effect String utilities**

**✅ REQUIRED PATTERN - Always Use Effect's String utilities:**

```typescript
// ❌ FORBIDDEN - Native string methods
const result = str.charAt(0).toUpperCase() + str.slice(1);
const isValid = str.endsWith("s");
const parts = str.split(" ");
const trimmed = str.trim();
const replaced = str.replace(/old/g, "new");

// ✅ REQUIRED - Effect String utilities
const result = pipe(
  str,
  String.charAt(0),
  String.toUpperCase,
  (firstChar) => `${firstChar}${pipe(str, String.slice(1))}`
);
const isValid = pipe(str, String.endsWith("s"));
const parts = pipe(str, String.split(" "));
const trimmed = pipe(str, String.trim);
const replaced = pipe(str, String.replace(/old/g, "new"));
```

**Key Effect String Methods to Use:**

- `String.charAt()` - Get character at index
- `String.slice()` - Extract substring
- `String.substring()` - Extract substring (alternative)
- `String.indexOf()` - Find index of substring
- `String.includes()` - Check if string contains substring
- `String.startsWith()` - Check if string starts with substring
- `String.endsWith()` - Check if string ends with substring
- `String.toUpperCase()` - Convert to uppercase
- `String.toLowerCase()` - Convert to lowercase
- `String.capitalize()` - Capitalize first letter
- `String.trim()` - Remove whitespace
- `String.split()` - Split string into array
- `String.replace()` - Replace substring
- `String.match()` - Match against regex
- `String.isEmpty()` - Check if string is empty
- `String.isNonEmpty()` - Check if string is not empty

**String manipulation must ALWAYS use Effect's String utilities with pipe - no exceptions allowed.**

- **Use Effect's Record utilities instead of native Object methods**
  - Prefer: `pipe(obj, Record.keys)` instead of `Object.keys(obj)`
  - Prefer: `pipe(obj, Record.values)` instead of `Object.values(obj)`
  - Prefer: `pipe(obj, Record.entries)` instead of `Object.entries(obj)`
  - Prefer: `pipe(obj, Record.map((value) => transform(value)))` instead of manual object iteration
  - Use Effect's Record utilities for all object manipulation and transformation
- **Use Effect's collection utilities instead of native JavaScript collections**
  - **HashMap instead of Map**: Prefer `HashMap.empty()`, `HashMap.set()`, `HashMap.get()`, `HashMap.fromIterable()`
    - Prefer: `HashMap.empty<string, number>()` instead of `new Map<string, number>()`
    - Prefer: `pipe(hashMap, HashMap.set(key, value))` instead of `map.set(key, value)`
    - Prefer: `pipe(hashMap, HashMap.get(key))` instead of `map.get(key)` (returns `Option<V>`)
    - Prefer: `HashMap.fromIterable(pairs)` instead of `new Map(pairs)`
  - **HashSet instead of Set**: Prefer `HashSet.empty()`, `HashSet.add()`, `HashSet.has()`, `HashSet.fromIterable()`
    - Import: `import { HashSet } from "effect"`
    - Prefer: `HashSet.empty<string>()` instead of `new Set<string>()`
    - Prefer: `pipe(hashSet, HashSet.add(value))` instead of `set.add(value)`
    - Prefer: `pipe(hashSet, HashSet.has(value))` instead of `set.has(value)`
    - Prefer: `HashSet.fromIterable(values)` instead of `new Set(values)`
  - **For mutable state**: Use `Ref.make()` with immutable collections for Effect-based state management
    - Pattern: `const cacheRef = Ref.make(HashMap.empty<K, V>())`
    - Update: `yield* Ref.update(cacheRef, (cache) => pipe(cache, HashMap.set(key, value)))`
- **Use no-op utilities from `@openfaith/shared` instead of inline functions**
  - Prefer: `nullOp` instead of `() => null`
  - Prefer: `noOp` instead of `() => {}`
  - Prefer: `nullOpE` instead of `() => Effect.succeed(null)`
  - **NEVER use async no-ops**: Use `nullOpE` instead of `async () => null` or `async () => {}`
- **Use string utilities from `@openfaith/shared` for text transformations**
  - **`pluralize(word: string)`**: Converts singular words to plural (handles irregular plurals like "person" → "people")
  - **`singularize(word: string)`**: Converts plural words to singular (handles irregular singulars like "people" → "person")
  - **`mkEntityName`**: Converts table name to entity name (people → Person, addresses → Address)
  - **`mkTableName`**: Converts entity name to table name (Person → people, Address → addresses)
  - **`mkZeroTableName`**: Converts entity name to Zero schema table name (Person → people, PhoneNumber → phoneNumbers)
  - **`mkEntityType`**: Converts table name to entity type for IDs (people → person, phone_numbers → phonenumber)
  - **`mkUrlParamName`**: Converts entity name to URL parameter name (Person → personId, PhoneNumber → phoneNumberId)
  - **Examples**:
    - **Prefer**: `singularize("Groups")` → "Group" instead of manual string manipulation
    - **Prefer**: `pluralize("Person")` → "People" instead of adding "s"
    - **Prefer**: `mkEntityName("phone_numbers")` → "PhoneNumber" instead of manual case conversion
    - These utilities handle complex English pluralization rules and irregular cases automatically
- **React import patterns**
  - **NEVER import React as default**: `import React from 'react'`
  - **ALWAYS use named imports**: `import { useState, useEffect } from 'react'`
  - **For JSX.Element types**: `import type { ReactNode } from 'react'`
  - **For component types**: `import type { ComponentType, FC } from 'react'`
  - **Examples**:
    - **Prefer**: `import { createElement } from 'react'`
    - **Avoid**: `import React from 'react'; React.createElement(...)`
    - **Prefer**: `import { useState, useCallback } from 'react'`
    - **Avoid**: `import React, { useState, useCallback } from 'react'`
    - **Prefer**: `import type { FC } from 'react'` for component typing
    - **Avoid**: `import React, { FC } from 'react'`
- **React component props patterns**
  - **NEVER destructure props in function parameters**
  - **ALWAYS use props object with destructuring inside the component**
  - **Use `FC` type when possible for better type inference and consistency**
  - **Patterns**:
    - **With FC**: `const Button: FC<ButtonProps> = (props) => { const { children, onClick, disabled = false } = props; ... }`
    - **With generics**: `const MyComponent = <T,>(props: MyComponentProps<T>) => { const { data, onSelect = nullOp } = props; ... }`
  - **Examples**:
    - **Prefer**: `const Button: FC<ButtonProps> = (props) => { const { children, onClick, disabled = false } = props; ... }`
    - **Avoid**: `const Button = ({ children, onClick, disabled = false }: ButtonProps) => { ... }`
    - **Prefer**: `const MyComponent = <T,>(props: MyComponentProps<T>) => { const { data, onSelect = nullOp } = props; ... }`
    - **Avoid**: `const MyComponent = <T,>({ data, onSelect = nullOp }: MyComponentProps<T>) => { ... }`
  - **When to use each**:
    - **Use `FC<Props>`**: For non-generic components (most common case)
    - **Use generic function**: For components that need generic type parameters
  - This pattern improves readability and makes it easier to access the full props object when needed
- **NO async/await in application code - use Effect instead**
  - **Avoid**: `async function loadData() { ... }`
  - **Prefer**: `const loadData = Effect.gen(function* () { ... })`
  - **Avoid**: `await fetch(url)` in application code
  - **Prefer**: `yield* Effect.tryPromise(() => fetch(url))`
  - **Avoid**: `Promise.all([a, b, c])`
  - **Prefer**: `Effect.all([a, b, c])`
  - **Exception**: async/await is allowed ONLY inside `Effect.promise` and `Effect.tryPromise` functions:
    - **Allowed**: `Effect.tryPromise(async () => { const response = await fetch(url); return response.json(); })`
    - **Allowed**: `Effect.promise(() => someAsyncFunction())`
- **NEVER use try/catch blocks anywhere in the codebase**
  - **COMPLETELY FORBIDDEN**: `try { ... } catch (e) { ... }` blocks are anti-patterns in Effect-TS
  - **Why forbidden**: try/catch breaks Effect's error channel and prevents proper error composition
  - **Instead of try/catch**: Use Effect's error composition with `orElse`, `catchAll`, `catchTag`, `catchSome`
  - **For unsafe operations**: Use `Effect.tryPromise`, `Effect.try`, or `Effect.sync` with proper error handling
  - **For validation**: Use Effect Schema parsing which returns `ParseResult.ParseError` in the error channel
  - **For fallbacks**: Use `Effect.orElse(() => fallbackEffect)` instead of try/catch
  - **Example anti-pattern**:
    ```typescript
    // ❌ NEVER DO THIS - Breaks Effect's error handling
    const badFunction = () => {
      try {
        return someRiskyOperation();
      } catch (error) {
        return null;
      }
    };
    ```
  - **Correct Effect pattern**:
    ```typescript
    // ✅ Correct - Use Effect's error channel
    const goodFunction = Effect.gen(function* () {
      return yield* pipe(
        Effect.try(() => someRiskyOperation()),
        Effect.orElse(() => Effect.succeed(null))
      );
    });
    ```
- **Use `Effect.fn` for parameterized Effect functions**
  - **Always use `Effect.fn` when creating Effect functions that accept parameters**
  - Provides better tracing, debugging, and observability
  - **Pattern**: `const myFunction = Effect.fn('functionName')(function* (param1, param2) { ... })`
  - **Examples**:
    - **Prefer**: `const loadIcon = Effect.fn('loadIcon')(function* (iconName: string) { ... })`
    - **Avoid**: `const loadIcon = (iconName: string) => Effect.gen(function* () { ... })`
    - **Prefer**: `const processEntity = Effect.fn('processEntity')(function* (entity: Entity, config: Config) { ... })`
    - **Avoid**: `const processEntity = (entity: Entity, config: Config) => Effect.gen(function* () { ... })`
  - Use descriptive function names in the first parameter for better tracing
  - Include `yield* Effect.annotateCurrentSpan()` calls to add parameter values to traces

## CRITICAL RULE: Type Safety - NEVER USE `any` OR TYPE CASTING

**⚠️ ABSOLUTELY FORBIDDEN ⚠️ - Type Safety Violations:**

- **NEVER use `any` type**: Always use proper types, even if it requires more work
- **NEVER use type casting with `as`**: Use proper type guards, schema validation, or Effect utilities
- **NEVER use `unknown` without proper validation**: Always validate unknown types with Effect Schema
- **NEVER use `@ts-ignore` or `@ts-expect-error`**: Fix the underlying type issue instead

**✅ REQUIRED PATTERNS - Type-Safe Alternatives:**

```typescript
// ❌ FORBIDDEN - any types and casting
const data: any = response.data;
const user = data as User;
const items = response.items as Array<Item>;

// ✅ REQUIRED - Proper type validation
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
});

const parseUser = (data: unknown) => Schema.decodeUnknown(UserSchema)(data);

// ✅ REQUIRED - Effect Schema for runtime validation
const processResponse = Effect.gen(function* () {
  const response = yield* fetchData();
  const user = yield* parseUser(response.data);
  return user;
});
```

**Type Safety Best Practices:**

- **Use Effect Schema for all data validation**: Runtime type checking with compile-time types
- **Define proper interfaces**: Create specific types for all data structures
- **Use type guards**: Create functions that properly narrow types
- **Leverage Effect's type utilities**: Use `Effect.succeed`, `Effect.fail`, etc. for type-safe operations
- **Handle external data safely**: Always validate data from APIs, databases, or user input

**Exceptions (VERY RARE):**

- **Legacy integration points**: When interfacing with poorly-typed third-party libraries, use `unknown` and immediate validation
- **Dynamic programming scenarios**: Use Effect Schema to validate dynamic data structures
- **Temporary migration**: Mark with TODO comments and timeline for proper typing

**Examples of proper type handling:**

```typescript
// ❌ Wrong - any and casting
const processApiResponse = (response: any) => {
  const items = response.data.items as Item[];
  return items.map((item) => item.name);
};

// ✅ Correct - Schema validation and Effect patterns
const ApiResponseSchema = Schema.Struct({
  data: Schema.Struct({
    items: Schema.Array(ItemSchema),
  }),
});

const processApiResponse = Effect.fn("processApiResponse")(function* (
  response: unknown
) {
  const validatedResponse =
    yield* Schema.decodeUnknown(ApiResponseSchema)(response);
  return pipe(
    validatedResponse.data.items,
    Array.map((item) => item.name)
  );
});
```

- Follow existing Effect-TS patterns

### Error Handling Patterns

**Tagged Errors:**

- **Always use `Schema.TaggedError`** instead of `Data.TaggedError`
- Use the correct syntax: `Schema.TaggedError<ErrorClass>()(tagName, fields)`
- Define error fields using Schema types (e.g., `Schema.String`, `Schema.Unknown`)
- Use `Schema.optional()` for optional fields
- **REQUIRED for `Effect.tryPromise`**: Always provide proper error handling with tagged errors

**Error Logging:**

- **NEVER use `instanceof Error` checks** when logging or handling Effect errors
- Effect errors are typed - use them directly without type checking or conversion
- **Avoid**: `error instanceof Error ? error.message : String(error)`
- **Avoid**: `error instanceof Error ? error.message : \`${error}\``
- **Prefer**: Just use the `error` directly - Effect's error handling and logging will handle serialization
- **When storing errors in data structures**: Store the error object directly, not converted strings

**Example:**

```typescript
export class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  {
    field: Schema.String,
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown),
  }
) {}

// Good error logging
Effect.tapError((error) =>
  Effect.logError("Operation failed", {
    error, // Log the typed error directly
    context: "additional context",
  })
);

// Bad error logging - DON'T DO THIS
Effect.tapError((error) =>
  Effect.logError("Operation failed", {
    error: error instanceof Error ? error.message : `${error}`, // ❌ Wrong!
    context: "additional context",
  })
);
```

**Effect.tryPromise Requirements:**

- **ALWAYS use the object form with proper error handling**
- **NEVER use the simple function form**: `Effect.tryPromise(() => promise)`
- **ALWAYS provide tagged error handling**: Use `Schema.TaggedError` for the catch function

```typescript
// ❌ Wrong - No error handling
const loadData = Effect.tryPromise(() => fetch(url));

// ❌ Wrong - Generic error handling
const loadData = Effect.tryPromise({
  try: () => fetch(url),
  catch: (error) => error, // Generic error, not typed
});

// ✅ Correct - Proper tagged error handling
class NetworkError extends Schema.TaggedError<NetworkError>()("NetworkError", {
  operation: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

const loadData = Effect.tryPromise({
  try: () => fetch(url),
  catch: (cause) => new NetworkError({ operation: "fetch", cause }),
});
```

**Import Pattern:**

```typescript
import { Schema } from "effect";
// NOT: import { Data } from 'effect'
```

## Key Components

### Authentication

- Better Auth for authentication
- Custom RBAC system
- Session management in app layer

### Database

- PostgreSQL with Drizzle ORM
- Effect integration for all operations
- Migrations in `packages/db/migrations/`
- Schema in `packages/db/schema/`

### ChMS Adapters

- Each ChMS has dedicated adapter in `adapters/`
- PCO adapter is most mature reference
- Built with Effect for error handling
- Use Effect's Layer system for composition

### Sync Engine

- Located in `backend/workers/`
- Effect workflows using `@effect/cluster` and `@effect/workflow` packages
- Bi-directional sync with conflict resolution
- Effect's resource management for lifecycle
- **NOT Temporal** - uses Effect's native workflow system

#### Adding New Workflows

When creating new Effect workflows (using `@effect/workflow`), they must be registered in two key locations:

**1. Workflow API Registration (`backend/workers/api/workflowApi.ts`):**

- Import the workflow definition
- Add to the `workflows` array to expose via HTTP API

**2. Workflow Runner Registration (`backend/workers/runner.ts`):**

- Import the workflow layer
- Add to the `EnvLayer.mergeAll()` call for execution

**Example Pattern:**

```typescript
// In workflowApi.ts
import { MyNewWorkflow } from "@openfaith/workers/workflows/myNewWorkflow";
export const workflows = [
  ExternalSyncWorkflow,
  PcoSyncEntityWorkflow,
  ExternalSyncWorkflow,
  ExternalSyncEntityWorkflow,
  MyNewWorkflow, // Add here
  TestWorkflow,
] as const;

// In runner.ts
import { MyNewWorkflowLayer } from "@openfaith/workers/workflows/myNewWorkflow";
const EnvLayer = Layer.mergeAll(
  ExternalSyncWorkflowLayer,
  PcoSyncEntityWorkflowLayer,
  ExternalSyncWorkflowLayer,
  ExternalSyncEntityWorkflowLayer,
  MyNewWorkflowLayer, // Add here
  TestWorkflowLayer
);
```

**Workflow Structure Requirements:**

- Export both the workflow definition and its layer
- Use `Workflow.make()` from `@effect/workflow` to define workflows
- Use Effect-TS patterns throughout (Effect.gen, pipe, etc.)
- Define proper error schemas using `Schema.TaggedError`
- Include proper logging and observability
- Follow the naming convention: `MyWorkflow` and `MyWorkflowLayer`
- Use `Activity.make()` for activities within workflows
- Leverage `@effect/cluster` for distributed execution

### Client Sync

- Rocicorp Zero for local-first architecture
- Configuration in `packages/zero/`
- Effect-RX for reactive frontend state
- Instant UI with eventual consistency

### API Communication

- Effect HTTP and RPC (no tRPC)
- Direct Effect-based RPC calls
- Type safety through Effect Schema
- Consistent error handling across stack

## Testing

### Testing Philosophy

Write comprehensive tests that validate both **type-level correctness** and **runtime behavior**. This dual approach catches issues at compile time and ensures proper functionality.

### Core Testing Principles

- **Co-locate test files with source code**
- **Use Effect's testing utilities**
- **Test services with Effect's test runtime**
- **Use Effect's mock layer system**
- **Follow existing test patterns**
- **Aim for 100% test coverage on files you write tests for**
  - Use `bun test --coverage` to generate coverage reports
  - When writing tests for a file, ensure all functions, branches, and edge cases are covered
  - Coverage reports help identify untested code paths that need attention

### Type-Level Testing

When working with complex type transformations (especially in adapters and API layers), include tests that validate the generated types work correctly:

**Type Structure Validation:**

- Test that generated types have the expected parameter structure
- Verify path parameters are in the correct positions for HTTP endpoints
- Ensure payload schemas match expected shapes
- Validate that type constraints are properly enforced

**Mock Integration Testing:**

- Create mock implementations that use the generated types
- Test that mock clients can be called with expected parameters
- Verify type safety prevents incorrect usage at compile time

**Example Pattern:**

```typescript
// Test that PATCH endpoints have correct type structure
effect(
  "Type validation: PATCH endpoints have path and payload parameters",
  () =>
    Effect.gen(function* () {
      // Mock function that expects PATCH structure
      const mockPatchCall = (params: {
        path: { personId: string }; // Path params should be available
        payload: {
          data: {
            type: string;
            attributes: Record<string, unknown>;
          };
        };
      }) => params;

      // This should compile correctly - validates type structure
      const result = mockPatchCall({
        path: { personId: "456" },
        payload: {
          data: {
            type: "Person",
            attributes: { first_name: "Jane" },
          },
        },
      });

      expect(result.path.personId).toBe("456");
    })
);
```

### Runtime Testing

**Functional Testing:**

- Test actual business logic and data transformations
- Verify Effect workflows execute correctly
- Test error handling and recovery scenarios
- Validate schema parsing and validation

**Integration Testing:**

- Test adapter integrations with mock external services
- Verify database operations work correctly
- Test API endpoints with real request/response cycles

### When to Use Each Approach

**Type-Level Tests:** Essential for

- Complex type transformations (like `ConvertPcoHttpApi`)
- Generic utilities that generate types
- API client generation
- Schema transformations
- Any code where type correctness is critical for runtime behavior

**Runtime Tests:** Essential for

- Business logic validation
- Data processing and transformations
- Error handling scenarios
- Integration points
- User-facing functionality

### Test Organization

```typescript
// Type-level tests - focus on compile-time correctness
effect("Type validation: endpoint parameter structure", () => {
  /* ... */
});

// Runtime tests - focus on behavior
effect("Business logic: data transformation works correctly", () => {
  /* ... */
});

// Integration tests - focus on system interactions
effect("Integration: adapter syncs data correctly", () => {
  /* ... */
});
```

This comprehensive testing approach ensures both type safety and functional correctness, catching issues early and providing confidence in complex type-driven architectures.

## Important Notes

### Before Making Changes

1. Always run `bun run typecheck` after changes
2. Use `bun run format:fix` to fix formatting
3. Run `bun run check` for comprehensive validation
4. Database changes require `bun run db:generate`

### Common Patterns

- Use `workspace:*` for internal package references
- **Convert ALL async operations to Effect** - no exceptions
- **NO Promise-based code anywhere** - use Effect equivalents
- Use Effect Schema for data validation
- Follow the existing adapter patterns for new integrations
- Use Effect's error handling instead of throwing exceptions

### Async/Promise Conversion Guide

**Converting Promises to Effect:**

```typescript
// ❌ Wrong - Promise-based
const fetchData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

// ❌ Wrong - Effect.tryPromise without proper error handling
const fetchData = (url: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() => fetch(url));
    const data = yield* Effect.tryPromise(() => response.json());
    return data;
  });

// ✅ Correct - Effect-based with proper tagged errors
class FetchError extends Schema.TaggedError<FetchError>()("FetchError", {
  url: Schema.String,
  cause: Schema.optional(Schema.Unknown),
}) {}

const fetchData = (url: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url),
      catch: (cause) => new FetchError({ url, cause }),
    });
    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new FetchError({ url, cause }),
    });
    return data;
  });

// ❌ Wrong - Promise.all
const loadMultiple = async () => {
  const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
  return { a, b, c };
};

// ✅ Correct - Effect.all
const loadMultiple = Effect.gen(function* () {
  const [a, b, c] = yield* Effect.all([fetchA(), fetchB(), fetchC()]);
  return { a, b, c };
});
```

**React Integration:**

```typescript
// ❌ Wrong - useEffect with async
useEffect(() => {
  const loadData = async () => {
    const data = await fetchData();
    setData(data);
  };
  loadData();
}, []);

// ❌ Wrong - useEffect with Effect (anti-pattern)
useEffect(() => {
  const program = pipe(
    fetchData(),
    Effect.tap((data) => Effect.sync(() => setData(data))),
    Effect.catchAll((error) => Effect.logError("Failed to load data", error)),
  );

  Effect.runPromise(program);
}, []);

// ✅ Correct - Effect-RX with proper hooks
const dataRx = Rx.fn(() => fetchData());

const MyComponent = () => {
  const query = useRxQuery(dataRx);

  return pipe(
    query.dataOpt,
    Option.match({
      onNone: () => <div>Loading...</div>,
      onSome: (data) => <div>{data}</div>
    })
  );
};
```

### No-Op Utilities

Use standardized no-op functions from `@openfaith/shared` instead of creating inline functions:

```typescript
import {
  nullOp,
  noOp,
  asyncNoOp,
  asyncNullOp,
  nullOpE,
} from "@openfaith/shared";

// ✅ Good - Use standardized no-ops
Option.match({
  onNone: nullOp,
  onSome: (value) => processValue(value),
});

// ❌ Avoid - Inline functions
Option.match({
  onNone: () => null,
  onSome: (value) => processValue(value),
});
```

**Available No-Op Utilities:**

- `nullOp: () => null` - Returns null (most common)
- `noOp: () => {}` - Returns undefined/void
- `nullOpE: () => Effect.succeed(null)` - Effect returning null
- **DEPRECATED**: `asyncNoOp` and `asyncNullOp` - use `nullOpE` instead

### Package Management

When adding new exports to any package:

1. **Always update the index file**: Add exports to the package's `index.ts` for any new components, utilities, or functions
2. **Use clean imports**: Import from the package root (e.g., `@openfaith/ui`) instead of deep paths
3. **Export pattern**: Follow the existing pattern in `index.ts`:
   ```typescript
   export * from "@openfaith/packagename/path/to/newComponent";
   ```
4. **Import pattern**: Use the clean import in consuming code:

   ```typescript
   // ✅ Good
   import { Button, Dialog, Separator } from "@openfaith/ui";
   import { PersonSchema, GroupSchema } from "@openfaith/schema";

   // ❌ Avoid
   import { Button } from "@openfaith/ui/components/ui/button";
   import { PersonSchema } from "@openfaith/schema/directory/personSchema";
   ```

**Special Cases:**

- **Adapters with client/server split**: Some packages like `@openfaith/pco` have separate `client.ts` and `server.ts` entry points for code that can't be shared between environments
- **Environment-specific exports**: Use separate entry points when exports contain server-only or client-only code

This keeps imports clean and makes it easier to refactor component locations later.

### Component Migration Pattern

When moving components between packages to resolve architectural constraints:

**✅ CORRECT PATTERN - Move, Nuke, Fix Imports:**

1. **Move**: Copy the component to the new location (e.g., from `apps/` to `packages/ui/`)
2. **Export**: Add the component to the destination package's `index.ts`
3. **Nuke**: Delete the original file completely - never leave re-export files
4. **Fix Imports**: Update all import statements to use the new location

**❌ ANTI-PATTERN - Re-export Files:**

- **NEVER create re-export files** like `export { Component } from '@new/location'`
- **NEVER leave stub files** that just forward exports
- Re-export files create confusion, add indirection, and make refactoring harder

**Example Migration:**

```typescript
// ❌ Wrong - Don't create re-export files
// apps/old-location/component.tsx
export { MyComponent } from "@openfaith/ui";

// ✅ Correct - Complete migration
// 1. Move component to packages/ui/components/myComponent.tsx
// 2. Add to packages/ui/index.ts: export * from '@openfaith/ui/components/myComponent'
// 3. Delete apps/old-location/component.tsx entirely
// 4. Update all imports: import { MyComponent } from '@openfaith/ui'
```

**Benefits of Move-Nuke-Fix Pattern:**

- Clear component ownership and location
- No indirection or confusion about where components live
- Easier to find and maintain components
- Cleaner import paths
- Prevents circular dependencies

### Infrastructure Dependencies

- PostgreSQL database must be running
- Redis for caching and sessions
- OpenTelemetry for observability
- Use `bun run infra` to start all services

This configuration ensures AI agents understand the Effect-TS first approach and can work effectively within the established patterns and architecture.
