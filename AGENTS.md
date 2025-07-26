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

### Code Quality

- `bun run format` - Check code formatting with Biome
- `bun run format:fix` - Fix code formatting issues automatically. Run this after all changes before handing back to user
- `bun run lint:biome` - Run Biome linter
- `bun run lint:biome:fix` - Fix Biome linting issues
- `bun run lint:eslint` - Run ESLint with caching
- `bun run lint:eslint:fix` - Fix ESLint issues automatically

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

- Use `Effect.gen` for async operations instead of async/await
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
- **Use Effect's Array utilities instead of native array methods**
  - Prefer: `pipe(items, Array.map((item) => item.name))`
  - Avoid: `items.map((item) => item.name)`
  - Avoid: `Array.map(items, (item) => item.name)`
  - Prefer: `pipe(items, Array.filter((item) => item.active))`
  - Avoid: `items.filter((item) => item.active)`
  - Avoid: `Array.filter(items, (item) => item.active)`
- Follow existing Effect-TS patterns

### Error Handling Patterns

**Tagged Errors:**

- **Always use `Schema.TaggedError`** instead of `Data.TaggedError`
- Use the correct syntax: `Schema.TaggedError<ErrorClass>()(tagName, fields)`
- Define error fields using Schema types (e.g., `Schema.String`, `Schema.Unknown`)
- Use `Schema.optional()` for optional fields

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
  },
) {}

// Good error logging
Effect.tapError((error) =>
  Effect.logError("Operation failed", {
    error, // Log the typed error directly
    context: "additional context",
  }),
);

// Bad error logging - DON'T DO THIS
Effect.tapError((error) =>
  Effect.logError("Operation failed", {
    error: error instanceof Error ? error.message : `${error}`, // ❌ Wrong!
    context: "additional context",
  }),
);
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
  TestWorkflowLayer,
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
    }),
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
- Wrap all async operations in Effect
- Use Effect Schema for data validation
- Follow the existing adapter patterns for new integrations
- Use Effect's error handling instead of throwing exceptions

### Infrastructure Dependencies

- PostgreSQL database must be running
- Redis for caching and sessions
- OpenTelemetry for observability
- Use `bun run infra` to start all services

This configuration ensures AI agents understand the Effect-TS first approach and can work effectively within the established patterns and architecture.
