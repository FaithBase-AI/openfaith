# 04: Defining Endpoints

Endpoints are the building blocks of your API client. Each endpoint is described by a single, static configuration object created with the `defineEndpoint` helper function. This approach ensures that all endpoint definitions are type-safe and consistent.

These definitions are pure data—they contain no live connections or runtime logic. They serve as a blueprint that the `createApi` function later uses to construct the live, executable client.

## The `defineEndpoint` Function

This is a standalone utility function you import from the library. It takes a single configuration object and returns a validated `EndpointDefinition`.

### Core Properties

These are the mandatory fields that every endpoint definition must have.

*   **`module: string`**
    The top-level API module this endpoint belongs to (e.g., `'people'`, `'groups'`). This always corresponds to the first property on the generated client object (`client.people`, `client.groups`).

*   **`name: string`**
    A unique, dot-separated string representing the full conceptual path to the operation. The client factory uses this to build the nested method structure. **If the first segment of the `name` matches the `module`, it will not be repeated in the final client path.**

    *   **Example 1 (No Repetition):**
        *   `module: 'people'`, `name: 'people.getAll'`
        *   Resulting client method: `client.people.getAll()`

    *   **Example 2 (Nesting):**
        *   `module: 'people'`, `name: 'phoneNumbers.getAll'`
        *   Resulting client method: `client.people.phoneNumbers.getAll()`

    *   **Example 3 (Complex Nesting):**
        *   `module: 'groups'`, `name: 'groups.events.getAll'`
        *   Resulting client method: `client.groups.events.getAll()`

*   **`method: 'GET' | 'POST' | 'PATCH' | 'DELETE'`**
    The HTTP method for the endpoint.

*   **`path: string`**
    The URL path for the endpoint. Path parameters should be specified using the `:paramName` syntax (e.g., `/people/v2/people/:personId`).

*   **`apiSchema: Schema.Schema`**
    The `effect/Schema` for the raw object as returned by the API. For collection endpoints, this should be the schema for a *single item*.

*   **`canonicalSchema: Schema.Schema`**
    The `effect/Schema` for your internal, standardized data model.

*   _... (The "Capability Properties" and "Sync Engine Metadata" sections from the previous version would follow here, as they remain unchanged) ..._

### Complete Examples

**1. Primary Entity Endpoint:** Fetching all "People" from the "People" module.

```typescript
export const getAllPeople = defineEndpoint({
  module: 'people',
  name: 'people.getAll', // "people" segment matches module, will not be repeated
  method: 'GET',
  path: '/people/v2/people',
  apiSchema: PCOPeoplePerson,
  canonicalSchema: BasePerson,
  // ...other properties
});
// Access via: client.people.getAll()
```

**2. Related Entity Endpoint:** Fetching all "Phone Numbers" from the "People" module.

```typescript
export const getAllPhoneNumbers = defineEndpoint({
  module: 'people',
  name: 'phoneNumbers.getAll', // "phoneNumbers" does not match module, will be nested
  method: 'GET',
  path: '/people/v2/phone_numbers',
  apiSchema: PCOPhoneNumber,
  canonicalSchema: BasePhoneNumber,
  // ...other properties
});
// Access via: client.people.phoneNumbers.getAll()
```

**3. Nested Dependent Entity Endpoint:** Fetching all "Events" for a specific "Group" from the "Groups" module.

```typescript
export const getGroupEvents = defineEndpoint({
  module: 'groups',
  name: 'groups.events.getAll', // "groups" segment matches module, will not be repeated
  method: 'GET',
  path: '/groups/v2/groups/:groupId/events',
  apiSchema: PCOEvent,
  canonicalSchema: BaseEvent,
  // ...other properties
});
// Access via: client.groups.events.getAll()
```

This refined convention provides the necessary structure to handle complex, real-world API designs while producing a client interface that is clean, intuitive, and free of awkward redundancies.