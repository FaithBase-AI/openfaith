# 11: Implementation Roadmap - AI-Ready Tasks

This document breaks down the sync engine implementation into discrete, AI-promptable tasks. Each task includes context, acceptance criteria, and can be fed directly to an AI assistant for implementation.

## 📋 Current State Summary

**✅ What We Have:**
- Basic workflow engine in `backend/workers/index.ts`
- Entity manifest system with `pcoEntityManifest` 
- Rich endpoint definitions in `adapters/pco/modules/people/pcoPeopleEndpoints.ts`
- Database layer with `PgLive` integration
- PCO API adapter with authentication

**🎯 What We're Building Toward:**
- Main Orchestrator Workflow that consumes entity manifests
- Entity-specific workflows for each sync operation
- Dependency graph analysis and resolution
- Multiple sync strategies (full, delta, reconciliation)
- Comprehensive error handling and monitoring

---

## Phase 1: Entity Manifest Integration

### Task 1.1: Dynamic Entity Loading
**Complexity**: Low | **Priority**: High | **Estimated Time**: 2-3 hours

**AI Prompt:**
```
I have a workflow engine at `backend/workers/index.ts` that currently hardcodes syncing "people" data. I want to make it dynamic by consuming the PCO entity manifest.

Current state:
- Workflow payload only takes `tokenKey: string`
- Hardcoded to call `pcoClient.people.getAll`
- Entity manifest exists at `adapters/pco/base/pcoEntityManifest.ts`

Requirements:
1. Update workflow payload to accept optional `entities: string[]` parameter
2. If no entities specified, sync all entities from manifest
3. Load `pcoEntityManifest` in the workflow
4. Iterate through specified entities and call appropriate endpoints
5. Maintain existing logging and error handling patterns

Files to modify:
- `backend/workers/index.ts` - main workflow
- `backend/workers/runner.ts` - update function signature
- `backend/workers/README.md` - update documentation

Acceptance criteria:
- Can sync specific entities: `runPcoSync("token", ["Person"])`
- Can sync all entities: `runPcoSync("token")` 
- Logs which entities are being synced
- Maintains backwards compatibility
```

### Task 1.2: Entity Definition Analysis
**Complexity**: Medium | **Priority**: High | **Estimated Time**: 3-4 hours

**AI Prompt:**
```
I need to analyze PCO entity definitions to understand their capabilities and metadata. The goal is to extract useful information for sync orchestration.

Context:
- Entity manifest at `adapters/pco/base/pcoEntityManifest.ts` contains multiple endpoint definitions
- Each endpoint has rich metadata: `orderableBy`, `queryableBy`, `includes`, `method`, etc.
- Example endpoint at `adapters/pco/modules/people/pcoPeopleEndpoints.ts`

Requirements:
1. Create utility functions to analyze entity definitions:
   - `getEntityCapabilities(entityDef)` - returns supported operations (GET, POST, PATCH, DELETE)
   - `getEntityRelationships(entityDef)` - extracts relationships from `includes`
   - `getEntityDeltaFields(entityDef)` - finds fields suitable for delta sync (like `updated_at`)
   - `getEntityOrderableFields(entityDef)` - returns `orderableBy` fields
2. Create type definitions for the analysis results
3. Add comprehensive unit tests
4. Create a utility to analyze the entire manifest and return insights

Files to create:
- `backend/workers/utils/entityAnalysis.ts`
- `backend/workers/utils/entityAnalysis.test.ts`

Acceptance criteria:
- Can analyze individual entity definitions
- Can detect relationship dependencies
- Can identify delta sync capabilities
- Returns type-safe results
- Has comprehensive test coverage
```

### Task 1.3: Multi-Entity Workflow Execution
**Complexity**: Medium | **Priority**: High | **Estimated Time**: 4-5 hours

