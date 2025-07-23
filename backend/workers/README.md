# OpenFaith Workers

This package contains the Effect Cluster workflow runner for OpenFaith, implementing durable workflows for data synchronization and background processing.

## Architecture

The workers package implements a **continuous workflow runner** pattern using Effect Cluster with a modular HTTP API:

- **`runner.ts`** - Main workflow engine with HTTP API server
- **`api/workflowApi.ts`** - HTTP API definition using WorkflowProxy
- **`api/workflowClient.ts`** - Client service for calling workflows from other services
- **`workflows/`** - Individual workflow definitions
- **`index.ts`** - Package exports

## Key Features

- **Durable Workflows**: Uses `@effect/workflow` for reliable, resumable workflows
- **HTTP API**: Exposes workflows via WorkflowProxy HTTP endpoints
- **Modular Architecture**: Separate API definition and client services
- **Cluster Support**: Built on `@effect/cluster` for distributed processing
- **PostgreSQL Integration**: Uses existing database for cluster coordination
- **Observability**: Integrated with OpenTelemetry for monitoring

## Development Workflow

### 1. Start Infrastructure

```bash
# From project root - starts database and observability
bun run infra
```

### 2. Start Shard Manager

```bash
# From project root - starts cluster shard manager
cd backend/shard-manager && bun run dev
```

### 3. Start Workflow Runner

```bash
# From project root - starts workflow engine with HTTP API
cd backend/workers && bun run dev
```

The workflow runner will:

- Start the Effect Cluster workflow engine
- Launch HTTP API server on `http://localhost:3001`
- Register all workflows with the cluster
- Handle workflow execution requests

## Triggering Workflows

### Via HTTP API

Workflows can be triggered directly via HTTP API calls:

```bash
# Trigger PCO sync workflow
curl -X POST http://localhost:3001/workflows/PcoSyncWorkflow \
  -H "Content-Type: application/json" \
  -d '{"payload": {"tokenKey": "your-token-key"}}'
```

### Via WorkflowClient Service

Other services can use the `WorkflowClient` service to trigger workflows:

```typescript
// In your service code
const program = Effect.gen(function* () {
  const workflowClient = yield* WorkflowClient;

  // Trigger PCO sync workflow
  const result = yield* workflowClient.workflows.PcoSyncWorkflow({
    payload: { tokenKey: "your-token-key" },
  });

  return result;
}).pipe(
  Effect.provide(WorkflowClient.Default),
  Effect.provide(FetchHttpClient.layer)
);
```

## Available Workflows

### PcoSyncWorkflow

- **Purpose**: Synchronizes data from Planning Center Online
- **Payload**: `{ tokenKey: string }`
- **HTTP Endpoint**: `POST /workflows/PcoSyncWorkflow`
- **Client Method**: `workflowClient.workflows.PcoSyncWorkflow({ payload: { tokenKey } })`

## API Integration

The main API triggers workflows using the `WorkflowClient` service:

```typescript
// In coreRouter.ts
const program = Effect.gen(function* () {
  const workflowClient = yield* WorkflowClient;

  const result = yield* workflowClient.workflows.PcoSyncWorkflow({
    payload: { tokenKey: "your-token-key" },
  });

  return result;
}).pipe(
  Effect.provide(WorkflowClient.Default),
  Effect.provide(FetchHttpClient.layer)
);
```

## Modular Architecture

### WorkflowApi Definition

```typescript
// api/workflowApi.ts
export class WorkflowApi extends HttpApi.make("workflow-api").add(
  WorkflowProxy.toHttpApiGroup("workflows", workflows)
) {}
```

### WorkflowClient Service

```typescript
// api/workflowClient.ts
export class WorkflowClient extends Effect.Service<WorkflowClient>()(
  "WorkflowClient",
  {
    dependencies: [FetchHttpClient.layer],
    effect: HttpApiClient.make(WorkflowApi, {
      baseUrl: "http://localhost:3001",
    }),
  }
) {}
```

### Runner Implementation

```typescript
// runner.ts
const WorkflowApiLive = HttpApiBuilder.api(WorkflowApi).pipe(
  Layer.provide(
    WorkflowProxyServer.layerHttpApi(WorkflowApi, "workflows", workflows)
  ),
  Layer.provide(WorkflowEngineLive),
  Layer.provide(RunnerLive)
);

const apiProgram = HttpApiBuilder.serve().pipe(
  Layer.provide(WorkflowApiLive),
  HttpServer.withLogAddress,
  Layer.provide(HttpServerLive),
  Layer.launch
);
```

## Troubleshooting

### Socket Errors

```
Error: Failed to listen at localhost
errno: 48, code: "EADDRINUSE"
```

**Solution**: Make sure the shard manager is running first. The workflow runner needs the shard manager to coordinate cluster operations.

### Port Conflicts

- Workflow HTTP API: `3001`
- Shard Manager: Dynamic port assignment
- Database: `5430`

### Database Connection Issues

- Ensure PostgreSQL is running: `bun run infra`
- Check database credentials in shared environment
- Verify cluster tables are created (automatic on first run)

### WorkflowClient Connection Issues

- Verify workflow runner is running on `http://localhost:3001`
- Check that `WorkflowClient.Default` and `FetchHttpClient.layer` are provided
- Ensure the WorkflowApi is properly exposed in the runner

## Environment Variables

Uses shared environment from `@openfaith/shared`:

- `DB_HOST_PRIMARY` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

## Monitoring

- **Logs**: Structured logging with workflow execution details
- **Tracing**: OpenTelemetry traces for workflow activities
- **Metrics**: Effect Cluster metrics for performance monitoring
- **HTTP API Logs**: Request/response logging for workflow triggers

## Production Deployment

For production:

1. Set `NODE_ENV=production` for JSON logging
2. Configure proper database connection strings
3. Set up load balancing for HTTP API endpoints
4. Monitor shard manager health
5. Scale runners horizontally as needed
6. Configure WorkflowClient base URLs for different environments
