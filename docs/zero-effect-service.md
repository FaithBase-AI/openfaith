# Zero Effect Mutator Service

## Overview

This document provides a comprehensive specification for creating an Effect-based service wrapper for Zero's custom mutators. The goal is to enable seamless integration between Zero's push processor and Effect's service pattern, abstracting away manual error handling and providing a clean, reusable interface for any Zero setup.

## Current Implementation Status

### ✅ Completed Components

1. **Effect-PgClient Bridge** (`packages/zero/layers/zeroLayer.ts`):

   - `EffectPgConnection` and `EffectPgTransaction` classes that implement Zero's `DBConnection` interface
   - Bridge between Effect's `@effect/sql-pg` and Zero's database requirements
   - Factory functions `zeroEffectPg` and `zeroEffectPgProcessor` for creating Zero instances
   - `ZeroStore` service with schema-specific store creation via `forSchema` method

2. **Schema-Specific Store** (`backend/server/live/zeroLive.ts`):

   - `AppZeroStore` context tag for application-specific Zero store
   - `AppZeroStoreLive` layer that creates schema-specific Zero store
   - `ZeroLive` combined layer providing the complete Zero setup

3. **HTTP Handler Integration** (`backend/server/handlers/zeroMutatorsHandler.ts`):

   - Complete Effect-based handler using `AppZeroStore`
   - Session context integration for authentication
   - Proper error handling with `MutatorError`
   - Uses `processZeroMutations` method from the store

4. **Custom Mutators** (`packages/zero/mutators.ts`):
   - Type-safe mutator definitions with `UpdatePersonInput`
   - Authentication validation in mutator functions
   - Satisfies `CustomMutatorDefs<ZSchema>` constraint

### 🔄 Current Architecture

The implemented solution uses a layered approach:

```
ZeroStore (generic)
  ↓ forSchema()
ZeroSchemaStore<TSchema> (schema-specific)
  ↓ processZeroMutations()
PushProcessor (Zero's processor)
  ↓
EffectPgConnection (Effect-PgClient bridge)
```

### Problem Analysis

#### Previous Issues (Now Resolved)

1. ~~**Client Side** (`packages/zero/mutators.ts`): Creates mutators with basic auth validation~~ ✅ **Implemented**
2. ~~**Server Side** (`backend/server/handlers/zeroMutatorsHandler.ts`): Uses `PushProcessor` to handle mutations with manual error handling~~ ✅ **Refactored to use ZeroStore service**
3. ~~**Current Issues**:~~
   - ~~Manual error handling with `Effect.tryPromise`~~ ✅ **Now handled by `processZeroMutations`**
   - ~~No unified Effect service pattern~~ ✅ **Implemented with `ZeroStore` service**
   - ~~Tight coupling between Zero's push processor and Effect patterns~~ ✅ **Abstracted through service layer**
   - ~~No reusable abstraction for other Zero setups~~ ✅ **Generic `ZeroStore.forSchema()` method**

### ✅ Achieved Goals

The current implementation successfully provides:

1. ✅ **Clean Effect service interface**: `ZeroStore` service with `forSchema()` method
2. ✅ **Effect error handling**: `processZeroMutations` wraps errors in Effect types
3. ✅ **Reusable across schemas**: Generic `ZeroStore.forSchema<TSchema>()` approach
4. ✅ **Effect dependency injection**: Full Layer-based composition
5. ✅ **Type safety**: Maintains schema types through `ZeroSchemaStore<TSchema>`

## Current Architecture

### Implemented Components

1. **ZeroStore**: Main Effect service that creates schema-specific stores
2. **ZeroSchemaStore<TSchema>**: Schema-specific store with database and processor
3. **EffectPgConnection/Transaction**: Bridge between Effect PgClient and Zero's DBConnection
4. **AppZeroStore**: Application-specific context tag for the main schema
5. **ZeroLive**: Complete layer composition for the Zero service

### Design Principles (Achieved)

- ✅ **Effect-First**: All operations return Effect types with proper error handling
- ✅ **Type Safety**: Full TypeScript support with schema validation through generics
- ✅ **Dependency Injection**: Uses Effect's service pattern with Layer composition
- ✅ **Reusability**: Generic `forSchema()` method works with any Zero schema
- ✅ **Error Handling**: `processZeroMutations` wraps Promise rejections in Effect errors

## Current API Implementation

### Core Service Interface

