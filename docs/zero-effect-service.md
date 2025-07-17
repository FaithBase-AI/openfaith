# Zero Effect Mutator Service

## Overview

This document provides a comprehensive specification for creating an Effect-based service wrapper for Zero's custom mutators. The goal is to enable seamless integration between Zero's push processor and Effect's service pattern, abstracting away manual error handling and providing a clean, reusable interface for any Zero setup.

## Problem Analysis

### Current State

1. **Client Side** (`packages/zero/mutators.ts`): Creates mutators with basic auth validation
2. **Server Side** (`backend/server/handlers/zeroMutatorsHandler.ts`): Uses `PushProcessor` to handle mutations with manual error handling
3. **Current Issues**:
   - Manual error handling with `Effect.tryPromise`
   - No unified Effect service pattern
   - Tight coupling between Zero's push processor and Effect patterns
   - No reusable abstraction for other Zero setups

### Desired State

We want to create a general-purpose Effect wrapper that:

1. Provides a clean Effect service interface for Zero mutations
2. Handles errors using Effect's error handling system
3. Can be reused across different Zero setups
4. Integrates seamlessly with Effect's dependency injection
5. Maintains type safety throughout the stack

## Architecture

### Core Components

1. **ZeroMutatorService**: Main Effect service that wraps Zero's PushProcessor
2. **ZeroMutatorConfig**: Configuration for the service (database connection, schema, etc.)
3. **ZeroMutatorError**: Tagged errors for different failure scenarios
4. **ZeroMutatorLive**: Layer implementation providing the service

### Design Principles

- **Effect-First**: All operations return Effect types with proper error handling
- **Type Safety**: Full TypeScript support with schema validation
- **Dependency Injection**: Uses Effect's service pattern for clean architecture
- **Reusability**: Generic implementation that works with any Zero schema
- **Error Handling**: Structured error types instead of thrown exceptions

## API Design

```typescript
// Service Definition (using existing getPostgresConnection)
class ZeroMutatorService extends Effect.Service<ZeroMutatorService>()(
  "ZeroMutatorService",
  {
    effect: Effect.gen(function* () {
      const config = yield* ZeroMutatorConfig;
      const processor = new PushProcessor(config.database);

      return {
        processPush: (
          mutators: CustomMutatorDefs<any>,
          urlParams: Record<string, string>,
          payload: ReadonlyJSONObject,
        ) =>
          Effect.tryPromise({
            try: () => processor.process(mutators, urlParams, payload),
            catch: (error) =>
              new ZeroMutatorError({
                message: `Push processing failed: ${error}`,
                cause: error,
              }),
          }),
      };
    }),
    dependencies: [ZeroMutatorConfig.Default],
  },
) {}

// Configuration Service (using getPostgresConnection)
class ZeroMutatorConfig extends Effect.Service<ZeroMutatorConfig>()(
  "ZeroMutatorConfig",
  {
    effect: Effect.gen(function* () {
      const postgresClient = yield* getPostgresConnection;

      return {
        database: new ZQLDatabase(
          new PostgresJSConnection(postgresClient),
          schema,
        ),
        enableLogging: false,
      };
    }),
  },
) {}

// Usage in Handler
export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const mutatorService = yield* ZeroMutatorService;

        const result = yield* mutatorService.processPush(
          createMutators({
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
).pipe(Layer.provide([SessionHttpMiddlewareLayer, ZeroMutatorService.Default]));
```

## Detailed Task List

### Phase 1: Core Service Implementation

#### Task 1.0: Use Existing getPostgresConnection (Current Approach)

**File**: Use existing `packages/db/layers.ts`  
**Context**: Existing hacky postgres.js extraction, Zero PostgresJSConnection  
**Breadcrumbs**:

- Reference `packages/db/layers.ts:32-42` for `getPostgresConnection` implementation
- Look at `backend/server/handlers/coreHandler.ts:13-24` for usage example
- Study Zero's PostgresJSConnection requirements

**Implementation**: Use the existing `getPostgresConnection` function that's already implemented and tested.

#### Task 1.0b: (Future) Create EffectPgConnection Wrapper

**File**: `packages/zero/pgConnection.ts` (for future improvement)  
**Context**: Zero DBConnection interface, Effect PgClient integration  
**Priority**: Low (future enhancement)  
**Breadcrumbs**:

