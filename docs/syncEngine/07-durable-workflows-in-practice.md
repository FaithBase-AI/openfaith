# 07: Durable Workflows in Practice

In our Sync Engine, every synchronization task is modeled as a **durable workflow**. This isn't just an implementation detail; it's the core of how we achieve resilience and observability. This document explains the key patterns we use to build these workflows with `@effect/workflow`.

## 1. Anatomy of a Sync Workflow

At its heart, a workflow is a durable, resumable function. We define it with a clear interface and then provide its implementation.

### A. The Definition (`Workflow.make`)

Every workflow starts with a definition that specifies its unique name, the data it requires (its payload), and its idempotency key.

```typescript
import { Workflow, Schema } from '@effect/workflow';
import { pcoClient } from '@your-org/pco-client';

// The payload the workflow needs to start.
const SyncEntityPayload = Schema.Struct({
  orgId: Schema.String,
  // Use the API client's parameter types for consistency.
  clientParams: pcoClient.people.streamPages.Params,
});

// The workflow definition.
const SyncEntityWorkflow = Workflow.make({
  /** A globally unique name for this type of workflow. */
  name: "SyncEntityWorkflow",
  
  /** The schema for the payload. */
  payload: SyncEntityPayload,

  /**
   * The idempotency key. The cluster uses this to prevent duplicate
   * workflow executions. If a workflow with this key is already running
   * or has completed, a new one will not be started.
   */
  idempotencyKey: (payload) => `sync-entity:${payload.orgId}:${payload.entityName}`
});
```
The `idempotencyKey` is critical. It ensures that if we accidentally try to schedule the same sync job twice, only one will actually run.

### B. The Implementation (`.toLayer`)

The implementation contains the business logic. It's an `Effect` that uses special, durable primitives provided by `@effect/workflow`.

```typescript
const SyncEntityWorkflowLayer = SyncEntityWorkflow.toLayer(
  // The implementation is an Effect function that receives the payload.
  Effect.fn(function* (payload) {
    // 1. Get the API client (this might be an activity itself).
    const client = yield* getClientForOrg(payload.orgId);
    
    // 2. Get the stream of data pages from the client.
    const pageStream = client.people.streamPages(payload.clientParams);
    
    // 3. Process each page within a durable Activity.
    yield* Stream.run(pageStream, Sink.forEach(processPageActivity));
    
    // 4. Log completion.
    yield* Effect.log("Sync completed successfully.");
  })
);
```

## 2. The Activity: The Unit of Durable Work

A workflow is composed of **Activities**. An `Activity` is a wrapper around a piece of work that guarantees it will be executed **at-most-once**, even if the workflow restarts. This is our fundamental building block for durability.

We create a new, uniquely named `Activity` for each page of data we process.

```typescript
function processPageActivity(page: PaginatedResponse<Person>) {
  return Activity.make({
    // The name MUST be unique for this specific unit of work.
    // This prevents re-processing the same page after a restart.
    name: `ProcessPersonPage-org:${page.orgId}-offset:${page.offset}`,
    
    // The schema for the activity's result (can be Schema.Void)
    success: Schema.Void,
    
    // The actual work to be done.
    execute: Effect.gen(function* () {
      // 1. Transform data from API model to our DB model.
      const dbPeople = yield* transformPeople(page.items);
      
      // 2. Save the batch to our database.
      yield* db.insertPeople(dbPeople);
      
      // 3. Update the 'last processed' state in a KV store.
      yield* kvStore.set('sync-progress:person', page.offset);
    })
  }).pipe(
    // We can add retry logic specific to this activity.
    Activity.retry({
      schedule: Schedule.exponential("1 second").pipe(Schedule.upTo("5 minutes"))
    })
  );
}
```
By wrapping the page processing in an `Activity`, we create a durable checkpoint. The workflow engine records the completion of `ProcessPersonPage-org:abc-offset:100` before moving on. If the system crashes, it knows not to re-run this activity on restart.

## 3. The Fan-Out Pattern: For Dependent Syncs

A common requirement is to sync a parent entity and then sync all of its children. For example, sync a `Group`, and then sync all `Event`s for that group. We achieve this by having one workflow spawn other workflows.

This is the "fan-out" pattern. It's highly scalable because the cluster can distribute the child workflows across all available nodes.

```typescript
// Inside a 'SyncAllGroups' workflow...
const groupStream = client.groups.streamAll({ /* ... */ });

yield* Stream.runForEach(groupStream, (group) =>
  // For each group, we execute a *different* workflow.
  SyncEventsForGroupWorkflow.execute({
    orgId: group.orgId,
    groupId: group.id,
    
    // The idempotency key is critical to prevent duplicate child syncs.
    idempotencyKey: `sync-events-for-group:${group.id}`
  }).pipe(
    // We use forkDaemon so the parent workflow doesn't wait for all
    // child workflows to complete. It just schedules them and moves on.
    Effect.forkDaemon
  )
);
```

This pattern allows a single "master" sync job to safely and durably schedule tens of thousands of dependent jobs, creating a resilient and massively parallel system.