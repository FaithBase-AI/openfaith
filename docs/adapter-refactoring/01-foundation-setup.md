# Phase 1: Foundation Setup

## Objective

Establish the foundation packages with abstract interfaces that will support multiple ChMS adapters.

## Initiative 1.1: Create Adapter Core Package Structure

### Task 1.1.1: Create adapter-core package structure

**Objective**: Establish the foundation package with abstract interfaces

**Files to examine**:

- `adapters/adapter-core/package.json`

**Files to create**:

- `adapters/adapter-core/layers/adapterOperations.ts`
- `adapters/adapter-core/errors/adapterErrors.ts`

**Effect docs context**:

- Search: "Context.Tag service interface"
- Search: "Layer.effect"

**Implementation details**:

- Create package.json with proper dependencies
- Set up TypeScript configuration
- Establish proper exports in index.ts

### Task 1.1.2: Define AdapterOperations service interface

**Objective**: Create abstract operations that all adapters must implement

**Files to create**:

- `adapters/adapter-core/layers/adapterOperations.ts`

**Effect docs context**:

- Search: "service interface definition"
- Search: "Context.Tag"

**Interface requirements**:

```typescript
export class AdapterOperations extends Context.Tag(
  "@openfaith/adapter-core/AdapterOperations",
)<
  AdapterOperations,
  {
    readonly fetchToken: (params: {
      code: string;
      redirectUri: string;
    }) => Effect.Effect<TokenResponse, AdapterError>;
    readonly extractUpdatedAt: (response: any) => Option<string>;
    readonly syncEntityData: (
      entityName: string,
      operations: Array<CRUDOp>,
    ) => Effect.Effect<Array<any>, SyncError>;
    readonly listEntityData: (
      entityName: string,
      params?: any,
    ) => Stream.Stream<any, SyncError>;
    readonly getEntityManifest: () => Record<string, any>;
  }
>() {}
```

### Task 1.1.3: Define common error types

**Objective**: Create standardized error types for adapter operations

**Files to create**:

- `adapters/adapter-core/errors/adapterErrors.ts`

**Effect docs context**:

- Search: "Schema.TaggedError"

**Error types to define**:

- `UnsupportedAdapterError`
- `AdapterSyncError`
- `AdapterTokenError`
- `AdapterConnectionError`

## Initiative 1.2: Create Every-Adapter Package

### Task 1.2.1: Create every-adapter package structure

**Objective**: Set up the registry package for adapter selection

**Files to create**:

- `adapters/every-adapter/package.json`
- `adapters/every-adapter/adapterRegistry.ts`
- `adapters/every-adapter/index.ts`

**Effect docs context**:

- Search: "Layer.effect"
- Search: "service dependencies"

### Task 1.2.2: Implement AdapterRegistry service

**Objective**: Create registry interface with dynamic adapter selection

**Files to create**:

- `adapters/every-adapter/adapterRegistry.ts`

**Effect docs context**:

- Search: "service composition"
- Search: "Layer.provide"

**Interface requirements**:

```typescript
export class AdapterRegistry extends Context.Tag(
  "@openfaith/every-adapter/AdapterRegistry",
)<
  AdapterRegistry,
  {
    readonly getOperations: (
      adapterTag: string,
    ) => Effect.Effect<AdapterOperations, UnsupportedAdapterError>;
  }
>() {}
```

### Task 1.2.3: Create adapter registry factory

**Objective**: Function to create registry from adapter configurations

**Files to create**:

- `adapters/every-adapter/registryFactory.ts`

**Effect docs context**:

- Search: "Layer.mergeAll"
- Search: "factory pattern"

**Requirements**:

- Support for registering multiple adapters
- Type-safe adapter configuration
- Dynamic adapter loading based on tags

## Deliverables

1. **adapter-core package** with:

   - Abstract `AdapterOperations` service interface
   - Common error types
   - Proper TypeScript configuration

2. **every-adapter package** with:

   - `AdapterRegistry` service
   - Registry factory function
   - Support for dynamic adapter selection

3. **Documentation** covering:
   - How to implement a new adapter
   - Interface contracts and requirements
   - Error handling patterns

## Success Criteria

- [ ] All packages compile without errors
- [ ] Abstract interfaces are properly typed
- [ ] Error types follow Effect-TS patterns
- [ ] Registry supports multiple adapter registration
- [ ] No dependencies on specific adapter implementations

## Next Phase

Once foundation is complete, proceed to [Phase 2: PCO Adapter Implementation](./02-pco-adapter.md)
