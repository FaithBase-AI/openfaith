# Adapter Architecture Refactoring Specification

## Overview

This specification outlines the refactoring of OpenFaith's adapter system to support multiple Church Management Systems (ChMS) through a unified, type-safe architecture. The current system is tightly coupled to Planning Center Online (PCO), and we need to abstract it to support additional adapters like Church Community Builder (CCB) while maintaining full type safety.

## Current State

- PCO-specific implementations scattered across the codebase
- Direct dependencies on `PcoHttpClient` and `pcoEntityManifest` in workflows
- Hard-coded PCO logic in sync operations
- No abstraction layer for different ChMS providers

## Target Architecture

### Core Components

1. **Abstract Operations Interface** (`adapter-core`)

   - Defines common operations all adapters must implement
   - Provides type-safe abstraction for workflows
   - No generics - uses concrete interfaces

2. **Adapter-Specific Services** (`adapters/pco`, `adapters/ccb`)

   - Each adapter implements the abstract operations
   - Maintains full type safety with adapter-specific types
   - Encapsulates adapter-specific logic (HTTP clients, entity manifests)

3. **Adapter Registry** (`adapters/every-adapter`)

   - Maps adapter tags to implementations
   - Provides unified access to any adapter
   - Handles adapter selection based on token/configuration

4. **Updated Workflows**
   - Work with abstract operations interface
   - No knowledge of specific adapter implementations
   - No casting or type hacks required

## Implementation Plan

### Phase 1: Foundation Setup

#### Initiative 1.1: Create Adapter Core Package Structure

**Objective**: Establish the foundation package with abstract interfaces

**Tasks**:

1. **Create adapter-core package structure**

   - Files to examine: `adapters/adapter-core/package.json`
   - Create: `adapters/adapter-core/layers/adapterOperations.ts`
   - Effect docs context: Search "Context.Tag service interface" and "Layer.effect"

2. **Define AdapterOperations service interface**

   - Create abstract operations that all adapters must implement
   - Include: `fetchToken`, `extractUpdatedAt`, `syncEntityData`, `listEntityData`, `getEntityManifest`
   - Effect docs context: Search "service interface definition" and "Context.Tag"

3. **Define common error types**
   - Create: `adapters/adapter-core/errors/adapterErrors.ts`
   - Define: `UnsupportedAdapterError`, `AdapterSyncError`, `AdapterTokenError`
   - Effect docs context: Search "Schema.TaggedError"

#### Initiative 1.2: Create Every-Adapter Package

**Objective**: Set up the registry package for adapter selection

**Tasks**:

1. **Create every-adapter package structure**

   - Create: `adapters/every-adapter/package.json`
   - Create: `adapters/every-adapter/adapterRegistry.ts`
   - Effect docs context: Search "Layer.effect" and "service dependencies"

2. **Implement AdapterRegistry service**

   - Define registry interface with `getOperations` method
   - Support dynamic adapter selection by tag
   - Effect docs context: Search "service composition" and "Layer.provide"

3. **Create adapter registry factory**
   - Function to create registry from adapter configurations
   - Support for registering multiple adapters
   - Effect docs context: Search "Layer.mergeAll" and "factory pattern"

### Phase 2: PCO Adapter Implementation

#### Initiative 2.1: Extract PCO Operations

**Objective**: Create PCO-specific implementation of abstract operations

**Tasks**:

1. **Create PCO operations service**

   - Files to examine: `adapters/pco/api/pcoApi.ts`, `adapters/pco/base/pcoEntityManifest.ts`
   - Create: `adapters/pco/pcoOperationsLive.ts`
   - Implement all methods from `AdapterOperations` interface
   - Effect docs context: Search "Layer.effect service implementation"

2. **Implement extractPcoUpdatedAt function**

   - Files to examine: Current PCO response structure in logs
   - Create function to extract `updated_at` from PCO JSON:API responses
   - Return `Option<string>` for safe handling
   - Effect docs context: Search "Schema.Struct" and "Option.fromNullable"

3. **Refactor PCO sync operations**
   - Files to examine: `backend/workers/helpers/syncDataE.ts`
   - Extract PCO-specific logic into operations service
   - Maintain existing functionality with new interface
   - Effect docs context: Search "Effect.gen" and "service composition"

#### Initiative 2.2: Update PCO-Specific Workflows

**Objective**: Migrate PCO workflows to use abstract operations

**Tasks**:

1. **Update PcoSyncEntityWorkflow**

   - Files to modify: `backend/workers/workflows/externalSyncEntityWorkflow.ts`
   - Replace direct `PcoHttpClient` usage with `AdapterOperations`
   - Maintain existing functionality
   - Effect docs context: Search "service dependencies" and "Effect.provide"

2. **Update PcoSyncWorkflow**
   - Files to modify: `backend/workers/workflows/pcoSyncWorkflow.ts`
   - Use abstract operations for entity manifest access
   - Remove direct PCO manifest dependencies
   - Effect docs context: Search "workflow composition"

### Phase 3: External Sync Refactoring

#### Initiative 3.1: Abstract External Sync Operations

