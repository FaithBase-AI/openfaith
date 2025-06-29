# OpenFaith Workflow Engine

This package contains the workflow engine for OpenFaith, built using Effect's workflow system. The workflow engine handles durable, long-running processes like syncing data from Church Management Systems (ChMS) like Planning Center Online (PCO).

## Features

- **Durable Workflows**: Workflows can pause and resume, surviving system restarts
- **Retry Logic**: Automatic retry with exponential backoff for failed operations
- **Compensation**: Automatic cleanup and rollback on failures
- **Observability**: Built-in tracing and logging with OpenTelemetry
- **Cluster Support**: Distributed execution across multiple nodes

## Architecture

The workflow engine is built on top of:
- `@effect/workflow` - Core workflow engine
- `@effect/cluster` - Distributed execution
- `@effect/sql-pg` - PostgreSQL storage backend
- `@effect/opentelemetry` - Observability

## Current Workflows

### PCO Sync Workflow

Syncs data from Planning Center Online into the OpenFaith database.

**Payload:**
```typescript
{
  tokenKey: string   // The organization's PCO token (also serves as the orgId)
}
```

**Activities:**
- `SyncPcoData` - Fetches and processes PCO data using paginated streams

## Usage

### Basic Execution

```typescript
import { runPcoSync } from './runner.js'

// Execute a PCO sync for a specific organization
const result = await runPcoSync("org_01jww7zkeyfzvsxd20nfjzc21z")
```

### Integration with API

The workflow can be triggered from the API:

```typescript
// POST /api/trpc/core.triggerPcoSync
{
  "tokenKey": "org_01jww7zkeyfzvsxd20nfjzc21z"
}
```

## Configuration

### Database

The workflow engine uses the shared `PgLive` layer from `@openfaith/db` for storing workflow state. This automatically uses your existing database configuration from environment variables:

- `DB_NAME` - Database name
- `DB_HOST_PRIMARY` - Database host
- `DB_USERNAME` - Database username  
- `DB_PASSWORD` - Database password
- `DB_PORT` - Database port

No additional database configuration is needed in the workflow engine.

### Observability

Traces are exported to an OTLP endpoint (default: localhost:4318). Configure the exporter as needed:

```typescript
const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'openfaith-workflow-engine' },
  spanProcessor: [
    new BatchSpanProcessor(new OTLPTraceExporter({
      url: 'http://your-otlp-endpoint:4318/v1/traces'
    })),
  ],
}))
```

## Development

### Running Locally

1. Ensure PostgreSQL is running
2. Update database configuration in `index.ts`
3. Run the workflow:

```bash
cd backend/workers
npm run typecheck  # Verify types
node runner.js     # Execute workflow
```

### Adding New Workflows

1. Define your workflow schema:
```typescript
const MyWorkflow = Workflow.make({
  name: "MyWorkflow",
  payload: Schema.Struct({
    // Define your payload schema
  }),
  idempotencyKey: (payload) => `my-workflow-${payload.id}`
})
```

2. Implement the workflow:
```typescript
const MyWorkflowLayer = MyWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    // Implement your workflow logic
    yield* Activity.make({
      name: "MyActivity",
      execute: Effect.gen(function* () {
        // Activity implementation
      })
    })
  })
)
```

3. Add to the environment layer:
```typescript
const EnvLayer = Layer.mergeAll(
  PcoSyncWorkflowLayer,
  MyWorkflowLayer  // Add your workflow layer
).pipe(Layer.provide(WorkflowEngineLayer))
```

## Next Steps

This is a basic stub of the workflow engine. Future enhancements could include:

1. **Scheduling**: Cron-based workflow scheduling
2. **Monitoring**: Workflow execution dashboards  
3. **Error Handling**: Better error recovery strategies
4. **Data Transformation**: Built-in transformers for different ChMS formats
5. **Conflict Resolution**: Handling data conflicts during sync
6. **Performance**: Optimizations for large datasets

## Dependencies

Make sure to install all required dependencies:

```bash
npm install @effect/cluster @effect/workflow @effect/sql-pg @effect/opentelemetry
```

See `package.json` for the complete list of dependencies. 