# 06: Sync Engine Architecture (Planned)

**⚠️ Note: This document describes the planned architecture for the Sync Engine, which is not yet implemented. The current codebase only includes the API adapter layer.**

This document provides a high-level overview of the planned Sync Engine's architecture. While the **API Adapter Library** handles the "how" of communicating with an external API, the **Sync Engine** will be responsible for the "what" and "when" of the data synchronization process.

It will be a stateful, durable, and scalable application designed to orchestrate complex data flows reliably.

## 1. Core Responsibility (Planned)

The Sync Engine's primary purpose will be to act as a **durable conductor**. It will use the stateless API Adapter as its instrument to perform complex, long-running data synchronization tasks. Its responsibilities will include:

*   **Orchestration:** Executing sync jobs in the correct order based on data dependencies.
*   **Durability:** Ensuring that sync processes can survive restarts, deployments, and transient failures without losing state or corrupting data.
*   **State Management:** Keeping track of the progress of each sync, such as the last record processed or the timestamp of the last successful update.
*   **Scalability:** Distributing the workload across multiple server nodes to handle large amounts of data and a high number of concurrent sync jobs.
*   **Data Transformation:** Converting data from the API's canonical format into the schema required by our primary application database.

## 2. Entity Manifest-Driven Architecture (Planned)

The Sync Engine will be built around a **two-tiered workflow system** that consumes entity manifests to understand what needs to be synchronized and how entities relate to each other.

### A. The Entity Manifest System (Current Foundation)

The foundation for this approach already exists in the API adapter layer:

```typescript
// adapters/pco/base/pcoEntityManifest.ts (Current Implementation)
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

This manifest groups endpoint definitions by entity and provides a structured way to understand:
- What entities are available for sync
- What operations can be performed on each entity
- The API schemas and module organization

### B. Main Orchestration Workflow (Planned)

The **Main Sync Orchestrator Workflow** will consume the entity manifest to build an intelligent sync plan:

```typescript
// Planned implementation
const MainSyncOrchestratorWorkflow = Workflow.make({
  name: "MainSyncOrchestrator",
  payload: Schema.Struct({
    orgId: Schema.String,
    adapterName: Schema.Literal("pco"), // Will support multiple adapters
    syncType: Schema.Union(
      Schema.Literal("full"),
      Schema.Literal("delta"),
      Schema.Literal("reconciliation")
    ),
  }),
  idempotencyKey: (payload) => `main-sync:${payload.orgId}:${payload.adapterName}:${payload.syncType}`
});

const MainSyncOrchestratorWorkflowLayer = MainSyncOrchestratorWorkflow.toLayer(
  Effect.fn(function* (payload) {
    // 1. Load the entity manifest for the adapter
    const manifest = yield* getManifestForAdapter(payload.adapterName); // e.g., pcoEntityManifest
    
    // 2. Build dependency graph from manifest
    const dependencyGraph = yield* buildEntityDependencyGraph(manifest);
    
    // 3. Determine sync order based on hard and soft dependencies
    const syncOrder = yield* resolveSyncOrder(dependencyGraph);
    
    // 4. Fan out to individual entity sync workflows
    yield* Array.forEachEffect(syncOrder, (entityName) =>
      EntitySyncWorkflow.execute({
        orgId: payload.orgId,
        adapterName: payload.adapterName,
        entityName,
        syncType: payload.syncType,
      }).pipe(Effect.forkDaemon)
    );
    
    yield* Effect.log(`Started sync for ${syncOrder.length} entities in dependency order`);
  })
);
```

### C. Entity Sync Workflow (Planned)

The **Entity Sync Workflow** will handle the actual data synchronization for individual entities:

```typescript
// Planned implementation
const EntitySyncWorkflow = Workflow.make({
  name: "EntitySync",
  payload: Schema.Struct({
    orgId: Schema.String,
    adapterName: Schema.String,
    entityName: Schema.String,
    syncType: Schema.Union(
      Schema.Literal("full"),
      Schema.Literal("delta"),
      Schema.Literal("reconciliation")
    ),
  }),
  idempotencyKey: (payload) => 
    `entity-sync:${payload.orgId}:${payload.adapterName}:${payload.entityName}:${payload.syncType}`
});

