# OpenFaith Reverse Sync Implementation Guide

## Overview

This document outlines the implementation of **reverse sync** - the ability to push changes from OpenFaith's Canonical Data Model (CDM) back to external Church Management Systems (ChMS) like Planning Center Online (PCO).

## Current State Analysis

OpenFaith already has **90% of the infrastructure** needed for reverse sync:

### ✅ **Existing Infrastructure**

- **Bidirectional Schema Transformers**: `pcoPersonTransformer = pcoToOf(PcoPersonAttributes, BasePerson, 'person')`
- **HTTP API Clients**: `PcoHttpClient` with full CRUD operations, auth, rate limiting, error handling
- **Schema Annotations**: `[OfEntity]: 'person'` for auto-discovery
- **Entity Manifests**: `pcoEntityManifest` with endpoint definitions
- **Token Management**: `TokenManager` abstraction with live implementations

### 🔴 **Missing Components**

1. **ExternalLinkManager** - Service to manage entity-to-ChMS mappings
2. **External Sync Functions** - Functions to orchestrate reverse sync operations
3. **Auto-Generated Mutators** - Zero mutators with consistent patterns and validation

## Implementation Roadmap

### **Phase 1: Core Services** (High Priority)

- [ ] **ExternalLinkManager Service** - Abstract data access layer for external links
  - Postgres implementation (direct DB access for server-side operations)
- [ ] **External Sync Functions** - Main reverse sync orchestration
  - Auto-discovery of transformers and API clients
  - Routing logic based on external links
  - Error handling and retry logic
  - Mirror mutator shape for consistency
  - Effect-based dependency injection

### **Phase 2: Zero Integration** (High Priority)

- [ ] **Auto-Generated Mutators** - Replace manual mutator definitions
  - Discover entities with `[OfEntity]` annotations
  - Generate consistent CRUD mutators with validation
  - Support custom overrides for specific business logic
  - Clean separation - no external sync concerns in mutators

### **Phase 3: Testing & Validation** (Medium Priority)

- [ ] **Integration Tests** - End-to-end reverse sync testing
- [ ] **Error Handling** - Comprehensive error scenarios
- [ ] **Performance Testing** - Bulk operations and rate limiting

## Architecture Overview

```
Zero Mutator (people.update) - Local operations only
    ↓
Server Handler yields External Sync Functions
    ↓
externalSyncFunctions.people.update(tx, input)
    ↓
ExternalLinkManager.getExternalLinksForEntity
    ↓
Schema.encode(pcoPersonTransformer) [EXISTING]
    ↓
PcoHttpClient.Person.update [EXISTING]
```

## Key Design Principles

1. **Effect-TS First** - All services use Effect service pattern
2. **Zero Configuration** - Leverage existing annotations and manifests
3. **Clean Mutators** - Mutators only handle local operations, no external sync
4. **Effect-Based External Sync** - External sync functions use proper dependency injection
5. **Database Health** - No external API calls during database transactions
6. **Mirrored Shape** - External sync functions mirror mutator structure
7. **Reuse Existing Infrastructure** - Build on proven HTTP clients and transformers
8. **Auto-Discovery** - Minimize manual configuration through schema introspection

## Architecture Pattern: Effect-Based External Sync

**✅ SOLUTION**: Using Effect dependency injection, we cleanly separate local mutations from external sync:

- **Clean Mutators**: Handle authentication, validation, and local database updates only
- **External Sync Functions**: Mirror mutator shape, handle external ChMS sync
- **Server Handler**: Uses Effect dependency injection to yield external sync functions
- **No Client Bloat**: Client mutators have no external sync code
- **Database Health**: External API calls don't hold database connections
- **Effect-Based**: Proper dependency management, no imperative patterns

## Success Criteria

- [ ] Auto-generated Zero mutators with consistent validation and patterns
- [ ] External sync properly separated using Effect dependency injection
- [ ] Standalone `pushToExternalSystems` function for SDK users
- [ ] New entities work automatically with `[OfEntity]` annotation
- [ ] Full Effect error handling and type safety
- [ ] Support for multiple ChMS adapters (PCO first, CCB future)

## Implementation Documents

1. **[Effect-Based External Sync](01-client-server-abstraction.md)** - **CRITICAL**: How to separate local mutations from external sync using Effect dependency injection
2. **[ExternalLinkManager Implementation](02-external-link-manager.md)** - Data access abstraction
3. **[External Sync Functions](03-external-sync-functions.md)** - Main sync orchestration functions
4. **[Auto-Generated Mutators](04-auto-generated-mutators.md)** - Zero mutator generation
5. **[Testing & Validation](05-testing-validation.md)** - Testing strategy

## Context Files for Implementation

Key files to understand before implementation:

### **Existing Infrastructure**

- `adapters/pco/api/pcoApi.ts` - HTTP client with auth, rate limiting, error handling
- `adapters/pco/transformer/pcoTransformer.ts` - Bidirectional schema transformers
- `adapters/pco/modules/people/pcoPersonSchema.ts` - Schema with OfEntity annotations
- `adapters/pco/base/pcoEntityManifest.ts` - Entity manifest structure
- `adapters/adapter-core/layers/tokenManager.ts` - Token management abstraction
- `backend/server/live/tokenManagerLive.ts` - Postgres token implementation

### **Current Mutators**

- `packages/zero/mutators.ts` - Current manual mutator implementation (clean, local-only)
- `backend/server/handlers/zeroMutatorsHandler.ts` - Server handler with dependency injection

### **Workflow Patterns**

- `backend/workers/workflows/pcoSyncWorkflow.ts` - Workflow orchestration pattern
- `backend/workers/workflows/pcoSyncEntityWorkflow.ts` - Entity-level sync pattern

This implementation will mirror the proven patterns from inbound sync while leveraging all existing infrastructure for maximum efficiency and reliability.
