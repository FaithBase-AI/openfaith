# 07: Durable Workflows in Practice (Planned)

**⚠️ Note: This document describes planned functionality. The sync engine's durable workflow system is not yet implemented. Current status: Foundation exists with entity manifest system.**

This document provides concrete examples of how the durable workflows will work in practice. The Sync Engine will use two main types of workflows that work together to consume entity manifests and orchestrate data synchronization.

## 1. The Two-Workflow Architecture (Planned)

The sync engine will implement a **two-tiered workflow system** based on entity manifests:

### Main Orchestrator Workflow
- **Purpose**: Consumes entity manifests to build dependency graphs and coordinate sync execution
- **Input**: Entity manifest (e.g., `pcoEntityManifest`) + sync configuration
- **Output**: Fan-out to multiple Entity Sync Workflows in dependency order

### Entity Sync Workflow  
- **Purpose**: Handles actual data synchronization for individual entities
- **Input**: Entity name + sync type + organization context
- **Output**: Synced entity data in database

## 2. Main Orchestrator Workflow Implementation (Planned)

This workflow will be the "conductor" that reads entity manifests and orchestrates the entire sync process:

```typescript
// Planned implementation
import { Workflow, Activity, Schema } from '@effect/workflow'
import { Effect, Array, pipe } from 'effect'

const MainSyncOrchestratorWorkflow = Workflow.make({
  name: "MainSyncOrchestrator",
  payload: Schema.Struct({
    orgId: Schema.String,
    adapterName: Schema.Literal("pco"), // Will expand to multiple adapters
    syncType: Schema.Union(
      Schema.Literal("full"),
      Schema.Literal("delta"), 
      Schema.Literal("reconciliation")
    ),
    triggeredBy: Schema.optional(Schema.String), // "webhook", "schedule", "manual"
  }),
  idempotencyKey: (payload) => 
    `main-sync:${payload.orgId}:${payload.adapterName}:${payload.syncType}`,
});

const MainSyncOrchestratorWorkflowLayer = MainSyncOrchestratorWorkflow.toLayer(
  Effect.fn(function* (payload) {
    yield* Effect.log(`Starting ${payload.syncType} sync for org ${payload.orgId}`);
    
    // Step 1: Load the entity manifest for this adapter
    const manifest = yield* LoadEntityManifestActivity.execute({
      adapterName: payload.adapterName
    });
    
    yield* Effect.log(`Loaded manifest with ${Object.keys(manifest).length} entities`);
    
    // Step 2: Build dependency graph from manifest
    const dependencyGraph = yield* BuildDependencyGraphActivity.execute({
      manifest,
      syncType: payload.syncType,
    });
    
    yield* Effect.log(`Built dependency graph with ${dependencyGraph.syncOrder.length} entities`);
    
    // Step 3: Execute entities in dependency order
    const results = yield* pipe(
      dependencyGraph.syncOrder,
      Array.map((entityName) => ({
        entityName,
        workflow: EntitySyncWorkflow.execute({
          orgId: payload.orgId,
          adapterName: payload.adapterName,
          entityName,
          syncType: payload.syncType,
          dependencies: dependencyGraph.dependencies[entityName] || { hard: [], soft: [] },
        })
      })),
      Array.reduce([], (acc, { entityName, workflow }) =>
        Effect.gen(function* () {
          // Wait for hard dependencies to complete
          const hardDeps = dependencyGraph.dependencies[entityName]?.hard || [];
          const completedHardDeps = hardDeps.filter(dep => 
            acc.some(result => result.entityName === dep && result.status === "completed")
          );
          
          if (completedHardDeps.length === hardDeps.length) {
            yield* Effect.log(`Starting sync for ${entityName} (dependencies satisfied)`);
            const result = yield* workflow;
            return [...acc, { entityName, status: "completed", result }];
          } else {
            yield* Effect.log(`Waiting for dependencies for ${entityName}: ${hardDeps.join(", ")}`);
            return [...acc, { entityName, status: "waiting", result: null }];
          }
        })
      )
    );
    
    yield* Effect.log(`Completed sync orchestration. Results: ${JSON.stringify(results)}`);
    
    return {
      orgId: payload.orgId,
      adapterName: payload.adapterName,
      syncType: payload.syncType,
      entitiesProcessed: results.length,
      results
    };
  })
);
```

## 3. Entity Sync Workflow Implementation (Planned)

This workflow will handle the actual data synchronization for individual entities:

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
    dependencies: Schema.Struct({
      hard: Schema.Array(Schema.String),
      soft: Schema.Array(Schema.String),
    }),
  }),
  idempotencyKey: (payload) => 
    `entity-sync:${payload.orgId}:${payload.adapterName}:${payload.entityName}:${payload.syncType}`,
});

