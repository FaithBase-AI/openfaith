# Phase 2: PCO Adapter Implementation

## Objective

Create PCO-specific implementation of abstract operations and migrate existing PCO workflows to use the new architecture.

## Initiative 2.1: Extract PCO Operations

### Task 2.1.1: Create PCO operations service

**Objective**: Create PCO-specific implementation of abstract operations

**Files to examine**:

- `adapters/pco/api/pcoApi.ts`
- `adapters/pco/base/pcoEntityManifest.ts`
- `backend/workers/helpers/syncDataE.ts`

**Files to create**:

- `adapters/pco/pcoOperationsLive.ts`

**Effect docs context**:

- Search: "Layer.effect service implementation"
- Search: "service dependencies"

**Implementation requirements**:

- Implement all methods from `AdapterOperations` interface
- Use existing `PcoHttpClient` and `pcoEntityManifest`
- Maintain full type safety with PCO-specific types
- Wrap existing sync logic in abstract interface

### Task 2.1.2: Implement extractPcoUpdatedAt function

**Objective**: Create function to extract `updated_at` from PCO JSON:API responses

**Files to examine**:

- Current PCO response structure in logs (see example in original issue)
- `adapters/pco/api/pcoApi.ts` for response types

**Files to create**:

- `adapters/pco/helpers/extractUpdatedAt.ts`

**Effect docs context**:

- Search: "Schema.Struct"
- Search: "Option.fromNullable"

**Implementation requirements**:

```typescript
const PcoResponseSchema = Schema.Struct({
  data: Schema.optional(
    Schema.Struct({
      attributes: Schema.optional(
        Schema.Struct({
          updated_at: Schema.optional(Schema.String),
        }),
      ),
    }),
  ),
});

export const extractPcoUpdatedAt = (response: any): Option<string> => {
  return pipe(
    Schema.decodeUnknownOption(PcoResponseSchema)(response),
    Option.flatMap((parsed) =>
      Option.fromNullable(parsed.data?.attributes?.updated_at),
    ),
  );
};
```

### Task 2.1.3: Refactor PCO sync operations

**Objective**: Extract PCO-specific logic into operations service

**Files to examine**:

- `backend/workers/helpers/syncDataE.ts`
- `backend/workers/helpers/ofLookup.ts`

**Files to modify**:

- `adapters/pco/pcoOperationsLive.ts`

**Effect docs context**:

- Search: "Effect.gen"
- Search: "service composition"

**Requirements**:

- Move `syncToPcoE` logic into `syncEntityData` method
- Move `createPaginatedStream` logic into `listEntityData` method
- Maintain existing functionality with new interface
- Ensure proper error handling and logging

## Initiative 2.2: Update PCO-Specific Workflows

### Task 2.2.1: Update PcoSyncEntityWorkflow

**Objective**: Migrate PCO workflows to use abstract operations

**Files to modify**:

- `backend/workers/workflows/pcoSyncEntityWorkflow.ts`

**Files to examine**:

- Current workflow implementation
- Dependencies on `PcoHttpClient` and `pcoEntityManifest`

**Effect docs context**:

- Search: "service dependencies"
- Search: "Effect.provide"

**Changes required**:

- Replace direct `PcoHttpClient` usage with `AdapterOperations`
- Use `listEntityData` method instead of direct PCO client calls
- Remove direct imports of PCO-specific types
- Maintain existing workflow functionality

### Task 2.2.2: Update PcoSyncWorkflow

**Objective**: Use abstract operations for entity manifest access

**Files to modify**:

- `backend/workers/workflows/pcoSyncWorkflow.ts`

**Effect docs context**:

- Search: "workflow composition"

**Changes required**:

- Use `getEntityManifest()` from operations instead of direct import
- Replace PCO-specific entity filtering with abstract operations
- Remove direct PCO manifest dependencies

### Task 2.2.3: Create PCO adapter layer composition

**Objective**: Wire up PCO operations with existing PCO infrastructure

**Files to create**:

- `adapters/pco/pcoAdapterLayer.ts`

**Files to examine**:

- `backend/server/live/pcoApiLive.ts`
- Current PCO layer setup

**Effect docs context**:

- Search: "Layer.provide"
- Search: "Layer.mergeAll"

**Requirements**:

- Compose `PcoOperationsLive` with existing PCO layers
- Ensure proper dependency injection
- Maintain existing PCO configuration

## Deliverables

1. **PCO Operations Service** with:

   - Full implementation of `AdapterOperations` interface
   - PCO-specific `extractUpdatedAt` function
   - Wrapped existing sync logic

2. **Updated PCO Workflows** that:

   - Use abstract operations instead of direct PCO clients
   - Maintain existing functionality
   - Have no direct PCO dependencies

3. **PCO Adapter Layer** that:
   - Properly composes all PCO dependencies
   - Provides `AdapterOperations` service
   - Integrates with existing PCO infrastructure

## Success Criteria

- [ ] PCO operations service implements all abstract methods
- [ ] `extractPcoUpdatedAt` correctly parses PCO responses
- [ ] PCO workflows use only abstract operations
- [ ] All existing PCO functionality is preserved
- [ ] No direct PCO dependencies in workflow code
- [ ] Full type safety maintained throughout

## Testing Requirements

- [ ] Unit tests for `extractPcoUpdatedAt` with various PCO response formats
- [ ] Integration tests for PCO operations service
- [ ] Workflow tests using mock operations service
- [ ] End-to-end tests with actual PCO API

## Next Phase

Once PCO adapter is complete, proceed to [Phase 3: External Sync Refactoring](./03-external-sync.md)
