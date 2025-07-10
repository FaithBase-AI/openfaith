# Domain Package

This package contains the domain definitions for OpenFaith, including both RPC and HTTP API definitions.

## Structure

- `Rpc.ts` - Effect RPC definitions for internal service communication
- `Http.ts` - HTTP API definitions for external integrations (like Zero's custom mutators)
- `core/` - Core domain schemas and types
- `index.ts` - Main exports

## HTTP API for Zero Custom Mutators

The HTTP API is designed to handle Zero's custom mutator push protocol. This allows Zero clients to send mutations to be processed on the server.

### API Definition

```typescript
import { ZeroMutatorsApi, PushRequest, PushResponse } from "@openfaith/domain";
```

The API includes:

- **POST /push** - Endpoint for processing custom mutators
  - Request: `PushRequest` with mutations array
  - Response: `PushResponse` with patch operations
  - Errors: `MutatorError` (400), `ValidationError` (422)

### Request Schema

```typescript
{
  mutations: Array<{
    id: string,
    name: string,
    args: unknown,
    timestamp: number
  }>,
  pushVersion: number,
  schemaVersion: string
}
```

### Response Schema

```typescript
{
  patchOps: Array<unknown>,
  lastMutationId?: string,
  error?: string
}
```

### Usage in Server

```typescript
import { HttpApiBuilder } from "@effect/platform";
import { ZeroMutatorsApi } from "@openfaith/domain";

// Create handler
const handler = HttpApiBuilder.group(
  ZeroMutatorsApi,
  "zero-mutators",
  (handlers) =>
    handlers.handle("push", ({ payload }) => {
      // Process mutations
      return Effect.succeed({
        patchOps: [],
        lastMutationId: payload.mutations[0]?.id,
      });
    })
);

// Create API layer
const apiLayer = HttpApiBuilder.api(ZeroMutatorsApi).pipe(
  Layer.provide(handler)
);
```

## RPC API

The RPC API uses Effect RPC for type-safe internal service communication.

### Core RPC

- `testFunction` - Simple test endpoint

### Adapter RPC

- `connect` - Connect to external adapters (PCO, CCB, etc.)

### Usage

```typescript
import { CoreRpc, AdapterRpc } from "@openfaith/domain";

// Implement handlers
const coreHandler = CoreRpc.toLayer({
  testFunction: () => Effect.void,
});

const adapterHandler = AdapterRpc.toLayer({
  connect: ({ adapter, code, redirectUri }) => Effect.succeed("success"),
});
```
