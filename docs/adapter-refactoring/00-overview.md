# Adapter Architecture Refactoring - Overview

## Project Summary

This project refactors OpenFaith's adapter system to support multiple Church Management Systems (ChMS) through a unified, type-safe architecture. The current system is tightly coupled to Planning Center Online (PCO), and we need to abstract it to support additional adapters like Church Community Builder (CCB) while maintaining full type safety.

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

## Implementation Phases

1. **[Foundation Setup](./01-foundation-setup.md)** - Create core packages and interfaces
2. **[PCO Adapter Implementation](./02-pco-adapter.md)** - Migrate PCO to new architecture
3. **[External Sync Refactoring](./03-external-sync.md)** - Make sync workflows adapter-agnostic
4. **[CCB Adapter Implementation](./04-ccb-adapter.md)** - Add CCB support
5. **[Integration and Testing](./05-integration.md)** - Wire everything together

## Success Criteria

1. **Type Safety**: No `any` types or casting in workflow code
2. **Extensibility**: New adapters can be added by implementing `AdapterOperations`
3. **Backward Compatibility**: Existing PCO functionality remains unchanged
4. **Clean Separation**: Workflows have no knowledge of specific adapter implementations
5. **Testability**: Each component can be tested in isolation with mock implementations

## Timeline Estimate

- **Phase 1**: 1-2 weeks (Foundation)
- **Phase 2**: 2-3 weeks (PCO Migration)
- **Phase 3**: 2-3 weeks (External Sync)
- **Phase 4**: 3-4 weeks (CCB Implementation)
- **Phase 5**: 1-2 weeks (Integration)

**Total**: 9-14 weeks depending on complexity and testing requirements

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
