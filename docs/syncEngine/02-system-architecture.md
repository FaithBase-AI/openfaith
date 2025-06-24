# System Architecture

This document provides a high-level overview of the major components of the Sync Engine and how they interact. Our architecture is designed around the principle of **entity manifest-driven orchestration**, where sync workflows consume entity manifests to understand what needs to be synchronized and how entities relate to each other.

## Current Implementation Status

**⚠️ Note: This document describes both the current implementation and our future vision. Components marked with 🚧 are planned but not yet implemented.**

## 1. Core Components

The system is composed of two primary packages and their supporting infrastructure:

1.  **The API Adapter Library (`@openfaith/adapter-core` + `@openfaith/pco`):** A general-purpose, standalone library that provides a type-safe and resilient interface for communicating with third-party APIs. Includes the **Entity Manifest System** that describes available entities and their relationships. ✅ **Currently implemented**
2.  **The Sync Engine:** 🚧 **Planned** - A durable, distributed application that consumes entity manifests to orchestrate data synchronization through two main workflows: the **Main Orchestrator Workflow** and **Entity Sync Workflows**.
3.  **Shared Infrastructure:** The services that support both components, such as PostgreSQL for workflow persistence and Redis for distributed state. ✅ **Partially implemented**

### High-Level Architecture Diagram

```
+--------------------------+      +------------------------------+
|   External APIs          |      |   Our Application            |
|   (e.g., PCO)            |      |   (e.g., Web UI, etc.)       |
+-------------+------------+      +-------------+----------------+
              ^                                  ^
              | (HTTP/S)                         | (Database/API Calls)
              |                                  |
+-------------+----------------------------------+---------------+
|             THE SYNC ENGINE ECOSYSTEM                          |
|                                                                |
|   +--------------------------+      +------------------------+ |
|   | API Adapter Libraries    |      | Sync Engine [🚧]       | |
|   | (@openfaith/adapter-core)| <--- | (Durable Workflows)    | |
|   | (@openfaith/pco)         | uses |                        | |
|   |                          |      | Main Orchestrator      | |
|   | - Entity Manifests   ✅  |      | - Consumes Manifests   | |
|   | - Type-safe Schemas  ✅  |      | - Builds Dep. Graph    | |
|   | - Endpoint Definitions✅ |      | - Fans out to Entity   | |
|   | - Token Management   ✅  |      |   Sync Workflows       | |
|   | - HttpApiClient      ✅  |      |                        | |
|   +--------------------------+      | Entity Sync Workflows  | |
|             ^                       | - Individual Entities  | |
|             |                       | - Stream API Pages     | |
|   +---------+-----------------------------------+------------+ |
|   |                    Shared Infrastructure                 | |
|   |                                                          | |
|   |  +------------------+      +-------------------------+   | |
|   |  | Redis (KV Store) |      | PostgreSQL              |   | |
|   |  | - Distributed    |      | - Workflow State        |   | |
|   |  |   State          |      | - Entity Data           |   | |
|   |  +------------------+      +-------------------------+   | |
|   +----------------------------------------------------------+ |
+----------------------------------------------------------------+
```

## 2. Entity Manifest-Driven Architecture

The entire sync system is built around **Entity Manifests** that describe what entities are available, their endpoints, and their relationships.

### A. Entity Manifest System (Current Foundation)

✅ **Currently implemented** in the API adapter layer:

```typescript
// adapters/pco/base/pcoEntityManifest.ts
import { mkEntityManifest } from '@openfaith/adapter-core/server'
import { getAllPeopleDefinition } from '@openfaith/pco/modules/people/pcoPeopleEndpoints'

export const pcoEntityManifest = mkEntityManifest([
  getAllPeopleDefinition,
  // getPersonByIdDefinition,
  // createPersonDefinition,
  // updatePersonDefinition,
  // deletePersonDefinition,
] as const)
```

**What this provides:**
- **Entity Registry**: Central catalog of all available entities for an adapter
- **Endpoint Mapping**: Links entities to their available operations (GET, POST, PUT, DELETE)
- **Schema Definitions**: Type-safe schemas for API resources
- **Relationship Discovery**: Foundation for analyzing entity dependencies

### B. Dependency Graph Resolution (Planned)

🚧 The sync engine will analyze entity manifests to build dependency graphs:

**Hard Dependencies** (must-have relationships):
- `Person` must be synced before `Address` (addresses belong to people)
- `Group` must be synced before `Event` (events belong to groups)

**Soft Dependencies** (optimization relationships):
- `Campus` before `Person` (to resolve campus references)
- `Household` before `Person` (to establish household relationships)

## 3. Two-Workflow Sync Architecture (Planned)

The sync engine will implement a **two-tiered workflow system**:

### A. Main Orchestrator Workflow (Planned)

🚧 **Purpose**: Consumes entity manifests and orchestrates the entire sync process

**Responsibilities:**
1. **Load Entity Manifest**: Import the manifest for an adapter (e.g., `pcoEntityManifest`)
2. **Build Dependency Graph**: Analyze entity relationships and create sync order
3. **Fan-out Orchestration**: Launch Entity Sync Workflows in dependency order
4. **Progress Tracking**: Monitor overall sync completion and health

**Workflow Flow:**
```
Entity Manifest → Dependency Analysis → Sync Order → Fan-out to Entity Workflows
```

### B. Entity Sync Workflows (Planned)

🚧 **Purpose**: Handle actual data synchronization for individual entities

**Responsibilities:**
1. **Entity Configuration**: Get entity definition from manifest
2. **Endpoint Selection**: Choose appropriate endpoint based on sync type
3. **API Client Setup**: Get authenticated client for organization
4. **Data Streaming**: Process API data in pages with rate limiting
5. **Data Transformation**: Convert API data to canonical format
6. **Database Storage**: Save transformed data with proper relationships