**Objective**: Make external sync workflows adapter-agnostic

**Tasks**:

1. **Update ExternalSyncEntityWorkflow**

   - Files to modify: `backend/workers/workflows/externalSyncEntityWorkflow.ts`
   - Replace `PcoApiLayer` with `AdapterRegistry`
   - Use adapter operations for sync logic
   - Effect docs context: Search "Layer.provide" and "service substitution"

2. **Update syncDataE helper**

   - Files to modify: `backend/workers/helpers/syncDataE.ts`
   - Abstract adapter-specific operations
   - Support multiple adapters through registry
   - Effect docs context: Search "Effect.forEach" and "service composition"

3. **Implement adapter detection logic**
   - Create function to determine adapter from token
   - Support multiple adapter types
   - Files to examine: Current token structure and adapter identification
   - Effect docs context: Search "pattern matching" and "Match.value"

#### Initiative 3.2: Update External Link Management

**Objective**: Integrate updated_at extraction with external link updates

**Tasks**:

1. **Enhance external link updates**

   - Files to examine: `adapters/adapter-core/layers/externalLinkManager.ts`
   - Use `extractUpdatedAt` from adapter operations
   - Update `lastProcessedAt` field after successful sync
   - Effect docs context: Search "Effect.tap" and "service composition"

2. **Update sync completion logic**
   - Modify sync operations to capture and store updated timestamps
   - Ensure proper error handling for timestamp extraction
   - Effect docs context: Search "Effect.tapError" and "Option.match"

### Phase 4: CCB Adapter Implementation

#### Initiative 4.1: Create CCB Adapter Foundation

**Objective**: Implement CCB adapter following the established pattern

**Tasks**:

1. **Create CCB package structure**

   - Create: `adapters/ccb/package.json`
   - Create: `adapters/ccb/ccbOperationsLive.ts`
   - Define CCB-specific types and interfaces
   - Effect docs context: Search "service implementation" and "Layer.effect"

2. **Implement CCB operations service**

   - Implement all `AdapterOperations` methods for CCB
   - Create CCB-specific HTTP client if needed
   - Define CCB entity manifest structure
   - Effect docs context: Search "service dependencies" and "Layer.provide"

3. **Create CCB extractUpdatedAt function**
   - Implement CCB-specific timestamp extraction
   - Handle CCB response format differences
   - Return `Option<string>` for consistency
   - Effect docs context: Search "Schema.decode" and "Option handling"

### Phase 5: Integration and Testing

#### Initiative 5.1: Registry Integration

**Objective**: Wire up all adapters through the registry system

**Tasks**:

1. **Configure adapter registry**

   - Files to modify: `backend/server/adapters/adaptersApi.ts`
   - Register both PCO and CCB adapters
   - Configure adapter selection logic
   - Effect docs context: Search "Layer.mergeAll" and "service composition"

2. **Update workflow registration**

   - Files to modify: `backend/workers/runner.ts`, `backend/workers/api/workflowApi.ts`
   - Ensure all workflows use the new adapter system
   - Maintain backward compatibility during transition
   - Effect docs context: Search "Layer dependencies"

3. **Update environment configuration**
   - Support multiple adapter configurations
   - Handle adapter-specific environment variables
   - Files to examine: Current environment setup
   - Effect docs context: Search "Config service" and "environment management"

#### Initiative 5.2: Migration and Cleanup

**Objective**: Complete the migration and remove old code

**Tasks**:

1. **Remove direct PCO dependencies from workflows**

   - Clean up imports and direct PCO client usage
   - Ensure all operations go through abstract interface
   - Files to clean: All workflow files

2. **Update type definitions**

   - Ensure type safety throughout the new system
   - Remove any `any` types introduced during migration
   - Effect docs context: Search "type safety" and "service types"

3. **Documentation updates**
   - Update existing documentation to reflect new architecture
   - Create adapter development guide
   - Document the abstract operations interface

## Success Criteria

1. **Type Safety**: No `any` types or casting in workflow code
2. **Extensibility**: New adapters can be added by implementing `AdapterOperations`
3. **Backward Compatibility**: Existing PCO functionality remains unchanged
4. **Clean Separation**: Workflows have no knowledge of specific adapter implementations
5. **Testability**: Each component can be tested in isolation with mock implementations

## Dependencies and Prerequisites

- Understanding of Effect-TS service and layer patterns
- Familiarity with existing PCO adapter implementation
- Knowledge of the current sync workflow architecture
- Access to CCB API documentation for implementation

## Risk Mitigation

- Implement changes incrementally to maintain system stability
- Maintain existing PCO functionality during refactoring
- Create comprehensive tests for each new component
- Use feature flags for gradual rollout of new adapter system

## Timeline Estimate

- **Phase 1**: 1-2 weeks (Foundation)
- **Phase 2**: 2-3 weeks (PCO Migration)
- **Phase 3**: 2-3 weeks (External Sync)
- **Phase 4**: 3-4 weeks (CCB Implementation)
- **Phase 5**: 1-2 weeks (Integration)

**Total**: 9-14 weeks depending on complexity and testing requirements
