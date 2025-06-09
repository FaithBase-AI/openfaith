# 05: Using the API Client

Once the client has been configured and created with `createApi`, you can use it to interact with the third-party API. The client is designed to be **Effect-native first**, providing a powerful and composable interface out of the box.

For convenience, every method also includes a `.run()` helper to easily execute the operation and get a `Promise` back, making it accessible to any JavaScript/TypeScript application.

This guide assumes you have a configured client instance:
```typescript
import { pcoClient } from './your-client-setup'; // Your configured client instance
```

## 1. The Default Path: Composable Effects

By default, calling an endpoint method returns a high-level `Effect`. This `Effect` describes the entire operation—including authentication, rate limiting, retries, and error parsing—but does not execute it. This allows you to compose it with other Effects before running the final, combined program.

### Example: Fetching a Single Record

Calling `pcoClient.people.getById(...)` returns an `Effect` that, when run, will fetch the person.

```typescript
import { Effect } from 'effect';

function getAndEnrichPerson(personId: string) {
  // Calling the method directly returns the raw Effect.
  const getPersonEffect = pcoClient.people.getById({
    path: { personId },
    query: { include: ['addresses'] }
  });

  // You can now compose it with other Effects.
  return getPersonEffect.pipe(
    Effect.flatMap(person => enrichWithLocalData(person)),
    Effect.tap((enrichedPerson) => Effect.log(`Enriched ${enrichedPerson.name}`)),
    // Add custom error handling for this specific workflow.
    Effect.catchTag('ApiError', (e) => {
      if (e.tag === 'NotFoundError') {
        return Effect.log('Person not in PCO, creating a new local record.');
      }
      // Re-raise other API errors
      return Effect.fail(e);
    })
  );
}

// The returned value is an Effect that can be composed further or run.
const program = getAndEnrichPerson('54321');
Effect.runPromise(program);
```

### Example: Streaming Large Collections

For endpoints that return collections, the primary method (e.g., `streamPages`) returns a `Stream`. This is the most memory-efficient and powerful way to handle large datasets.

```typescript
import { Stream, Effect } from 'effect';
import { db, kvStore } from './services'; // Your database/KV services

// Get a stream of pages by calling the method directly.
const personPageStream = pcoClient.people.streamPages({
  query: { order: 'created_at' }
});

const syncEffect = Stream.runForEach(
  personPageStream,
  (page) => Effect.gen(function* () {
    // This effect runs for each page of results.
    yield* Effect.log(`Processing page with ${page.items.length} people...`);
    yield* db.insertPeople(page.items);
    yield* kvStore.set('resume-url:people', page.nextPageUrl);
  })
);

// Run the entire stream processing as a single Effect.
Effect.runPromise(syncEffect);
```
The client also provides a `streamAll()` method for convenience when page-level metadata is not needed.

## 2. The Simple Path: Promises with `.run()`

For developers who need a quick result or are working in a non-Effect codebase, every method provides a `.run()` helper function attached to it. This function executes the Effect and returns a standard `Promise`.

### Example: Fetching a Single Record with `.run()`

```typescript
async function fetchPerson(personId: string) {
  try {
    // The `.run()` method executes the Effect and returns a Promise.
    const person = await pcoClient.people.getById.run({
      path: { personId: personId }
    });

    console.log(`Fetched person: ${person.name}`);
    return person;
  } catch (error) {
    console.error('Failed to fetch person:', error);
    // The rejected 'error' object will be a structured, typed ApiError.
  }
}

fetchPerson('12345');
```

### Example: Fetching an Entire Collection with `.run()`

For collection endpoints, you can use the convenience `getAll` method, which handles all pagination and returns a single array.

**Warning:** Use `getAll` with caution. It loads the *entire* dataset into memory and is only suitable for collections you know will be small. For large datasets, always prefer the streaming interfaces.

```typescript
async function findActiveAdmins() {
  const admins = await pcoClient.people.getAll.run({
    query: {
      where: { status: 'active' }
    }
  });

  console.log(`Found ${admins.length} active admins.`);
}
```

This "Effect-first" design provides a powerful, composable default experience while still offering a simple, promise-based escape hatch for straightforward use cases.