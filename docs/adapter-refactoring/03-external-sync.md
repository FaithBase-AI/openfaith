# Phase 3: External Sync Refactoring

## Objective

Make external sync workflows adapter-agnostic by using the abstract operations interface and adapter registry.

## Initiative 3.1: Abstract External Sync Operations

### Task 3.1.1: Update ExternalSyncEntityWorkflow

**Objective**: Make external sync workflows adapter-agnostic

**Files to modify**:

- `backend/workers/workflows/externalSyncEntityWorkflow.ts`

**Files to examine**:

- Current workflow implementation
- Dependencies on `PcoApiLayer`
- Token-based adapter detection logic

**Effect docs context**:

- Search: "Layer.provide"
- Search: "service substitution"

**Changes required**:

- Replace `PcoApiLayer` with `AdapterRegistry`
- Add adapter detection logic based on token
- Use `AdapterOperations` instead of direct PCO operations
- Maintain existing error handling and retry logic

**Implementation pattern**:

```typescript
const syncEntityData = Effect.gen(function* () {
  const registry = yield* AdapterRegistry;
  const tokenKey = yield* TokenKey;

  // Determine adapter from token
  const adapterTag = yield* determineAdapterFromToken(tokenKey);

  // Get abstract operations
  const operations = yield* registry.getOperations(adapterTag);

  // Use abstract operations
  const results = yield* operations.syncEntityData(entityName, crudOps);

  // Extract and save updated timestamps
  yield* Effect.forEach(results, (result) =>
    pipe(
      operations.extractUpdatedAt(result),
      Option.match({
        onNone: () => Effect.void,
        onSome: (updatedAt) => updateExternalLinkTimestamp(updatedAt),
      }),
    ),
  );
});
```

### Task 3.1.2: Update syncDataE helper

**Objective**: Abstract adapter-specific operations in sync helper

**Files to modify**:

- `backend/workers/helpers/syncDataE.ts`

**Files to examine**:

- Current PCO-specific logic
- `mkCrudEffectE` function
- `syncToPcoE` function

**Effect docs context**:

- Search: "Effect.forEach"
- Search: "service composition"

**Changes required**:

- Remove direct PCO client dependencies
- Use `AdapterOperations` for all sync operations
- Abstract the `mkCrudEffectE` logic into adapter operations
- Support multiple adapters through registry pattern

### Task 3.1.3: Implement adapter detection logic

**Objective**: Create function to determine adapter from token

**Files to create**:

- `backend/workers/helpers/adapterDetection.ts`

**Files to examine**:

- Current token structure and storage
- How adapters are currently identified
- `@openfaith/adapter-core/server` token types

**Effect docs context**:

- Search: "pattern matching"
- Search: "Match.value"

**Implementation requirements**:

```typescript
export const determineAdapterFromToken = (
  tokenKey: string,
): Effect.Effect<string, AdapterDetectionError> =>
  Effect.gen(function* () {
    // Logic to determine adapter type from token
    // Could be based on token format, database lookup, etc.
    const tokenInfo = yield* getTokenInfo(tokenKey);

    return Match.value(tokenInfo.provider).pipe(
      Match.when("pco", () => "pco"),
      Match.when("ccb", () => "ccb"),
      Match.orElse(() =>
        Effect.fail(
          new UnsupportedAdapterError({ adapter: tokenInfo.provider }),
        ),
      ),
    );
  });
```

## Initiative 3.2: Update External Link Management

### Task 3.2.1: Enhance external link updates

**Objective**: Integrate updated_at extraction with external link updates

**Files to examine**:

- `adapters/adapter-core/layers/externalLinkManager.ts`
- `backend/server/live/externalLinkManagerLive.ts`

**Files to modify**:

- `backend/workers/helpers/syncDataE.ts`

**Effect docs context**:

- Search: "Effect.tap"
- Search: "service composition"

**Changes required**:

- Use `extractUpdatedAt` from adapter operations after sync
- Update `lastProcessedAt` field in external links
- Ensure proper error handling for timestamp extraction
- Log timestamp updates for debugging

### Task 3.2.2: Update sync completion logic

**Objective**: Capture and store updated timestamps during sync

**Files to modify**:

- `backend/workers/helpers/syncDataE.ts`
- External sync workflows

**Effect docs context**:

- Search: "Effect.tapError"
- Search: "Option.match"

**Implementation pattern**:

```typescript
const syncWithTimestampUpdate = (
  operations: AdapterOperations,
  syncData: SyncData,
) =>
  Effect.gen(function* () {
    // Perform sync operation
    const result = yield* operations.syncEntityData(
      syncData.entityName,
      syncData.operations,
    );

    // Extract and update timestamps
    yield* Effect.forEach(result, (response) =>
      pipe(
        operations.extractUpdatedAt(response),
        Option.match({
          onNone: () => Effect.logDebug("No updated_at found in response"),
          onSome: (updatedAt) =>
            externalLinkManager.updateExternalLink(
              syncData.adapter,
              syncData.externalId,
              { lastProcessedAt: new Date(updatedAt) },
            ),
        }),
      ),
    );

    return result;
  });
```

## Initiative 3.3: Update ExternalSyncWorkflow

### Task 3.3.1: Make ExternalSyncWorkflow adapter-agnostic

**Objective**: Remove PCO-specific logic from main external sync workflow

**Files to modify**:

- `backend/workers/workflows/externalSyncWorkflow.ts`

**Changes required**:

- Remove any remaining PCO-specific imports
- Ensure workflow works with any adapter through registry
- Update error handling to be adapter-agnostic

## Deliverables

1. **Updated External Sync Workflows** that:

   - Use `AdapterRegistry` instead of specific adapter layers
   - Work with any adapter implementation
   - Maintain existing functionality and error handling

2. **Adapter Detection System** that:

   - Determines adapter type from token information
   - Supports multiple adapter types
   - Provides clear error messages for unsupported adapters

3. **Enhanced External Link Management** that:

   - Captures `updated_at` timestamps from sync responses
   - Updates external link records with processing timestamps
   - Handles missing timestamps gracefully

4. **Abstracted Sync Helpers** that:
   - Work with abstract operations interface
   - Support multiple adapters
   - Maintain type safety throughout

## Success Criteria

- [ ] External sync workflows are completely adapter-agnostic
- [ ] Adapter detection works reliably for all supported adapters
- [ ] Updated timestamps are captured and stored correctly
- [ ] All existing external sync functionality is preserved
- [ ] No adapter-specific code remains in workflow files
- [ ] Error handling works consistently across adapters

## Testing Requirements

- [ ] Unit tests for adapter detection logic
- [ ] Integration tests with mock adapter operations
- [ ] End-to-end tests with both PCO and mock adapters
- [ ] Timestamp extraction and storage tests
- [ ] Error handling tests for unsupported adapters

## Next Phase

Once external sync refactoring is complete, proceed to [Phase 4: CCB Adapter Implementation](./04-ccb-adapter.md)