```typescript
// From packages/zero/layers/zeroLayer.ts
export interface ZeroStore {
  readonly [TypeId]: TypeId;
  readonly forSchema: <TSchema extends Schema>(
    schema: TSchema,
  ) => ZeroSchemaStore<TSchema>;
}

export interface ZeroSchemaStore<TSchema extends Schema> {
  readonly [ZeroSchemaStoreTypeId]: ZeroSchemaStoreTypeId;
  readonly database: ZQLDatabase<TSchema, PgClient.PgClient>;
  readonly processor: PushProcessor<
    ZQLDatabase<TSchema, PgClient.PgClient>,
    CustomMutatorDefs<TSchema>
  >;
  readonly processZeroMutations: (
    mutators: CustomMutatorDefs<TSchema>,
    urlParams: Record<string, string>,
    payload: ReadonlyJSONObject,
  ) => Effect.Effect<any, Error>;
}
```

### Layer Composition

```typescript
// From backend/server/live/zeroLive.ts
export class AppZeroStore extends Context.Tag("@openfaith/server/AppZeroStore")<
  AppZeroStore,
  ZeroSchemaStore<typeof schema>
>() {}

export const AppZeroStoreLive = Layer.effect(
  AppZeroStore,
  Effect.gen(function* () {
    const zeroStore = yield* ZeroStore;
    return zeroStore.forSchema(schema);
  }),
);

export const ZeroLive = Layer.provide(AppZeroStoreLive, ZeroStoreLayer);
```

### Handler Usage

```typescript
// From backend/server/handlers/zeroMutatorsHandler.ts
export const ZeroHandlerLive = HttpApiBuilder.group(
  ZeroApi,
  "zero",
  (handlers) =>
    handlers.handle("push", (input) =>
      Effect.gen(function* () {
        const session = yield* SessionContext;
        const appZeroStore = yield* AppZeroStore;

        const result = yield* appZeroStore
          .processZeroMutations(
            createMutators({
              activeOrganizationId: pipe(
                session.activeOrganizationIdOpt,
                Option.getOrNull,
              ),
              sub: session.userId,
            }),
            input.urlParams,
            input.payload as unknown as ReadonlyJSONObject,
          )
          .pipe(
            Effect.mapError(
              (error) =>
                new MutatorError({
                  message: `Error processing push request: ${error}`,
                }),
            ),
          );

        return result;
      }),
    ),
).pipe(Layer.provide(SessionHttpMiddlewareLayer), Layer.provide(ZeroLive));
```

## Implementation Progress

### ✅ Phase 1: Core Service Implementation (COMPLETED)

#### ✅ Task 1.0: Effect-PgClient Bridge (IMPLEMENTED)

**File**: `packages/zero/layers/zeroLayer.ts`  
**Status**: ✅ **COMPLETED**  
**Implementation**: Created `EffectPgConnection` and `EffectPgTransaction` classes that bridge Effect's `@effect/sql-pg` with Zero's `DBConnection` interface. This eliminates the need for the hacky postgres.js extraction approach.

**Key Features**:

- Direct integration with Effect's `PgClient`
- Proper transaction handling using `PgClient.withTransaction`
- Runtime-based Promise execution for Zero compatibility
- Factory functions for creating Zero databases and processors

#### ✅ Task 1.1: ZeroStore Service (IMPLEMENTED)

**File**: `packages/zero/layers/zeroLayer.ts`  
**Status**: ✅ **COMPLETED**  
**Implementation**: Created a generic `ZeroStore` service with `forSchema()` method that creates schema-specific stores.

**Key Features**:

- Generic `ZeroStore.forSchema<TSchema>()` method for any Zero schema
- `ZeroSchemaStore<TSchema>` interface with database, processor, and `processZeroMutations`
- Effect-based error handling in `processZeroMutations`
- Layer-based dependency injection

#### ✅ Task 1.2: Schema-Specific Store Integration (IMPLEMENTED)

**File**: `backend/server/live/zeroLive.ts`  
**Status**: ✅ **COMPLETED**  
**Implementation**: Created application-specific Zero store using the generic service.

**Key Features**:

- `AppZeroStore` context tag for the application schema
- `AppZeroStoreLive` layer that creates schema-specific store
- `ZeroLive` combined layer for complete setup

#### ✅ Task 1.3: HTTP Handler Integration (IMPLEMENTED)

**File**: `backend/server/handlers/zeroMutatorsHandler.ts`  
**Status**: ✅ **COMPLETED**  
**Implementation**: Refactored handler to use the new Effect-based Zero service.

**Key Features**:

- Uses `AppZeroStore` service instead of manual PushProcessor
- Proper Effect error handling with `MutatorError`
- Session context integration for authentication
- Layer composition with `ZeroLive`

### ✅ Phase 2: Integration Layer (COMPLETED)

#### ✅ Task 2.1: Handler Integration (IMPLEMENTED)

**File**: `backend/server/handlers/zeroMutatorsHandler.ts`  
**Status**: ✅ **COMPLETED**  
**Implementation**: Successfully replaced manual PushProcessor usage with the new Effect-based service.

**Key Changes**:

- Uses `AppZeroStore` service instead of direct PushProcessor instantiation
- Calls `processZeroMutations` method with proper Effect error handling
- Maintains session context integration and authentication
- Layer composition with `ZeroLive` for dependency injection

#### ✅ Task 2.2: Mutator Integration (IMPLEMENTED)

**File**: `packages/zero/mutators.ts`  
**Status**: ✅ **COMPLETED**  
**Implementation**: Custom mutators work seamlessly with the new service architecture.

**Key Features**:

- Type-safe `UpdatePersonInput` interface
- Authentication validation in mutator functions
- Proper `CustomMutatorDefs<ZSchema>` constraint satisfaction
- Direct integration with `createMutators` function in handler

### 🔄 Phase 3: Advanced Features (FUTURE ENHANCEMENTS)

#### 📋 Task 3.1: Add Async Task Support

**File**: `packages/zero/asyncTasks.ts` (Future)  
**Status**: 📋 **PLANNED**  
**Context**: Zero async task pattern, Effect resource management

**Potential Implementation**:

- Extend `ZeroSchemaStore` with async task processing methods
- Use Effect's resource management for task lifecycle
- Integration with existing email/notification patterns

#### 📋 Task 3.2: Add Logging and Observability

**File**: `packages/zero/observability.ts` (Future)  
**Status**: 📋 **PLANNED**  
**Context**: Effect logging, OpenTelemetry integration

**Current State**: Basic logging exists in handler with `Effect.log`
**Potential Enhancements**:

- Structured logging for mutation processing
- OpenTelemetry tracing integration
- Performance metrics collection

#### 📋 Task 3.3: Add Configuration Validation

**File**: `packages/zero/validation.ts` (Future)  
**Status**: 📋 **PLANNED**  
**Context**: Effect Schema validation, configuration management

**Potential Implementation**:

- Schema validation for Zero configuration
- Runtime validation of mutator inputs
- Configuration health checks

### 🔄 Phase 4: Testing and Documentation (IN PROGRESS)

#### 📋 Task 4.1: Unit Tests

**Files**: `packages/zero/__tests__/` (Future)  
**Status**: 📋 **PLANNED**  
**Context**: Effect testing patterns, Zero mutator testing

**Needed**:

- Test coverage for `EffectPgConnection` and `EffectPgTransaction`
- Mock layers for `ZeroStore` service
- Unit tests for `processZeroMutations`

#### 📋 Task 4.2: Integration Tests

**Files**: `backend/server/__tests__/` (Future)  
**Status**: 📋 **PLANNED**  
**Context**: HTTP API testing, database integration

**Needed**:

- End-to-end tests for Zero push handler
- Database integration tests with real transactions
- Error handling validation

#### ✅ Task 4.3: Documentation Update

**Files**: `docs/zero-effect-service.md`  
**Status**: ✅ **COMPLETED** (This update)  
**Context**: Current implementation documentation

## ✅ PgClient Integration Solution

### The Challenge (SOLVED)

Zero's database interface expects a `DBConnection` implementation, while we wanted to use Effect's `PgClient` for consistency with the rest of the codebase.

### ✅ Implemented Solution: Custom DBConnection Wrapper

**Status**: ✅ **IMPLEMENTED** in `packages/zero/layers/zeroLayer.ts`

We successfully implemented **Approach 2** - a custom DBConnection wrapper that bridges Effect's `PgClient` with Zero's database interface:

```typescript
// From packages/zero/layers/zeroLayer.ts
export class EffectPgConnection implements DBConnection<PgClient.PgClient> {
  readonly #pgClient: PgClient.PgClient;
  readonly #runtime: Runtime.Runtime<never>;

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<never>) {
    this.#pgClient = pgClient;
    this.#runtime = runtime;
  }

  transaction<TRet>(
    fn: (tx: DBTransaction<PgClient.PgClient>) => Promise<TRet>,
  ): Promise<TRet> {
    const transactionAdapter = new EffectPgTransaction(
      this.#pgClient,
      this.#runtime,
    );
    const effectToRun = Effect.promise(() => fn(transactionAdapter));
    const transactionalEffect = this.#pgClient.withTransaction(effectToRun);
    return Runtime.runPromise(this.#runtime)(transactionalEffect);
  }
}

class EffectPgTransaction implements DBTransaction<PgClient.PgClient> {
  readonly wrappedTransaction: PgClient.PgClient;
  readonly #runtime: Runtime.Runtime<never>;

  constructor(pgClient: PgClient.PgClient, runtime: Runtime.Runtime<never>) {
    this.wrappedTransaction = pgClient;
    this.#runtime = runtime;
  }

  query(sql: string, params: Array<unknown>): Promise<Iterable<Row>> {
    const queryEffect = this.wrappedTransaction.unsafe(
      sql,
      params as Array<Primitive>,
    );
    return Runtime.runPromise(this.#runtime)(queryEffect) as Promise<
      Iterable<Row>
    >;
  }
}
```

### ✅ Benefits Achieved

- ✅ **Clean abstraction**: No dependency on PgClient internals
- ✅ **Effect integration**: Uses `PgClient.withTransaction` for proper transaction handling
- ✅ **Type safety**: Maintains full TypeScript support
- ✅ **Single connection pool**: Uses the same PgClient instance throughout the app
- ✅ **Future-proof**: Doesn't depend on internal PgClient structure
- ✅ **Runtime integration**: Proper Effect runtime handling for Promise conversion

### Factory Functions

The implementation also provides convenient factory functions:

```typescript
export function zeroEffectPg<TSchema extends Schema>(
  schema: TSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<never>,
): ZQLDatabase<TSchema, PgClient.PgClient>;

export function zeroEffectPgProcessor<TSchema extends Schema>(
  schema: TSchema,
  pgClient: PgClient.PgClient,
  runtime: Runtime.Runtime<never>,
): PushProcessor<
  ZQLDatabase<TSchema, PgClient.PgClient>,
  CustomMutatorDefs<TSchema>
>;
```

This approach eliminated the need for the previous "hacky postgres.js extraction" and provides a robust, maintainable solution that integrates seamlessly with Effect's ecosystem.

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

## ✅ Benefits Achieved

1. ✅ **Cleaner Error Handling**: `processZeroMutations` wraps errors in Effect types instead of thrown exceptions
2. ✅ **Better Testability**: Effect service pattern enables easy mocking with Layer system
3. ✅ **Reusability**: Generic `ZeroStore.forSchema<TSchema>()` works with any Zero schema
4. ✅ **Type Safety**: Full TypeScript support maintained through `ZeroSchemaStore<TSchema>`
5. ✅ **Effect Integration**: Seamless integration with Effect's Layer and service ecosystem
6. ✅ **Resource Management**: Proper transaction handling with `PgClient.withTransaction`

## Implementation Summary

The current implementation successfully provides a complete Effect-based wrapper for Zero's custom mutators:

### ✅ Core Components Implemented

1. **`EffectPgConnection`**: Bridges Effect's PgClient with Zero's DBConnection interface
2. **`ZeroStore`**: Generic service for creating schema-specific Zero stores
3. **`ZeroSchemaStore<TSchema>`**: Schema-specific store with database, processor, and mutation processing
4. **`AppZeroStore`**: Application-specific context tag for the main schema
5. **`ZeroLive`**: Complete layer composition providing the Zero service
6. **Handler Integration**: Full Effect-based HTTP handler using the service

### ✅ Design Goals Achieved

- ✅ **Effect-First**: All operations return Effect types with proper error handling
- ✅ **Type Safety**: Full TypeScript support with schema validation through generics
- ✅ **Dependency Injection**: Uses Effect's service pattern with Layer composition
- ✅ **Reusability**: Generic `forSchema()` method works with any Zero schema
- ✅ **Error Handling**: Structured error types instead of thrown exceptions

### 🔄 Future Enhancements

While the core implementation is complete and functional, potential future improvements include:

1. **Async Task Support**: Integration with Zero's deferred async task pattern
2. **Enhanced Observability**: Structured logging and OpenTelemetry tracing
3. **Configuration Validation**: Schema validation for Zero configuration
4. **Comprehensive Testing**: Unit and integration test coverage
5. **Performance Optimizations**: Connection pooling and resource management improvements

The current implementation provides a solid, production-ready foundation for integrating Zero's custom mutators with Effect while maintaining the benefits of both systems and ensuring the solution is reusable across different Zero setups.
