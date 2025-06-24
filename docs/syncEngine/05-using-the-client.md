# 05: Using the API Adapter (Current Implementation)

**⚠️ Note: This document describes the current implementation using HttpApiClient. The planned streaming interfaces and convenience methods are not yet implemented.**

Once the API adapter has been configured and the HttpApiClient has been created, you can use it to interact with the third-party API. The client is built on top of **Effect's HttpApiClient**, providing a type-safe interface.

This guide assumes you have a configured client instance available in your Effect context.

## 1. Current Implementation: HttpApiClient Effects

The current implementation provides HttpApiClient-based methods that return Effects. All operations must be run within an Effect context with the proper services available.

### Example: Setting Up the Client Context

First, you need to set up the Effect context with the required services:

```typescript
import { Effect, Layer } from 'effect'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'
import { TokenManagerLive } from '@openfaith/adapter-core/api/tokenManager'
import { PcoAuthLive } from '@openfaith/pco/api/pcoAuthLayer'

// The live services layer
const ServicesLive = Layer.mergeAll(
  TokenManagerLive,
  PcoAuthLive,
  // ... other required services
)

// Your application effect
const program = Effect.gen(function* () {
  const pcoClient = yield* PcoHttpClient
  
  // Now you can use the client
  const peopleResponse = yield* pcoClient.people.getAll({
    // Query parameters go here
  })
  
  return peopleResponse
})

// Run the program with services
Effect.runPromise(program.pipe(Effect.provide(ServicesLive)))
```

### Example: Fetching a Collection

```typescript
import { Effect } from 'effect'
import { PcoHttpClient } from '@openfaith/pco/api/pcoApi'

const fetchPeople = Effect.gen(function* () {
  const client = yield* PcoHttpClient
  
  // Fetch all people with includes
  const response = yield* client.people.getAll({
    // Query parameters can be added here if the endpoint supports them
    // Currently, query parameter support is limited in the implementation
  })
  
  // The response follows PCO's JSON:API structure
  console.log(`Found ${response.data.length} people`)
  console.log(`Total count: ${response.meta.total_count}`)
  
  // Access individual person data
  for (const person of response.data) {
    console.log(`Person: ${person.attributes.first_name} ${person.attributes.last_name}`)
  }
  
  return response
})
```

### Example: Fetching a Single Resource

```typescript
const fetchPersonById = (personId: string) => Effect.gen(function* () {
  const client = yield* PcoHttpClient
  
  // Fetch a specific person
  const response = yield* client.people.getById({
    path: { personId }
  })
  
  // Single resource response structure
  const person = response.data
  console.log(`Fetched: ${person.attributes.first_name} ${person.attributes.last_name}`)
  
  // Access included relationships if requested
  if (response.included) {
    console.log(`Included ${response.included.length} related resources`)
  }
  
  return response
})
```

### Example: Error Handling

```typescript
const safeFetchPerson = (personId: string) => Effect.gen(function* () {
  const client = yield* PcoHttpClient
  
  const result = yield* client.people.getById({ path: { personId } }).pipe(
    Effect.catchTag('HttpBodyError', (error) => {
      console.error('Failed to parse response:', error)
      return Effect.fail('ParseError')
    }),
    Effect.catchTag('RequestError', (error) => {
      console.error('HTTP request failed:', error)
      return Effect.fail('NetworkError')
    }),
    Effect.catchAll((error) => {
      console.error('Unknown error:', error)
      return Effect.fail('UnknownError')
    })
  )
  
  return result
})
```

## 2. Current Limitations

The current implementation has several limitations compared to the planned design:

### ❌ **No Streaming Interfaces**
```typescript
// This does NOT work yet:
// const pageStream = pcoClient.people.streamPages({ ... })
// const allPeople = pcoClient.people.streamAll({ ... })
```

### ❌ **No .run() Helper Methods**
```typescript
// This does NOT work yet:
// const person = await pcoClient.people.getById.run({ path: { personId: '123' } })
```

### ❌ **Limited Query Parameter Support**
The current endpoint definitions include query metadata, but the HttpApiClient setup doesn't fully utilize them yet.

### ❌ **No Built-in Pagination Handling**
You need to manually handle pagination by checking the `links.next` property and making additional requests.

### Example: Manual Pagination (Current Workaround)

```typescript
const fetchAllPeoplePaginated = Effect.gen(function* () {
  const client = yield* PcoHttpClient
  const allPeople: any[] = []
  
  let response = yield* client.people.getAll({})
  allPeople.push(...response.data)
  
  // Manual pagination loop
  while (response.links.next) {
    // You would need to construct the next request manually
    // This is cumbersome with the current implementation
    console.log('Next page available, but manual implementation needed')
    break
  }
  
  return allPeople
})
```

## 3. Token Management (Current Implementation)

The current implementation handles authentication through the `TokenManager` service:

```typescript
import { TokenManager } from '@openfaith/adapter-core/api/tokenManager'

const checkTokenStatus = Effect.gen(function* () {
  const tokenManager = yield* TokenManager
  
  // Load token for a specific organization
  const tokenState = yield* tokenManager.loadTokenState('org-123')
  
  console.log(`Token expires at: ${new Date(tokenState.createdAt.getTime() + tokenState.expiresIn * 1000)}`)
  
  return tokenState
})
```

## 4. Planned vs. Current Implementation

### What Works Today:
- ✅ Type-safe HTTP client using Effect's HttpApiClient
- ✅ Automatic authentication via TokenManager
- ✅ JSON:API response parsing
- ✅ Basic CRUD operations (GET, POST, PATCH, DELETE)
- ✅ Database-backed token persistence and refresh

### What's Coming (Planned):
- 🚧 **Streaming Interfaces**: `streamPages()`, `streamAll()` for efficient pagination
- 🚧 **Promise-based `.run()` Methods**: For easier integration with non-Effect codebases
- 🚧 **Advanced Query Support**: Full utilization of query metadata from endpoint definitions
- 🚧 **Automatic Pagination**: Built-in handling of paginated responses
- 🚧 **Rate Limiting**: Distributed rate limit management
- 🚧 **Comprehensive Error Mapping**: API-specific error handling with retry strategies

### Migration Path:
The current Effect-based approach provides a solid foundation. When the planned features are implemented, they will be built on top of the existing HttpApiClient infrastructure, ensuring backward compatibility while adding the convenience methods and streaming capabilities described in the original vision.

## 5. Integration with Sync Engine (Future)

Once the Sync Engine is implemented, it will consume this API adapter to perform durable, long-running sync operations. The sync engine will:

- Use the streaming interfaces for efficient data processing
- Leverage the error handling for retry logic
- Utilize the pagination support for processing large datasets
- Integrate with the token management for authentication

The current implementation provides the foundation needed for these future capabilities.