**AI Prompt:**
```
I need to update the workflow to handle multiple entities dynamically based on the entity manifest analysis.

Current state:
- Workflow syncs one hardcoded entity (people)
- Uses `createPaginatedStream` for data fetching
- Has basic error handling and logging

Requirements:
1. Update workflow to iterate through multiple entities
2. Use entity analysis utils to determine how to sync each entity
3. For each entity, determine the appropriate endpoint (usually the `getAll` endpoint)
4. Maintain streaming approach for large datasets
5. Add entity-specific error handling (failures in one entity shouldn't stop others)
6. Log progress for each entity separately
7. Return comprehensive results showing success/failure per entity

Technical approach:
- Use `Effect.forEach` to process entities sequentially
- Wrap each entity sync in try/catch for isolation
- Accumulate results and return summary

Files to modify:
- `backend/workers/index.ts`
- `backend/workers/runner.ts`

Acceptance criteria:
- Can sync multiple entities in one workflow execution
- Failures in one entity don't affect others
- Detailed logging per entity
- Returns structured results showing what was synced
- Maintains performance with streaming approach
```

---

## Phase 2: Dependency Graph System

### Task 2.1: Dependency Graph Analysis
**Complexity**: High | **Priority**: Medium | **Estimated Time**: 6-8 hours

**AI Prompt:**
```
I need to implement dependency graph analysis to determine the correct order for syncing entities based on their relationships.

Context:
- PCO entities have relationships defined in their `includes` field
- Example: Person includes 'addresses', 'primary_campus', 'households'
- Need to sync in dependency order: Campus → Household → Person → Address
- Some dependencies are "hard" (required) vs "soft" (optimization)

Requirements:
1. Analyze entity relationships from manifest
2. Build dependency graph data structure
3. Implement topological sort for sync ordering
4. Classify dependencies as hard vs soft:
   - Hard: Entity B cannot exist without Entity A (Person → Address)
   - Soft: Entity B is more efficient with Entity A (Campus → Person)
5. Handle circular dependencies gracefully
6. Provide clear error messages for invalid graphs

Technical approach:
- Parse `includes` fields to extract entity relationships
- Build directed graph representation
- Use Kahn's algorithm for topological sorting
- Implement dependency classification heuristics

Files to create:
- `backend/workers/utils/dependencyGraph.ts`
- `backend/workers/utils/dependencyGraph.test.ts`

Acceptance criteria:
- Can build dependency graph from entity manifest
- Correctly identifies hard vs soft dependencies
- Produces valid topological ordering
- Handles edge cases (circular deps, missing entities)
- Has comprehensive test coverage with example PCO data
```

### Task 2.2: Dependency-Aware Workflow Execution
**Complexity**: High | **Priority**: Medium | **Estimated Time**: 5-6 hours

**AI Prompt:**
```
I need to update the workflow to execute entity syncs in dependency order rather than arbitrary order.

Current state:
- Workflow processes entities sequentially in manifest order
- No consideration of dependencies between entities
- All entities treated equally

Requirements:
1. Use dependency graph to determine sync order
2. Implement dependency-aware execution:
   - Hard dependencies: Must wait for prerequisite entities to complete
   - Soft dependencies: Can run in parallel but prefer dependency order
3. Add configurable execution strategies:
   - Sequential: One entity at a time in dependency order
   - Parallel: Run independent entities concurrently
   - Hybrid: Sequential for hard deps, parallel for soft deps
4. Maintain detailed progress tracking
5. Handle dependency failures gracefully

Technical approach:
- Build dependency graph at workflow start
- Use Effect.forEach with dependency checking
- Implement execution strategy pattern
- Track completion status per entity

Files to modify:
- `backend/workers/index.ts`
- Add new execution strategy files if needed

Acceptance criteria:
- Entities sync in correct dependency order
- Hard dependencies are respected
- Soft dependencies optimize performance
- Configurable execution strategies
- Graceful handling of dependency failures
```

---

## Phase 3: Activity-Based Architecture

### Task 3.1: Activity Decomposition
**Complexity**: Medium | **Priority**: Medium | **Estimated Time**: 4-5 hours

**AI Prompt:**
```
I need to decompose the monolithic workflow into smaller, durable activities for better observability and retry logic.

Current state:
- Single workflow does everything: load manifest, sync entities, log results
- Difficult to retry individual steps if they fail
- Limited observability into what's happening

Requirements:
1. Break workflow into discrete activities:
   - `LoadEntityManifestActivity` - loads and analyzes manifest
   - `BuildDependencyGraphActivity` - creates dependency ordering
   - `SyncEntityPageActivity` - syncs one page of one entity
   - `UpdateSyncStatusActivity` - records sync completion
2. Each activity should be independently retryable
3. Add proper error handling and logging per activity
4. Maintain workflow state between activities
5. Use Effect's Activity.make with proper schemas

Technical approach:
- Create separate activity files for organization
- Use schemas for all activity inputs/outputs
- Implement retry logic with exponential backoff
- Add comprehensive logging and metrics

Files to create:
- `backend/workers/activities/loadManifest.ts`
- `backend/workers/activities/buildDependencyGraph.ts`
- `backend/workers/activities/syncEntityPage.ts`
- `backend/workers/activities/updateSyncStatus.ts`

Files to modify:
- `backend/workers/index.ts` - update workflow to use activities

Acceptance criteria:
- Workflow composed of discrete, retryable activities
- Each activity has proper input/output schemas
- Comprehensive error handling and logging
- Can retry individual activities without restarting entire workflow
```