- Study Zero's DBConnection interface from docs
- Reference `packages/db/layers.ts` for PgClient usage
- Look at Zero docs custom DBConnection examples

**Implementation**:

```typescript
import { PostgresJSConnection, ZQLDatabase } from "@rocicorp/zero/pg";
import { getPostgresConnection } from "@openfaith/db/layers";
import { Effect } from "effect";
import { schema } from "@openfaith/zero";

export class ZeroMutatorConfig extends Effect.Service<ZeroMutatorConfig>()(
  "@openfaith/zero/ZeroMutatorConfig",
  {
    effect: Effect.gen(function* () {
      // Use the existing hacky postgres connection extraction
      const postgresClient = yield* getPostgresConnection;

      return {
        database: new ZQLDatabase(
          new PostgresJSConnection(postgresClient),
          schema,
        ),
        enableLogging: false,
      };
    }),
    dependencies: [
      /* getPostgresConnection handles PgClient dependency internally */
    ],
  },
) {}
```

#### Task 1.1: Create ZeroMutatorError Types

**File**: `packages/zero/errors.ts`  
**Context**: Effect error handling patterns, Zero PushProcessor error types  
**Breadcrumbs**:

- Study `packages/domain/Http.ts:150` for existing error patterns
- Reference Zero docs on PushProcessor error handling
- Follow Effect tagged error conventions

**Implementation**:

```typescript
export class ZeroMutatorError extends Schema.TaggedError<ZeroMutatorError>()(
  "ZeroMutatorError",
  {
    message: Schema.String,
    cause: Schema.Unknown.pipe(Schema.optional),
    mutationId: Schema.String.pipe(Schema.optional),
  },
) {}

export class ZeroConfigurationError extends Schema.TaggedError<ZeroConfigurationError>()(
  "ZeroConfigurationError",
  {
    message: Schema.String,
    details: Schema.Unknown.pipe(Schema.optional),
  },
) {}
```

#### Task 1.2: Create ZeroMutatorConfig Service

**File**: `packages/zero/config.ts`  
**Context**: Effect.Service pattern, database connection management, PgClient integration  
**Breadcrumbs**:

- Reference `backend/server/handlers/zeroMutatorsHandler.ts:10-12` for current setup
- Study Effect.Service documentation for configuration patterns
- Look at `packages/db/layers.ts` for PgClient setup
- **Challenge**: Extract postgres.js client from Effect's PgClient for Zero's PostgresJSConnection

**Implementation**:

```typescript
import { PgClient } from "@effect/sql-pg";
import { PostgresJSConnection } from "@rocicorp/zero/pg";
import { Effect, Layer } from "effect";
import { schema } from "@openfaith/zero";

// Helper to extract postgres.js client from PgClient
const extractPostgresJsClient = (pgClient: PgClient.PgClient) =>
  Effect.sync(() => {
    // This is the tricky part - we need to access the underlying postgres.js client
    // PgClient wraps the postgres.js client, so we need to extract it
    // This might require accessing private properties or using a different approach
    const client =
      (pgClient as any).config.connection || (pgClient as any).client;
    return client;
  });

export class ZeroMutatorConfig extends Effect.Service<ZeroMutatorConfig>()(
  "@openfaith/zero/ZeroMutatorConfig",
  {
    effect: Effect.gen(function* () {
      const pgClient = yield* PgClient.PgClient;
      const postgresJsClient = yield* extractPostgresJsClient(pgClient);

      return {
        connection: new PostgresJSConnection(postgresJsClient),
        schema,
        enableLogging: false,
      };
    }),
    dependencies: [PgClient.PgClient],
  },
) {}

// Alternative approach: Create a custom DBConnection that wraps PgClient
export class EffectPgConnection implements DBConnection<any> {
  constructor(private pgClient: PgClient.PgClient) {}

  query(sql: string, params: unknown[]): Promise<Row[]> {
    return Effect.runPromise(
      this.pgClient
        .query(sql, params)
        .pipe(Effect.map((result) => result.rows)),
    );
  }

  transaction<T>(fn: (tx: DBTransaction<any>) => Promise<T>): Promise<T> {
    return Effect.runPromise(
      this.pgClient.transaction((effectTx) =>
        Effect.promise(() => fn(new EffectPgTransaction(effectTx))),
      ),
    );
  }
}

export class EffectPgTransaction implements DBTransaction<any> {
  constructor(public readonly wrappedTransaction: any) {}

  query(sql: string, params: unknown[]): Promise<Row[]> {
    return Effect.runPromise(
      this.wrappedTransaction
        .query(sql, params)
        .pipe(Effect.map((result) => result.rows)),
    );
  }
}
```

