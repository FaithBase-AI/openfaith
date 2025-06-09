# 03: API Client Configuration

The API Client library is designed around a clear, two-step process:

1.  **Define:** You first declare the "shape" of your API by creating a series of static endpoint definitions. These are simple, serializable JavaScript objects.
2.  **Configure & Create:** You then provide runtime configuration (like API tokens and error handling logic) along with your definitions to the `createApi` function, which produces a live, executable client.

This architecture separates the *what* (what endpoints exist) from the *how* (how to authenticate, handle errors, and manage rate limits).

---

## Part 1: Defining Your API Endpoints

Before creating a client, you must describe the API surface you want to support. This is done by creating an `EndpointDefinition` for each API endpoint. We use a helper function, `defineEndpoint`, to ensure these definitions are type-safe.

These definitions should live in their own files, separate from any runtime code (e.g., in `src/pco/endpoints/people.ts`).

### The `defineEndpoint` Helper

This is a standalone utility that you import from the library. It takes a single configuration object.

```typescript
import { defineEndpoint } from '@your-org/api-client';
import { PCOPerson, BasePerson } from '../schemas'; // Your pre-defined schemas

export const getPersonById = defineEndpoint({
  /** A unique, dot-notation name. This determines the path on the final client object. */
  name: 'people.getById',
  
  /** The HTTP method for the endpoint. */
  method: 'GET',
  
  /** The URL path, with placeholders like :entityId for path parameters. */
  path: '/people/v2/people/:personId',
  
  /** The schema for the raw API response. */
  apiSchema: PCOPerson,
  
  /** The schema for the final, canonical data model. */
  canonicalSchema: BasePerson,
  
  // --- Endpoint Capabilities ---
  // These fields provide metadata for the sync engine and other consumers.
  
  /** A list of valid values for the 'include' query parameter. */
  includes: ['addresses', 'emails', 'households'],

  /** Does this entity's lifecycle emit webhook events? */
  supportsWebhooks: true,
  
  /** The attribute name used for delta-syncing (e.g., 'updated_at'). */
  deltaSyncField: 'updated_at'
});
```
You would create one such definition for every endpoint you intend to use (`getAllPeople`, `createPerson`, etc.) and export them.

*(For a full guide on all available options in `defineEndpoint`, see `04-defining-endpoints.md`.)*

---

## Part 2: Creating the Executable Client

Once your endpoints are defined, you can create a live client. The `createApi` function is the factory that brings your static definitions to life by combining them with your runtime configuration.

```typescript
import { createApi } from '@your-org/api-client';
import * as pcoEndpoints from './pco-endpoints'; // A file that exports all your definitions
import { pcoRuntimeConfig } from './pco-runtime-config'; // The runtime config defined below

// createApi consumes the definitions and the runtime config.
const pcoClient = createApi({
  runtimeConfig: pcoRuntimeConfig,
  endpoints: Object.values(pcoEndpoints) // Pass all your defined endpoints
});

// The returned client is a deeply nested object based on the 'name' property.
// `pcoClient.people.getById` is now an executable function.
const person = await pcoClient.people.getById.run({ path: { personId: '123' } });
```

### The `RuntimeConfig` Object

This object contains all the information that is required to actually *run* requests. It is not specific to any single endpoint.

#### A. Authentication & Rate Limiting (`auth`)

This section controls how the client authenticates and manages rate limits.

```typescript
interface RuntimeConfig {
  auth: {
    tokens: string[];
    rateLimit: { limit: number; duration: Duration.DurationInput; };
    applyAuth: (token: string) => (request: HttpClientRequest) => HttpClientRequest;
    keyValueStore?: SimpleKeyValueStore;
  };
  // ...
}
```

*   **`tokens`**: An array of API tokens. The client will use these to distribute load and achieve a higher overall rate limit.
*   **`rateLimit`**: The limit that applies to a *single token*.
*   **`applyAuth`**: A function specifying how to add a token to a request (e.g., as a Bearer token).
*   **`keyValueStore`**: An **optional** provider for a distributed key-value store (like Redis). If provided, rate limiting will be coordinated across all your servers. If omitted, an in-memory store is used, suitable for single-server deployments.

#### B. Error Handling (`errorMap`)

This section declaratively maps API error responses to the library's canonical, typed errors.

```typescript
interface RuntimeConfig {
  errorMap: {
    [statusCode: number]: ErrorDefinition<any>;
    'default': ErrorDefinition<any>;
  };
  // ...
}

interface ErrorDefinition<T> {
  tag: string;
  schema: Schema.Schema<T>;
  retryStrategy: 'none' | 'backoff' | 'refresh_auth';
}
```

*   **`tag`**: A unique string identifier for the error (e.g., `'ValidationError'`).
*   **`schema`**: An `effect/Schema` describing the error response body for structured error details.
*   **`retryStrategy`**: Defines the behavior: `'none'` for permanent failures, `'backoff'` for transient server issues, and `'refresh_auth'` for expired tokens.

#### C. Pagination & Data Extraction (`paginationHelpers`)

These functions tell the client how to interpret the specific structure of the API's paginated responses.

```typescript
interface RuntimeConfig {
  paginationHelpers: {
    getPaginationData: (response: HttpClientResponse) => /* ... */;
    getResponseData: (response: HttpClientResponse) => /* ... */;
  };
  // ...
}
```

By separating the static `EndpointDefinition` from the dynamic `RuntimeConfig`, you create a clean, maintainable, and highly testable system for integrating with any API.