### Task 3.2: Activity Monitoring and Metrics
**Complexity**: Medium | **Priority**: Low | **Estimated Time**: 3-4 hours

**AI Prompt:**
```
I need to add comprehensive monitoring and metrics to the workflow activities for observability.

Current state:
- Basic logging with Effect.log
- No metrics or performance tracking
- Limited visibility into activity performance

Requirements:
1. Add metrics collection for each activity:
   - Execution time
   - Success/failure rates
   - Retry counts
   - Data volume processed
2. Add structured logging with consistent format
3. Create activity-specific metrics:
   - Manifest loading time
   - Dependency graph complexity
   - Records processed per second
   - API response times
4. Integration with OpenTelemetry for tracing
5. Add health check endpoints

Technical approach:
- Use Effect's metrics system
- Add custom metrics for business logic
- Structured logging with consistent fields
- OpenTelemetry integration for distributed tracing

Files to create:
- `backend/workers/metrics/activityMetrics.ts`
- `backend/workers/metrics/healthCheck.ts`

Files to modify:
- All activity files to add metrics
- `backend/workers/index.ts` to add tracing

Acceptance criteria:
- Comprehensive metrics for all activities
- Structured logging with searchable fields
- Performance insights available
- Health check endpoints working
- OpenTelemetry traces end-to-end
```

---

## Phase 4: Sync Strategies

### Task 4.1: Delta Sync Implementation
**Complexity**: High | **Priority**: High | **Estimated Time**: 6-8 hours

**AI Prompt:**
```
I need to implement delta sync to only process records that have changed since the last sync.

Current state:
- Only full sync implemented (processes all records)
- No tracking of last sync timestamps
- Inefficient for large datasets with few changes

Requirements:
1. Add sync state tracking:
   - Store last successful sync timestamp per entity per org
   - Track sync status (in_progress, completed, failed)
   - Store sync metadata (records processed, errors)
2. Implement delta sync logic:
   - Use `updated_at` field from entity `orderableBy` metadata
   - Query API with `where: { updated_at: { gt: lastSyncTime } }`
   - Fall back to full sync if no delta capability
3. Add sync type parameter to workflow
4. Create database schema for sync state tracking
5. Handle edge cases:
   - First sync (no previous timestamp)
   - Failed syncs (don't advance timestamp)
   - Clock skew between systems

Technical approach:
- Create sync state table and schema
- Update workflow payload to include sync type
- Use entity analysis to determine delta capability
- Implement timestamp-based querying

Files to create:
- `packages/db/schema/syncStateSchema.ts`
- `backend/workers/utils/syncStateManager.ts`
- Database migration for sync state table

Files to modify:
- `backend/workers/index.ts` - add sync type handling
- Activity files to support delta sync

Acceptance criteria:
- Can perform delta sync based on updated_at timestamps
- Sync state properly tracked in database
- Falls back to full sync when delta not supported
- Handles edge cases gracefully
- Significant performance improvement for large datasets
```

### Task 4.2: Reconciliation Sync Implementation
**Complexity**: High | **Priority**: Medium | **Estimated Time**: 5-6 hours