const EntitySyncWorkflowLayer = EntitySyncWorkflow.toLayer(
  Effect.fn(function* (payload) {
    // 1. Get entity definition from manifest
    const manifest = yield* getManifestForAdapter(payload.adapterName);
    const entityDef = manifest[payload.entityName];
    
    // 2. Get the appropriate API client
    const apiClient = yield* getApiClientForOrg(payload.orgId, payload.adapterName);
    
    // 3. Determine which endpoint to use based on sync type
    const endpoint = yield* selectEndpointForSyncType(entityDef, payload.syncType);
    
    // 4. Stream data from API in pages
    const dataStream = yield* streamEntityData(apiClient, endpoint, payload.syncType);
    
    // 5. Process each page with durable activities
    yield* Stream.runForEach(dataStream, (page) =>
      ProcessEntityPageActivity.execute({
        orgId: payload.orgId,
        entityName: payload.entityName,
        pageData: page,
        pageOffset: page.offset,
      })
    );
    
    yield* Effect.log(`Completed sync for entity: ${payload.entityName}`);
  })
);
```

## 3. Dependency Graph Resolution (Planned)

The sync engine will analyze the entity manifest to understand relationships and build a dependency graph:

### Hard Dependencies
These are **must-have** relationships where Entity B cannot be synced without Entity A:
- `Person` must be synced before `Address` (addresses belong to people)
- `Group` must be synced before `Event` (events belong to groups)

### Soft Dependencies  
These are **nice-to-have** optimizations where syncing Entity A first makes Entity B more efficient:
- `Campus` before `Person` (to resolve campus references)
- `Household` before `Person` (to establish household relationships)

```typescript
// Planned implementation
function buildEntityDependencyGraph(manifest: EntityManifest) {
  return Effect.gen(function* () {
    const entities = Object.keys(manifest);
    const dependencies: Record<string, { hard: string[], soft: string[] }> = {};
    
    // Analyze each entity's endpoints for relationship indicators
    for (const entityName of entities) {
      const entityDef = manifest[entityName];
      
      // Look for foreign key patterns in schemas
      const hardDeps = yield* extractHardDependencies(entityDef);
      const softDeps = yield* extractSoftDependencies(entityDef);
      
      dependencies[entityName] = { hard: hardDeps, soft: softDeps };
    }
    
    // Build topological sort respecting hard dependencies
    const syncOrder = yield* topologicalSort(dependencies);
    
    return { dependencies, syncOrder };
  });
}
```

## 4. Technology Choices (Planned)

To meet these demanding requirements, the Sync Engine will be built upon two core technologies from the Effect-TS ecosystem: **`@effect/cluster`** and **`@effect/workflow`**.

### A. `@effect/cluster`: For Scalability and Fault Tolerance (Planned)

A single server cannot handle the workload of syncing data for thousands of organizations simultaneously. `@effect/cluster` will allow us to run the Sync Engine as a cohesive group of nodes that work together.

*   **What it is:** A framework for building distributed, fault-tolerant applications.
*   **Why we will use it:**
    *   **Horizontal Scaling:** We will be able to add more nodes to the cluster to increase our overall processing capacity. The cluster will automatically distribute work across all available nodes.
    *   **Fault Tolerance:** If a node crashes, the cluster will detect it and automatically re-assign its work to healthy nodes. This will ensure the system as a whole remains operational.
    *   **Location Transparency:** We will be able to send a command to the cluster (e.g., "start sync for organization X") without needing to know which specific node will execute it.

### B. `@effect/workflow`: For Durability and Observability (Planned)

A sync job can take minutes, hours, or even days to complete. It will be unacceptable for such a process to lose its progress due to a server restart or a network blip. `@effect/workflow` will solve this by making our business logic durable.

*   **What it is:** A framework for defining and executing long-running, persistent, and resumable processes.
*   **Why we will use it:**
    *   **Durability:** Every sync job will be modeled as a workflow. The state of each workflow will be automatically persisted to a SQL database (PostgreSQL) at each step. If the application restarts, all in-progress workflows will resume from exactly where they left off.
    *   **Observability:** Because the state of every workflow will be in a database, we will have a complete, queryable history of all sync jobs. We will be able to easily build dashboards or admin panels to see what's running, what has completed, and what has failed.
    *   **Durable Timers & Activities:** Workflows will be able to safely schedule future work (e.g., "retry this in 5 minutes" or "run a reconciliation sync in 24 hours") and execute individual steps (`Activities`) with at-most-once guarantees.

## 5. The Sync Lifecycle (Planned)

The Sync Engine will manage several types of sync jobs, each designed for a specific purpose. A complete data integration will rely on all of them working together.

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

*   **Initial Full Sync:** Will be triggered when a new organization connects their account. The Main Orchestrator will process the entire entity manifest in dependency order.
*   **Periodic Delta Sync:** Will be the most common type of sync. The Main Orchestrator will process only entities that support delta sync with `updated_at` fields.
*   **Nightly Reconciliation Sync:** Will be a critical "janitor" process. The Main Orchestrator will run reconciliation workflows for all entities to detect deletions.
*   **Webhook-Triggered Updates:** For APIs that support webhooks, incoming events will trigger individual Entity Sync Workflows for specific records.

## 6. Current Implementation Status

### What Exists Today:
- ✅ **Entity Manifest System**: `mkEntityManifest()` function and `pcoEntityManifest`
- ✅ **API Adapter Layer**: Complete implementation using `@openfaith/adapter-core` and `@openfaith/pco`
- ✅ **Token Management**: Database-backed authentication with automatic refresh
- ✅ **Type-safe HTTP Client**: Integration with Effect's HttpApiClient
- ✅ **Endpoint Definitions**: Foundation for entity relationship analysis

### What's Planned (Not Yet Implemented):
- 🚧 **Main Orchestrator Workflow**: Entity manifest consumption and dependency graph building
- 🚧 **Entity Sync Workflows**: Individual entity synchronization with streaming
- 🚧 **Dependency Graph Analysis**: Hard and soft dependency detection
- 🚧 **@effect/cluster Integration**: Distributed execution environment
- 🚧 **@effect/workflow Implementation**: Durable, resumable workflows
- 🚧 **Data Transformation Pipeline**: API data to canonical model conversion
- 🚧 **Multiple Sync Strategies**: Full, delta, reconciliation, and webhook syncs

## 7. Development Roadmap

The sync engine will be implemented in phases:

### Phase 1: Core Workflow Engine
- Set up `@effect/cluster` and `@effect/workflow`
- Implement Main Orchestrator Workflow skeleton
- Create basic Entity Sync Workflow template
- Add workflow state persistence

### Phase 2: Dependency Graph System
- Build entity dependency analysis from manifests
- Implement topological sort for sync ordering
- Add hard vs. soft dependency classification
- Create dependency graph visualization tools

### Phase 3: Entity Sync Implementation
- Implement streaming data processing
- Add durable page processing activities
- Create progress tracking and state management
- Build error handling and recovery

### Phase 4: Operations & Monitoring
- Add comprehensive logging and metrics
- Create admin dashboard showing dependency graphs
- Implement alerting system
- Add performance optimization

The current entity manifest system provides the perfect foundation for this workflow-driven approach, ensuring that the sync engine will have a clear understanding of entity relationships and sync requirements from day one.