#### Task 1.3: Create Core ZeroMutatorService

**File**: `packages/zero/service.ts`  
**Context**: Effect.Service, Zero PushProcessor, CustomMutatorDefs, PgClient integration  
**Breadcrumbs**:

- Study Zero docs on PushProcessor usage
- Reference Effect.Service patterns from PgClient example
- Look at current handler implementation in `backend/server/handlers/zeroMutatorsHandler.ts:23-37`
- Handle the postgres.js extraction challenge

**Implementation**:

```typescript
import { PushProcessor, ZQLDatabase } from "@rocicorp/zero/pg";
import type { CustomMutatorDefs, ReadonlyJSONObject } from "@rocicorp/zero";
import { Effect } from "effect";
import { ZeroMutatorConfig } from "./config";
import { ZeroMutatorError } from "./errors";

export class ZeroMutatorService extends Effect.Service<ZeroMutatorService>()(
  "@openfaith/zero/ZeroMutatorService",
  {
    effect: Effect.gen(function* () {
      const config = yield* ZeroMutatorConfig;

      // Create the processor with our Effect-integrated connection
      const processor = new PushProcessor(
        new ZQLDatabase(config.connection, config.schema),
      );

      return {
        processPush: <TSchema>(
          mutators: CustomMutatorDefs<TSchema>,
          urlParams: Record<string, string>,
          payload: ReadonlyJSONObject,
        ) =>
          Effect.tryPromise({
            try: () => processor.process(mutators, urlParams, payload),
            catch: (error) =>
              new ZeroMutatorError({
                message: `Push processing failed: ${error}`,
                cause: error,
              }),
          }),

        // Additional helper methods
        processWithAsyncTasks: <TSchema>(
          mutators: CustomMutatorDefs<TSchema>,
          urlParams: Record<string, string>,
          payload: ReadonlyJSONObject,
          asyncTasks: Array<() => Promise<void>>,
        ) =>
          Effect.gen(function* () {
            const result = yield* Effect.tryPromise({
              try: () => processor.process(mutators, urlParams, payload),
              catch: (error) =>
                new ZeroMutatorError({
                  message: `Push processing failed: ${error}`,
                  cause: error,
                }),
            });

            // Execute async tasks after successful processing
            yield* Effect.forEach(asyncTasks, (task) =>
              Effect.tryPromise({
                try: task,
                catch: (error) =>
                  new ZeroMutatorError({
                    message: `Async task failed: ${error}`,
                    cause: error,
                  }),
              }),
            );

            return result;
          }),
      };
    }),
    dependencies: [ZeroMutatorConfig.Default],
  },
) {}
```

### Phase 2: Integration Layer

#### Task 2.1: Update Handler to Use Service

**File**: `backend/server/handlers/zeroMutatorsHandler.ts`  
**Context**: Current handler implementation, Effect HttpApiBuilder  
**Breadcrumbs**:

- Current implementation at lines 14-42
- SessionContext usage pattern
- Layer composition patterns

**Implementation**: Replace current manual PushProcessor usage with ZeroMutatorService

#### Task 2.2: Create Mutator Factory Service

**File**: `packages/zero/mutatorFactory.ts`  
**Context**: Current mutator creation pattern, Effect service composition  
**Breadcrumbs**:

- Study `packages/zero/mutators.ts:10-26` for current pattern
- Look at auth data integration
- Consider async task handling from Zero docs

**Implementation**:

```typescript
export class ZeroMutatorFactory extends Effect.Service<ZeroMutatorFactory>()(
  "@openfaith/zero/ZeroMutatorFactory",
  {
    effect: Effect.gen(function* () {
      return {
        createMutators: <TAuthData>(authData: TAuthData | undefined) =>
          Effect.sync(() => createMutators(authData)),
      };
    }),
  },
) {}
```

### Phase 3: Advanced Features

#### Task 3.1: Add Async Task Support

**File**: `packages/zero/asyncTasks.ts`  
**Context**: Zero async task pattern, Effect resource management  
**Breadcrumbs**:

- Zero docs on deferred async tasks
- Effect resource management patterns
- Current email/notification patterns in codebase

#### Task 3.2: Add Logging and Observability

**File**: `packages/zero/observability.ts`  
**Context**: Effect logging, OpenTelemetry integration  
**Breadcrumbs**:

- Current logging patterns in handlers
- Effect.log usage throughout codebase
- OpenTelemetry setup in infra/

#### Task 3.3: Add Configuration Validation

**File**: `packages/zero/validation.ts`  
**Context**: Effect Schema validation, configuration management  
**Breadcrumbs**:

- Schema validation patterns in `packages/schema/`
- Configuration validation in other services

### Phase 4: Testing and Documentation

#### Task 4.1: Unit Tests

**Files**: `packages/zero/__tests__/`  
**Context**: Effect testing patterns, Zero mutator testing  
**Breadcrumbs**:

- Existing test patterns in codebase
- Effect testing utilities
- Mock layer creation

#### Task 4.2: Integration Tests

**Files**: `backend/server/__tests__/`  
**Context**: HTTP API testing, database integration  
**Breadcrumbs**:

- Current handler testing patterns
- Database test setup
- Effect test runtime usage

#### Task 4.3: Documentation and Examples

**Files**: `packages/zero/README.md`, `docs/zero-effect-service.md`  
**Context**: Usage examples, migration guide  
**Breadcrumbs**:

- Current documentation patterns
- Effect service documentation style
- Zero integration examples

## PgClient Integration Challenge

### The Problem

Zero's `PostgresJSConnection` expects a raw `postgres.js` client, but we want to use Effect's `PgClient` for consistency with the rest of the codebase. This creates a challenge because:

1. **Current Setup**: We have two separate database connections:

   - `PgClient` from `@effect/sql-pg` (Effect-native, used throughout the app)
   - `pgjsConnection` from `postgres.js` (raw client, only for Zero)

2. **Desired State**: Use a single `PgClient` instance and extract/wrap it for Zero

### Solution Approaches

#### Approach 1: Extract postgres.js Client from PgClient (IMPLEMENTED)

```typescript
// From packages/db/layers.ts
/**
 * Extract the underlying postgres connection from the Effect PgClient.
 * This is useful when you need direct access to the postgres client for
 * operations not covered by the Effect SQL API.
 *
 * Note: This accesses internal implementation details and should be used sparingly.
 */
export const getPostgresConnection = Effect.gen(function* () {
  const pgClient = yield* Effect.serviceOptional(PgClient.PgClient).pipe(
    Effect.orDie,
  );

  // Access the underlying postgres connection through the acquirer
  const connection = yield* (pgClient as any).reserve;

  // The connection has a 'pg' property that contains the postgres client
  const postgresClient: postgres.Sql = (connection as any).pg;

  return postgresClient;
});
```

**Pros**: Uses existing PgClient, maintains single connection pool, already implemented  
**Cons**: Fragile, depends on internal PgClient structure, may break with updates  
**Status**: ✅ **Currently implemented and working** (see `backend/server/handlers/coreHandler.ts` for usage example)

#### Approach 2: Create Custom DBConnection Wrapper (Recommended)

```typescript
import { DBConnection, DBTransaction } from "@rocicorp/zero/pg";
import { PgClient } from "@effect/sql-pg";
import { Effect } from "effect";

export class EffectPgConnection implements DBConnection<PgClient.PgClient> {
  constructor(private pgClient: PgClient.PgClient) {}

  query(sql: string, params: unknown[]): Promise<Row[]> {
    return Effect.runPromise(
      this.pgClient
        .query(sql, params)
        .pipe(Effect.map((result) => result.rows)),
    );
  }

  transaction<T>(
    fn: (tx: DBTransaction<PgClient.PgClient>) => Promise<T>,
  ): Promise<T> {
    return Effect.runPromise(
      this.pgClient.transaction((effectTx) =>
        Effect.promise(() => fn(new EffectPgTransaction(effectTx))),
      ),
    );
  }
}

export class EffectPgTransaction implements DBTransaction<PgClient.PgClient> {
  constructor(public readonly wrappedTransaction: PgClient.PgClient) {}

  query(sql: string, params: unknown[]): Promise<Row[]> {
    return Effect.runPromise(
      this.wrappedTransaction
        .query(sql, params)
        .pipe(Effect.map((result) => result.rows)),
    );
  }
}
```