**AI Prompt:**
```
I need to implement reconciliation sync to detect and handle deleted records that wouldn't appear in delta syncs.

Context:
- Delta sync only catches updated records
- Deleted records in PCO won't appear in API responses
- Need periodic reconciliation to detect deletions
- Should be run less frequently than delta sync (e.g., nightly)

Requirements:
1. Implement reconciliation sync strategy:
   - Get all IDs from API for an entity
   - Compare with IDs in local database
   - Mark missing records as deleted
   - Optionally soft-delete vs hard-delete
2. Add configurable reconciliation behavior:
   - Soft delete (mark as deleted but keep record)
   - Hard delete (remove from database)
   - Archive (move to archive table)
3. Add reconciliation reporting:
   - How many records were deleted
   - Which records were affected
   - Reconciliation summary
4. Optimize for large datasets:
   - Process in chunks
   - Use efficient ID-only queries
   - Batch delete operations

Technical approach:
- Add reconciliation sync type to workflow
- Create ID-only sync mode for efficiency
- Implement set difference logic
- Add soft delete fields to schemas

Files to create:
- `backend/workers/utils/reconciliation.ts`
- `backend/workers/activities/reconcileEntity.ts`

Files to modify:
- Database schemas to support soft delete
- Workflow to handle reconciliation sync type

Acceptance criteria:
- Can detect deleted records via reconciliation
- Configurable deletion behavior (soft/hard/archive)
- Efficient processing for large datasets
- Comprehensive reporting of reconciliation results
- Integrates with existing sync workflow
```

---

## Phase 5: Two-Tiered Architecture

### Task 5.1: Entity-Specific Workflows
**Complexity**: High | **Priority**: Medium | **Estimated Time**: 8-10 hours

**AI Prompt:**
```
I need to split the monolithic sync workflow into a two-tiered architecture: Main Orchestrator + Entity-specific workflows.

Current state:
- Single workflow handles all entities
- Difficult to retry individual entity syncs
- All entities share the same workflow state

Requirements:
1. Create Main Orchestrator Workflow:
   - Consumes entity manifest
   - Builds dependency graph
   - Fans out to entity-specific workflows
   - Tracks overall progress
   - Handles orchestration-level failures
2. Create Entity Sync Workflow template:
   - Handles one entity type
   - Can be retried independently
   - Reports progress back to orchestrator
   - Supports all sync types (full, delta, reconciliation)
3. Implement workflow communication:
   - Orchestrator starts entity workflows
   - Entity workflows report status back
   - Handle partial failures gracefully
4. Add workflow scheduling and queuing
5. Maintain transactional integrity

Technical approach:
- Use Effect's workflow composition
- Implement workflow-to-workflow communication
- Add workflow state management
- Create reusable entity workflow template

Files to create:
- `backend/workers/workflows/mainOrchestrator.ts`
- `backend/workers/workflows/entitySync.ts`
- `backend/workers/workflows/workflowCommunication.ts`

Files to modify:
- `backend/workers/index.ts` - become main orchestrator
- `backend/workers/runner.ts` - support new architecture

Acceptance criteria:
- Clear separation between orchestration and entity sync
- Entity workflows can be retried independently
- Orchestrator handles overall coordination
- Maintains data consistency across workflows
- Supports partial success scenarios
```

### Task 5.2: Workflow Scheduling and Queuing
**Complexity**: Medium | **Priority**: Low | **Estimated Time**: 4-5 hours

**AI Prompt:**
```
I need to add scheduling and queuing capabilities to the workflow system for production use.

Current state:
- Workflows run on-demand via API calls
- No scheduling for periodic syncs
- No queuing system for high-volume scenarios

Requirements:
1. Add cron-based scheduling:
   - Daily full sync
   - Hourly delta sync
   - Nightly reconciliation sync
   - Per-organization scheduling
2. Implement workflow queuing:
   - Prevent duplicate syncs for same org
   - Handle burst scenarios
   - Priority-based queuing
   - Rate limiting per organization
3. Add workflow management:
   - Cancel running workflows
   - Retry failed workflows
   - View workflow status
   - Workflow history
4. Create admin API endpoints:
   - Start/stop workflows
   - View queue status
   - Manage schedules

Technical approach:
- Use Effect's scheduling primitives
- Implement workflow queue with priorities
- Add workflow management database tables
- Create admin API layer

Files to create:
- `backend/workers/scheduling/cronScheduler.ts`
- `backend/workers/scheduling/workflowQueue.ts`
- `backend/workers/api/workflowAdmin.ts`

Files to modify:
- `backend/api/router/coreRouter.ts` - add admin endpoints

Acceptance criteria:
- Workflows can be scheduled via cron expressions
- Queuing prevents duplicate/conflicting syncs
- Admin API provides workflow management
- Production-ready scheduling system
```

---

