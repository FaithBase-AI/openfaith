# 03: API Adapter Configuration (Current Implementation)

**⚠️ Note: This document describes the current implementation. The original design with `createApi` and `RuntimeConfig` is planned for the future.**

The API Adapter library is currently designed around a simpler, direct approach using Effect's HttpApiClient:

1.  **Define:** You create endpoint definitions using the `pcoApiAdapter()` helper function.
2.  **Create API Groups:** You organize endpoints into HttpApiGroup objects.
3.  **Build HttpApi:** You combine groups into a complete HttpApi definition.
4.  **Create Client:** You use HttpApiClient with authentication and other services.

This architecture separates the *what* (what endpoints exist) from the *how* (how to authenticate and make requests).

---

## Part 1: Defining Your API Endpoints (Current)

Before creating a client, you must describe the API surface you want to support. This is done by creating endpoint definitions using the `pcoApiAdapter()` helper function.

These definitions should live in their own files, separate from any runtime code (e.g., in `adapters/pco/modules/people/pcoPeopleEndpoints.ts`).

### The `pcoApiAdapter` Helper

This is the current utility function that you import from the PCO adapter library. It takes a single configuration object and automatically generates the appropriate response schemas for PCO's JSON:API format.

```typescript
import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPerson } from '@openfaith/pco/modules/people/pcoPersonSchema'

export const getAllPeopleDefinition = pcoApiAdapter({
  /** The API schema for the raw PCO resource */
  apiSchema: PcoPerson,
  
  /** The entity name */
  entity: 'Person',
  
  /** The HTTP method for the endpoint */
  method: 'GET',
  
  /** The API module this endpoint belongs to */
  module: 'people',
  
  /** The endpoint operation name */
  name: 'getAll',
  
  /** The URL path for the endpoint */
  path: '/people/v2/people',
  
  /** Whether this endpoint returns a collection */
  isCollection: true,
  
  /** Available relationships that can be included */
  includes: [
    'addresses',
    'emails',
    'primary_campus',
    'field_data',
    'households',
    // ... more includes
  ],
  
  /** Fields that can be used for ordering responses */
  orderableBy: [
    'accounting_administrator',
    'anniversary',
    'birthdate',
    'created_at',
    'first_name',
    // ... more orderable fields
  ],
  
  /** Query configuration */
  queryableBy: {
    /** Fields that can be queried with where clauses */
    fields: [
      'accounting_administrator',
      'anniversary',
      'birthdate',
      'created_at',
      // ... more queryable fields
    ],
    /** Special query parameters */
    special: [
      'id',
      'date_time',
      'mfa_configured',
      'primary_campus_id',
      'search_name',
      // ... more special params
    ],
  },
} as const)
```

You would create one such definition for every endpoint you intend to use (`getPersonById`, `createPerson`, etc.) and export them.

---

## Part 2: Creating HttpApi Groups and Client (Current)

Once your endpoints are defined, you create HttpApi groups and then build a client. This is currently done in the adapter's API definition file.

```typescript
// adapters/pco/api/pcoApi.ts
import { HttpApi, HttpApiGroup } from '@effect/platform'
import { toHttpApiEndpoint } from '@openfaith/adapter-core/server'
import { getAllPeopleDefinition } from '@openfaith/pco/modules/people/pcoPeopleEndpoints'

// Create API groups by converting endpoint definitions
const peopleApiGroup = HttpApiGroup.make('people')
  .add(toHttpApiEndpoint(getAllPeopleDefinition))
  // Add more endpoints as needed

// Combine groups into a complete API
export const PcoApi = HttpApi.make('PCO')
  .add(peopleApiGroup)
  .add(tokenApiGroup) // OAuth token endpoints
```

### Creating the Executable Client

The client is created using Effect's HttpApiClient with authentication and other services:

```typescript
// Current implementation in adapters/pco/api/pcoApi.ts
export class PcoHttpClient extends Effect.Service<PcoHttpClient>()('PcoHttpClient', {
  effect: Effect.gen(function* () {
    const tokenService = yield* PcoAuth

    const client = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequestEffect(
        Effect.fn(function* (request) {
          const token = yield* tokenService.getValidAccessToken
          return HttpClientRequest.bearerToken(request, token)
        }),
      ),
    )
    
    return yield* HttpApiClient.makeWith(PcoApi, {
      baseUrl: 'https://api.planningcenteronline.com',
      httpClient: client,
    })
  }),
}) {}
```

### The `TokenManager` Service (Current Implementation)

Authentication is handled by the `TokenManager` service, which provides database-backed token storage and refresh:

```typescript
// Current implementation in adapters/adapter-core/api/tokenManager.ts
export interface TokenState {
  readonly accessToken: string
  readonly refreshToken: string
  readonly createdAt: Date
  readonly expiresIn: number
  readonly tokenKey: string
  readonly adapter: string
  readonly orgId: string
  readonly userId: string
}

export class TokenManager extends Context.Tag('OpenFaith/TokenManager')<
  TokenManager,
  {
    readonly loadTokenState: (lookupKey: string) => Effect.Effect<TokenState, unknown>
    readonly saveTokenState: (state: TokenState) => Effect.Effect<void, unknown>
  }
>() {}
```

The `TokenManagerLive` implementation provides:
- Database persistence using Drizzle ORM
- Token loading by organization ID
- Token refresh and update logic

## Part 3: Current vs. Planned Architecture

### What Works Today:
- ✅ Endpoint definitions with `pcoApiAdapter()`
- ✅ HttpApi group creation with `toHttpApiEndpoint()`
- ✅ Database-backed token management
- ✅ Basic HTTP client with authentication
- ✅ Type-safe schema validation

### What's Planned (Future):
- 🚧 **`createApi` Factory Function**: A higher-level API that simplifies client creation
- 🚧 **RuntimeConfig Object**: Centralized configuration for auth, rate limiting, error handling
- 🚧 **Rate Limiting**: Distributed rate limit management with Redis/KV store
- 🚧 **Advanced Error Handling**: Mapping API errors to canonical, typed errors with retry strategies
- 🚧 **Streaming Interfaces**: `streamPages`, `streamAll` methods for efficient data fetching
- 🚧 **Pagination Helpers**: Generic helpers for extracting pagination data from responses

### Migration Path:
The current implementation provides a solid foundation that can be incrementally enhanced. The `pcoApiAdapter()` definitions can be consumed by the future `createApi` factory, and the current HttpApiClient approach can be wrapped with the planned higher-level abstractions while maintaining backward compatibility.