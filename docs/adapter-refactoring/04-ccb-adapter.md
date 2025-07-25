# Phase 4: CCB Adapter Implementation

## Objective

Implement Church Community Builder (CCB) adapter following the established pattern, demonstrating the extensibility of the new architecture.

## Initiative 4.1: Create CCB Adapter Foundation

### Task 4.1.1: Create CCB package structure

**Objective**: Implement CCB adapter following the established pattern

**Files to create**:

- `adapters/ccb/package.json`
- `adapters/ccb/ccbOperationsLive.ts`
- `adapters/ccb/api/ccbApi.ts`
- `adapters/ccb/base/ccbEntityManifest.ts`
- `adapters/ccb/helpers/extractUpdatedAt.ts`

**Files to examine**:

- `adapters/pco/package.json` (for reference)
- CCB API documentation
- Existing CCB integration code (if any)

**Effect docs context**:

- Search: "service implementation"
- Search: "Layer.effect"

**Requirements**:

- Follow same package structure as PCO adapter
- Define CCB-specific types and interfaces
- Set up proper dependencies and exports

### Task 4.1.2: Research CCB API structure

**Objective**: Understand CCB API patterns and response formats

**Research requirements**:

- CCB authentication mechanism (API key vs OAuth)
- CCB API response format (JSON structure)
- CCB entity types and relationships
- CCB rate limiting and error handling
- CCB timestamp fields and formats

**Documentation to create**:

- `adapters/ccb/docs/api-analysis.md`
- CCB response format examples
- Entity mapping between OpenFaith CDM and CCB

### Task 4.1.3: Implement CCB HTTP client

**Objective**: Create CCB-specific HTTP client similar to PcoHttpClient

**Files to create**:

- `adapters/ccb/api/ccbApi.ts`
- `adapters/ccb/api/ccbApiErrors.ts`

**Files to examine**:

- `adapters/pco/api/pcoApi.ts` (for pattern reference)
- `adapters/pco/api/pcoApiErrors.ts`

**Effect docs context**:

- Search: "HttpApiClient"
- Search: "HttpApi.make"

**Implementation requirements**:

- CCB-specific authentication handling
- CCB error response mapping
- Rate limiting for CCB API
- Proper retry logic for CCB-specific errors

## Initiative 4.2: Implement CCB Operations Service

### Task 4.2.1: Implement CCB operations service

**Objective**: Create full implementation of AdapterOperations for CCB

**Files to create**:

- `adapters/ccb/ccbOperationsLive.ts`

**Files to examine**:

- `adapters/pco/pcoOperationsLive.ts` (for pattern)
- `adapters/adapter-core/layers/adapterOperations.ts`

**Effect docs context**:

- Search: "service dependencies"
- Search: "Layer.provide"

**Methods to implement**:

```typescript
export const CcbOperationsLive = Layer.effect(
  AdapterOperations,
  Effect.gen(function* () {
    const ccbClient = yield* CcbHttpClient;
    const entityManifest = ccbEntityManifest;

    return AdapterOperations.of({
      fetchToken: ccbFetchToken,
      extractUpdatedAt: extractCcbUpdatedAt,
      syncEntityData: ccbSyncEntityData,
      listEntityData: ccbListEntityData,
      getEntityManifest: () => entityManifest,
    });
  }),
);
```

### Task 4.2.2: Create CCB extractUpdatedAt function

**Objective**: Implement CCB-specific timestamp extraction

**Files to create**:

- `adapters/ccb/helpers/extractUpdatedAt.ts`

**Research requirements**:

- CCB response format analysis
- CCB timestamp field names and formats
- CCB date/time handling patterns

**Effect docs context**:

- Search: "Schema.decode"
- Search: "Option handling"

**Implementation requirements**:

```typescript
// Research needed: What does CCB response look like?
const CcbResponseSchema = Schema.Struct({
  // CCB-specific response structure
  modified_date: Schema.optional(Schema.String),
  // or whatever CCB uses for timestamps
});

export const extractCcbUpdatedAt = (response: any): Option<string> => {
  // CCB-specific extraction logic
  return pipe(
    Schema.decodeUnknownOption(CcbResponseSchema)(response),
    Option.flatMap((parsed) => Option.fromNullable(parsed.modified_date)),
  );
};
```