const EntitySyncWorkflowLayer = EntitySyncWorkflow.toLayer(
  Effect.fn(function* (payload) {
    yield* Effect.log(`Starting ${payload.syncType} sync for entity: ${payload.entityName}`);
    
    // Step 1: Get entity definition from manifest
    const entityDefinition = yield* GetEntityDefinitionActivity.execute({
      adapterName: payload.adapterName,
      entityName: payload.entityName,
    });
    
    // Step 2: Select appropriate endpoint based on sync type
    const endpoint = yield* SelectEndpointActivity.execute({
      entityDefinition,
      syncType: payload.syncType,
    });
    
    yield* Effect.log(`Selected endpoint: ${endpoint.name} for ${payload.entityName}`);
    
    // Step 3: Get API client for this organization
    const apiClient = yield* GetApiClientActivity.execute({
      orgId: payload.orgId,
      adapterName: payload.adapterName,
    });
    
    // Step 4: Determine sync parameters (e.g., last sync timestamp for delta)
    const syncParams = yield* GetSyncParametersActivity.execute({
      orgId: payload.orgId,
      entityName: payload.entityName,
      syncType: payload.syncType,
    });
    
    // Step 5: Stream data from API in pages
    let pageNumber = 0;
    let hasMorePages = true;
    let totalRecordsProcessed = 0;
    
    while (hasMorePages) {
      const pageResult = yield* ProcessEntityPageActivity.execute({
        orgId: payload.orgId,
        entityName: payload.entityName,
        apiClient,
        endpoint,
        pageNumber,
        syncParams,
      });
      
      totalRecordsProcessed += pageResult.recordsProcessed;
      hasMorePages = pageResult.hasMorePages;
      pageNumber++;
      
      yield* Effect.log(
        `Processed page ${pageNumber} for ${payload.entityName}: ` +
        `${pageResult.recordsProcessed} records, hasMore: ${hasMorePages}`
      );
      
      // Add durable delay between pages to respect rate limits
      if (hasMorePages) {
        yield* Workflow.sleep("1 second");
      }
    }
    
    // Step 6: Update sync completion status
    yield* UpdateSyncStatusActivity.execute({
      orgId: payload.orgId,
      entityName: payload.entityName,
      syncType: payload.syncType,
      totalRecordsProcessed,
      completedAt: new Date(),
    });
    
    yield* Effect.log(`Completed sync for ${payload.entityName}: ${totalRecordsProcessed} records`);
    
    return {
      entityName: payload.entityName,
      syncType: payload.syncType,
      totalRecordsProcessed,
      pagesProcessed: pageNumber,
    };
  })
);
```

## 4. Durable Activities (Planned)

Activities are the building blocks that perform the actual work. They are durable and can be retried if they fail:

### Manifest and Dependency Activities

```typescript
// Planned implementation
const LoadEntityManifestActivity = Activity.make({
  name: "LoadEntityManifest",
  payload: Schema.Struct({
    adapterName: Schema.String,
  }),
  handler: Effect.fn(function* (payload) {
    // Load the entity manifest (e.g., pcoEntityManifest)
    const manifest = yield* getManifestForAdapter(payload.adapterName);
    
    return {
      manifest,
      entityCount: Object.keys(manifest).length,
    };
  }),
});

const BuildDependencyGraphActivity = Activity.make({
  name: "BuildDependencyGraph", 
  payload: Schema.Struct({
    manifest: Schema.Record(Schema.String, Schema.Any),
    syncType: Schema.String,
  }),
  handler: Effect.fn(function* (payload) {
    const entities = Object.keys(payload.manifest);
    const dependencies: Record<string, { hard: string[], soft: string[] }> = {};
    
    // Analyze each entity for dependencies
    for (const entityName of entities) {
      const entityDef = payload.manifest[entityName];
      
      // Extract dependencies from schema analysis
      const hardDeps = yield* extractHardDependencies(entityDef);
      const softDeps = yield* extractSoftDependencies(entityDef);
      
      dependencies[entityName] = { hard: hardDeps, soft: softDeps };
    }
    
    // Build topological sort order
    const syncOrder = yield* topologicalSort(dependencies);
    
    return { dependencies, syncOrder };
  }),
});
```

### Data Processing Activities

```typescript
// Planned implementation
const ProcessEntityPageActivity = Activity.make({
  name: "ProcessEntityPage",
  payload: Schema.Struct({
    orgId: Schema.String,
    entityName: Schema.String,
    apiClient: Schema.Any,
    endpoint: Schema.Any,
    pageNumber: Schema.Number,
    syncParams: Schema.Record(Schema.String, Schema.Any),
  }),
  handler: Effect.fn(function* (payload) {
    // Call the API for this page
    const apiResponse = yield* payload.apiClient.execute(
      payload.endpoint,
      {
        ...payload.syncParams,
        offset: payload.pageNumber * 25, // PCO page size
        per_page: 25,
      }
    );
    
    // Transform API data to canonical format
    const transformedData = yield* transformApiData(
      apiResponse.data,
      payload.entityName
    );
    
    // Save to database
    yield* saveToDatabase(
      payload.orgId,
      payload.entityName,
      transformedData
    );
    
    return {
      recordsProcessed: transformedData.length,
      hasMorePages: apiResponse.links?.next != null,
      pageNumber: payload.pageNumber,
    };
  }),
});
```

## 5. Workflow Execution Examples (Planned)

### Example 1: Full Sync for New Organization

```typescript
// Planned usage
const result = yield* MainSyncOrchestratorWorkflow.execute({
  orgId: "org_123",
  adapterName: "pco",
  syncType: "full",
  triggeredBy: "manual",
});