**Pros**: Clean abstraction, doesn't depend on internals, maintains Effect patterns  
**Cons**: Additional wrapper layer, potential performance overhead

#### Approach 3: Hybrid Approach

Keep the existing `pgjsConnection` for Zero but ensure it uses the same connection config as `PgClient`:

```typescript
// Shared connection config
const createConnectionConfig = () => ({
  database: env.DB_NAME,
  host: env.DB_HOST_PRIMARY,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: /* ssl config */,
  user: env.DB_USERNAME,
})

// Use same config for both
export const PgLive = PgClient.layer(createConnectionConfig())
export const pgjsConnection = postgres(createConnectionConfig())
```

**Pros**: Simple, no breaking changes, uses same connection config  
**Cons**: Maintains dual connection setup, doesn't fully integrate with Effect patterns

### Recommended Implementation

Since **Approach 1** is already implemented and working, we'll use the existing `getPostgresConnection` function. However, we should still consider **Approach 2** (Custom DBConnection Wrapper) for future improvements because:

**Current Approach (Approach 1) - Use as-is**:

- ✅ Already implemented and tested
- ✅ Uses existing PgClient connection pool
- ✅ Minimal code changes required
- ⚠️ Fragile and depends on PgClient internals
- ⚠️ May break with Effect updates

**Future Improvement (Approach 2)**:

- More robust and future-proof
- Better abstraction and testability
- Doesn't depend on internal PgClient structure

### Updated Task List

#### Current Implementation Path (Using Existing getPostgresConnection)

The tasks below use the existing `getPostgresConnection` function from `packages/db/layers.ts` which extracts the postgres.js client from Effect's PgClient.

#### Future Enhancement Path (Custom DBConnection Wrapper)

For future improvements, consider implementing the custom DBConnection wrapper (Task 1.0b) to make the integration more robust and less dependent on PgClient internals.

## Key Implementation Details

### Error Handling Strategy

The service should handle different types of errors that can occur during mutation processing:

1. **Configuration Errors**: Invalid database connections, missing schema
2. **Mutation Errors**: Individual mutation failures, validation errors
3. **Network Errors**: Database connection issues, timeout errors
4. **Authorization Errors**: Invalid auth data, permission failures

### Type Safety Considerations

- Use generic types to maintain schema type safety across client and server
- Ensure CustomMutatorDefs types are preserved through the service layer
- Provide proper TypeScript inference for mutation return types

### Performance Optimizations

- Connection pooling through the database service
- Efficient error propagation without losing stack traces
- Proper resource cleanup using Effect's resource management

### Integration Points

The service needs to integrate with:

- **SessionContext**: For authentication and authorization
- **Database Layer**: For connection management
- **Logging System**: For observability and debugging
- **HTTP API Layer**: For request/response handling

## Migration Strategy

1. **Backward Compatibility**: Keep existing handler working during transition
2. **Gradual Adoption**: Introduce service alongside current implementation
3. **Type Safety**: Ensure no breaking changes to existing APIs
4. **Testing**: Comprehensive test coverage before switching
5. **Documentation**: Clear migration guide for other Zero setups

## Benefits

1. **Cleaner Error Handling**: Structured errors instead of thrown exceptions
2. **Better Testability**: Easy mocking and testing with Effect's test utilities
3. **Reusability**: Generic service that works with any Zero schema
4. **Type Safety**: Full TypeScript support throughout the stack
5. **Effect Integration**: Seamless integration with Effect's ecosystem
6. **Resource Management**: Proper cleanup and lifecycle management

## Inspiration Sources

This design draws inspiration from:

- **Zero PushProcessor**: Core mutation processing logic
- **Effect PgClient**: Service pattern and error handling approach
- **OpenFaith Architecture**: Effect-first patterns and service composition
- **Zero Documentation**: Best practices for custom mutators and async tasks

## Next Steps

1. Start with Phase 1 to establish the core service foundation
2. Implement error types and configuration service first
3. Build the main ZeroMutatorService with proper Effect patterns
4. Integrate with existing handler to validate the approach
5. Add advanced features like async task support and observability
6. Create comprehensive tests and documentation

This approach provides a solid foundation for integrating Zero's custom mutators with Effect while maintaining the benefits of both systems and ensuring the solution is reusable across different Zero setups.