### Task 4.2.3: Implement CCB entity manifest

**Objective**: Define CCB entity types and mappings

**Files to create**:

- `adapters/ccb/base/ccbEntityManifest.ts`

**Files to examine**:

- `adapters/pco/base/pcoEntityManifest.ts` (for pattern)
- OpenFaith CDM definitions

**Requirements**:

- Map CCB entities to OpenFaith CDM
- Define CCB-specific endpoints and operations
- Handle CCB entity relationships
- Define CCB-specific transformations

## Initiative 4.3: CCB Authentication and Token Management

### Task 4.3.1: Implement CCB authentication

**Objective**: Handle CCB-specific authentication mechanism

**Files to create**:

- `adapters/ccb/auth/ccbAuth.ts`

**Research requirements**:

- CCB authentication method (API key, OAuth, etc.)
- CCB token refresh patterns
- CCB authentication error handling

**Effect docs context**:

- Search: "authentication patterns"
- Search: "token management"

### Task 4.3.2: Implement CCB token operations

**Objective**: Implement fetchToken for CCB

**Files to modify**:

- `adapters/ccb/ccbOperationsLive.ts`

**Implementation requirements**:

- CCB-specific token acquisition
- CCB token validation
- CCB token refresh logic
- Error handling for CCB auth failures

## Initiative 4.4: CCB Data Transformation

### Task 4.4.1: Implement CCB data transformers

**Objective**: Transform between CCB format and OpenFaith CDM

**Files to create**:

- `adapters/ccb/transformers/ccbPersonTransformer.ts`
- `adapters/ccb/transformers/ccbGroupTransformer.ts`
- Additional transformers as needed

**Files to examine**:

- `adapters/pco/transformer/` (for patterns)
- OpenFaith CDM schemas

**Effect docs context**:

- Search: "Schema.transform"
- Search: "data transformation"

### Task 4.4.2: Implement CCB sync operations

**Objective**: Handle CCB-specific sync logic

**Files to modify**:

- `adapters/ccb/ccbOperationsLive.ts`

**Requirements**:

- CCB create/update/delete operations
- CCB batch operations (if supported)
- CCB error handling and retry logic
- CCB rate limiting compliance

## Deliverables

1. **CCB Adapter Package** with:

   - Full implementation of `AdapterOperations` interface
   - CCB-specific HTTP client and error handling
   - CCB entity manifest and transformations
   - CCB authentication and token management

2. **CCB Integration** that:

   - Works seamlessly with existing workflow system
   - Supports all CRUD operations
   - Handles CCB-specific response formats
   - Extracts and processes timestamps correctly

3. **Documentation** covering:
   - CCB API integration patterns
   - CCB-specific configuration requirements
   - CCB entity mappings and transformations
   - CCB error handling and troubleshooting

## Success Criteria

- [ ] CCB adapter implements all abstract operations
- [ ] CCB authentication works correctly
- [ ] CCB data transformations are accurate
- [ ] CCB sync operations function properly
- [ ] CCB timestamp extraction works
- [ ] CCB adapter integrates with existing workflows
- [ ] No modifications needed to workflow code

## Testing Requirements

- [ ] Unit tests for all CCB operations
- [ ] Integration tests with CCB sandbox/test environment
- [ ] Data transformation accuracy tests
- [ ] Authentication and token management tests
- [ ] Error handling and retry logic tests
- [ ] End-to-end workflow tests with CCB

## Research Dependencies

- [ ] CCB API documentation review
- [ ] CCB sandbox environment access
- [ ] CCB authentication credentials
- [ ] CCB rate limiting and usage policies
- [ ] CCB data format and schema analysis

## Next Phase

Once CCB adapter is complete, proceed to [Phase 5: Integration and Testing](./05-integration.md)