## Phase 6: Production Features

### Task 6.1: Comprehensive Error Handling
**Complexity**: Medium | **Priority**: High | **Estimated Time**: 4-5 hours

**AI Prompt:**
```
I need to add comprehensive error handling and recovery mechanisms to the workflow system.

Current state:
- Basic error logging
- No retry strategies
- No error classification
- Limited recovery options

Requirements:
1. Add error classification:
   - Transient errors (network, rate limits) → retry
   - Permanent errors (auth, schema) → fail fast
   - Business errors (data validation) → skip record
2. Implement retry strategies:
   - Exponential backoff for API calls
   - Activity-level retry configuration
   - Circuit breaker for failing services
3. Add error recovery:
   - Checkpoint progress before failures
   - Resume from last successful point
   - Partial success handling
4. Create error reporting:
   - Structured error logs
   - Error metrics and alerts
   - Error summary reports
5. Add dead letter queue for unrecoverable errors

Technical approach:
- Use Effect's error handling primitives
- Implement custom error types
- Add retry policies per activity type
- Create error reporting infrastructure

Files to create:
- `backend/workers/errors/errorTypes.ts`
- `backend/workers/errors/retryPolicies.ts`
- `backend/workers/errors/errorReporting.ts`

Files to modify:
- All workflow and activity files to use proper error handling

Acceptance criteria:
- Errors are properly classified and handled
- Appropriate retry strategies applied
- Workflow can recover from failures
- Comprehensive error reporting
- Dead letter queue for unrecoverable errors
```

### Task 6.2: Performance Optimization
**Complexity**: High | **Priority**: Medium | **Estimated Time**: 6-8 hours

**AI Prompt:**
```
I need to optimize the workflow system for performance at scale (1000+ organizations, millions of records).

Current state:
- Sequential processing of entities
- No parallelization
- No performance monitoring
- No optimization based on data patterns

Requirements:
1. Add parallelization:
   - Parallel entity syncs where dependencies allow
   - Concurrent page processing within entities
   - Configurable concurrency limits
2. Implement data streaming optimizations:
   - Efficient pagination strategies
   - Batch processing for database operations
   - Connection pooling and reuse
3. Add performance monitoring:
   - Records per second metrics
   - API response time tracking
   - Database operation timing
   - Memory usage monitoring
4. Create adaptive optimization:
   - Dynamic concurrency adjustment
   - Rate limit detection and backoff
   - Smart batching based on data patterns
5. Add performance testing and benchmarks

Technical approach:
- Use Effect's concurrency primitives
- Implement adaptive algorithms
- Add comprehensive performance metrics
- Create benchmark test suite

Files to create:
- `backend/workers/performance/optimization.ts`
- `backend/workers/performance/benchmarks.ts`
- `backend/workers/performance/monitoring.ts`

Files to modify:
- Workflow files to add parallelization
- Activity files to add performance monitoring

Acceptance criteria:
- Significant performance improvement over sequential processing
- Adaptive optimization based on runtime conditions
- Comprehensive performance monitoring
- Benchmark test suite showing improvements
- Handles scale requirements (1000+ orgs)
```

---

## Quick Reference

### AI Prompt Template
When working on any task, use this template for context:

```
**Context:**
- Working on OpenFaith sync engine
- Using Effect-TS with workflows and activities
- PCO (Planning Center Online) as data source
- Entity manifest system for dynamic configuration
- Current code in `backend/workers/` directory

**Current State:**
[Brief description of what exists]

**Goal:**
[What we're trying to achieve]

**Requirements:**
[Specific requirements]

**Technical Approach:**
[Suggested implementation approach]

**Files to Create/Modify:**
[List of files]

**Acceptance Criteria:**
[How to know the task is complete]
```

### Task Dependencies
- Phase 1 tasks can be done in any order
- Phase 2 depends on Task 1.2 (entity analysis)
- Phase 3 can be done in parallel with Phase 2
- Phase 4 depends on Task 3.1 (activities)
- Phase 5 depends on completed Phase 3
- Phase 6 can be done in parallel with Phase 5

### Priority Guide
- **High Priority**: Core functionality needed for basic operation
- **Medium Priority**: Important features for production readiness
- **Low Priority**: Nice-to-have features for optimization

Each task is designed to be self-contained and can be handed to an AI assistant with the full context needed for implementation.