// This would:
// 1. Load pcoEntityManifest
// 2. Build dependency graph: Campus → Household → Person → Address
// 3. Execute EntitySyncWorkflow for each entity in order
// 4. Each EntitySyncWorkflow streams all pages for that entity
```

### Example 2: Delta Sync for Existing Organization

```typescript
// Planned usage - triggered by scheduler every 15 minutes
const result = yield* MainSyncOrchestratorWorkflow.execute({
  orgId: "org_123", 
  adapterName: "pco",
  syncType: "delta",
  triggeredBy: "schedule",
});

// This would:
// 1. Load pcoEntityManifest
// 2. Filter to only entities that support delta sync
// 3. Execute EntitySyncWorkflow with updated_at filters
// 4. Only process records changed since last sync
```

### Example 3: Webhook-Triggered Single Entity Update

```typescript
// Planned usage - triggered by PCO webhook
const result = yield* EntitySyncWorkflow.execute({
  orgId: "org_123",
  adapterName: "pco", 
  entityName: "Person",
  syncType: "full", // Full sync for this specific entity
  dependencies: { hard: [], soft: [] }, // No deps for single entity
});

// This would:
// 1. Get Person entity definition from manifest
// 2. Select appropriate endpoint (getPersonById)
// 3. Sync only the specific person mentioned in webhook
```

## 6. Durability Guarantees (Planned)

### Workflow State Persistence
- Every workflow step will be persisted to PostgreSQL
- If server restarts, workflows resume from last completed step
- No data loss even during deployments or crashes

### Activity Retry Logic
- Activities can be retried with exponential backoff
- Configurable retry limits per activity type
- Dead letter queues for failed activities

### Exactly-Once Processing
- Idempotent workflow keys prevent duplicate execution
- Database transactions ensure atomic operations
- API client includes request deduplication

## 7. Current Implementation Status

### What Exists Today:
- ✅ **Entity Manifest System**: Foundation with `pcoEntityManifest` ready for consumption
- ✅ **API Client Layer**: Complete HTTP client with authentication for workflow activities
- ✅ **Database Layer**: PostgreSQL setup ready for workflow state persistence
- ✅ **Type Safety**: Full TypeScript integration throughout

### What's Planned (Not Yet Implemented):
- 🚧 **@effect/workflow Setup**: Workflow runtime and persistence configuration
- 🚧 **Main Orchestrator**: Entity manifest consumption and dependency resolution
- 🚧 **Entity Sync Workflows**: Individual entity synchronization logic
- 🚧 **Durable Activities**: Retry logic and failure handling
- 🚧 **Workflow Scheduling**: Cron-based and webhook-triggered execution
- 🚧 **Monitoring Dashboard**: Real-time workflow status and metrics

## 8. Development Roadmap

### Phase 1: Workflow Foundation
- Set up `@effect/workflow` runtime
- Implement basic workflow state persistence
- Create simple test workflows

### Phase 2: Manifest Integration
- Build LoadEntityManifestActivity
- Implement BuildDependencyGraphActivity  
- Create entity dependency analysis logic

### Phase 3: Core Sync Workflows
- Implement MainSyncOrchestratorWorkflow
- Build EntitySyncWorkflow with streaming
- Add ProcessEntityPageActivity with database integration

### Phase 4: Production Features
- Add comprehensive error handling and retries
- Implement workflow monitoring and alerting
- Create admin dashboard for workflow management

The entity manifest system provides the perfect foundation for this workflow architecture, ensuring that sync orchestration will be driven by actual API capabilities rather than hardcoded assumptions.