**Workflow Flow:**
```
Entity Definition → Endpoint Selection → Stream Pages → Transform → Save
```

## 4. Sync Lifecycle (Planned)

The complete sync process will follow this pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MAIN ORCHESTRATOR WORKFLOW                        │
│                                                                             │
│  1. Load Entity Manifest  2. Build Dependency Graph  3. Resolve Sync Order  │
│           ↓                        ↓                         ↓              │
│  ┌───────────────┐    ┌─────────────────────┐    ┌─────────────────────┐    │
│  │ pcoEntityMan- │    │ Hard Dependencies:  │    │ Sync Order:         │    │
│  │ ifest         │───▶│ Person → Address    │───▶│ 1. Campus           │    │
│  │ - Person      │    │ Group → Event       │    │ 2. Household        │    │
│  │ - Address     │    │                     │    │ 3. Person           │    │
│  │ - Group       │    │ Soft Dependencies:  │    │ 4. Address          │    │
│  │ - Event       │    │ Campus → Person     │    │ 5. Group            │    │
│  │ - ...         │    │ Household → Person  │    │ 6. Event            │    │
│  └───────────────┘    └─────────────────────┘    └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                         ┌─────────────────────────┐
                         │    FAN-OUT TO ENTITY    │
                         │    SYNC WORKFLOWS       │
                         └─────────────────────────┘
                                      ↓
    ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
    │   Campus Sync   │ Household Sync  │  Person Sync    │  Address Sync   │
    │   Workflow      │  Workflow       │  Workflow       │  Workflow       │
    │                 │                 │                 │                 │
    │ 1.Stream Pages  │ 1.Stream Pages  │ 1.Stream Pages  │ 1.Stream Pages  │
    │ 2.Process Data  │ 2.Process Data  │ 2.Process Data  │ 2.Process Data  │
    │ 3.Transform     │ 3.Transform     │ 3.Transform     │ 3.Transform     │
    │ 4.Save to DB    │ 4.Save to DB    │ 4.Save to DB    │ 4.Save to DB    │
    └─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## 5. Technology Stack

### Current Implementation (API Adapter Layer)
- ✅ **Effect-TS**: Functional programming foundation with type safety
- ✅ **@effect/platform**: HTTP client and platform abstractions
- ✅ **@effect/schema**: Runtime type validation and transformation
- ✅ **PostgreSQL**: Database for token storage and application data
- ✅ **Drizzle ORM**: Type-safe database operations

### Planned Implementation (Sync Engine)
- 🚧 **@effect/cluster**: Distributed execution and fault tolerance
- 🚧 **@effect/workflow**: Durable, resumable workflows with state persistence
- 🚧 **PostgreSQL**: Workflow state persistence and entity data storage
- 🚧 **Redis**: Distributed state and caching layer

## 6. Current vs. Planned Implementation

### What Works Today:
- ✅ **Entity Manifest System**: `mkEntityManifest()` function and `pcoEntityManifest`
- ✅ **API Adapter Layer**: Complete PCO integration with `pcoApiAdapter()`
- ✅ **Token Management**: Database-backed authentication with refresh
- ✅ **Type-safe HTTP Client**: Integration with `@effect/platform`
- ✅ **Schema System**: Effect Schema for API resource validation
- ✅ **Database Layer**: PostgreSQL with Drizzle ORM

### What's Coming Next:
- 🚧 **Main Orchestrator Workflow**: Entity manifest consumption and dependency graph building
- 🚧 **Entity Sync Workflows**: Individual entity synchronization with streaming
- 🚧 **@effect/cluster Setup**: Distributed execution environment
- 🚧 **@effect/workflow Engine**: Durable workflow state persistence
- 🚧 **Dependency Graph Analysis**: Hard and soft dependency resolution
- 🚧 **Data Transformation Pipeline**: API to canonical model conversion
- 🚧 **Multiple Sync Strategies**: Full, delta, reconciliation, and webhook syncs

## 7. Advantages of This Architecture

### Current Benefits:
1. **Type Safety**: End-to-end type safety from API schemas to database models
2. **Modularity**: API adapters can be used independently of sync engine
3. **Testability**: Pure functions and Effect composition enable comprehensive testing
4. **Maintainability**: Clear separation between API communication and sync logic

### Planned Benefits:
1. **Durability**: Workflows survive restarts and failures without data loss
2. **Scalability**: Distributed execution across multiple nodes
3. **Observability**: Complete audit trail of all sync operations
4. **Flexibility**: Manifest-driven approach adapts to API changes automatically
5. **Efficiency**: Dependency-aware sync ordering minimizes API calls

## 8. Development Roadmap

### Phase 1: Workflow Foundation (Current Priority)
- Set up `@effect/cluster` and `@effect/workflow`
- Implement Main Orchestrator Workflow skeleton
- Create basic Entity Sync Workflow template
- Add workflow state persistence

### Phase 2: Dependency System
- Build entity dependency analysis from manifests
- Implement topological sort for sync ordering
- Add hard vs. soft dependency classification
- Create dependency graph visualization

### Phase 3: Entity Sync Implementation
- Implement streaming data processing in Entity Sync Workflows
- Add durable page processing activities
- Create progress tracking and state management
- Build comprehensive error handling and recovery

### Phase 4: Production Features
- Add monitoring and alerting for workflow execution
- Create admin dashboard showing dependency graphs and sync status
- Implement rate limiting and performance optimization
- Add support for multiple adapter types

The current entity manifest system provides the perfect foundation for this workflow-driven approach, ensuring that sync orchestration will be driven by actual API capabilities rather than hardcoded assumptions. This architecture will scale from simple single-entity syncs to complex multi-thousand-entity orchestrations while maintaining durability and observability throughout.