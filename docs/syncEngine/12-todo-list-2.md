## Task List: Building the Core API Client

### Phase 1: Create the Core Handler Logic

The goal of this phase is to replace the manual assembly in `responseFactory.test.ts` with a reusable, intelligent handler that encapsulates the logic for a single endpoint.

#### ✅ **Task 1: Create `api/client/endpointHandler.ts`**

*   **File:** `src/api/client/endpointHandler.ts` (new file)
*   **Purpose:** This file will contain the core function that transforms a declarative `EndpointDefinition` into an executable function.
*   **Exports:**
    *   `createEndpointHandler(definition, adapter, config)`: This will be our primary function.
        *   **Inputs:** An `EndpointDefinition`, a `ResponseAdapter`, and a `config` object (`baseUrl`, `bearerToken`).
        *   **Logic (for GET endpoints initially):**
            1.  Determine if the endpoint is for a single item (has path params) or a collection.
            2.  Use the `ResponseAdapter` to wrap the `apiSchema` into the full response schema (e.g., `adapter.adaptCollection(definition.apiSchema)`).
            3.  Define the schema for the input parameters (e.g., `where`, `include`, `per_page`) based on the `queryableBy`, `orderableBy`, and `includes` properties in the `EndpointDefinition`.
            4.  Implement a helper function to transform the structured input parameters (e.g., `{ where: { status: 'active' } }`) into the flat query string format the API expects (e.g., `?where[status]=active`).
            5.  Internally, call our existing `createJsonGet` factory with the correctly assembled schemas and formatted parameters.
        *   **Return Value:** A single, executable function, e.g., `(params: GetPeopleParams) => Effect<PCOCollectionResponse<PCOPerson>>`. (The return type will be static for now).

#### ✅ **Task 2: Refactor `responseFactory.test.ts` to Use `endpointHandler.ts`**

*   **File:** `src/api/factories/responseFactory.test.ts` (modify existing)
*   **Purpose:** To validate that our new `createEndpointHandler` works correctly and successfully replaces the manual setup logic.
*   **Changes:**
    1.  Import `createEndpointHandler`.
    2.  In the test, instead of manually calling `pcoResponseAdapter.adaptCollection` and `createJsonGet`, the test will now:
        *   Get the `getAllPeopleDefinition` from `peopleEndpoints.ts`.
        *   Call `const getPeople = createEndpointHandler(getAllPeopleDefinition, pcoResponseAdapter, config)`.
        *   Call `yield* getPeople({ ... })` and assert the result.
    3.  This proves our new handler encapsulates the logic correctly.

### Phase 2: Assemble the Full Client

With the handler for a single endpoint working, we'll now build the factory that generates the complete, user-facing client object.

#### ✅ **Task 3: Create `api/client/client.ts`**

*   **File:** `src/api/client/client.ts` (new file)
*   **Purpose:** This file will house the main `createApiClient` factory.
*   **Exports:**
    *   `createApiClient(manifest, adapter, config)`: The main entry point for our library.
        *   **Logic:**
            1.  Initialize an empty client object.
            2.  Iterate through the `pcoEntityManifest` entries (`Person`, `Email`, etc.).
            3.  For each entity, iterate through its defined `endpoints` (`getAll`, `getById`, ...).
            4.  For each endpoint, call `createEndpointHandler` with the correct `EndpointDefinition`.
            5.  Use the `module` and `name` properties from the `EndpointDefinition` (e.g., `people.getAll`) to dynamically build the nested client object. For example, `people.getAll` would result in `client.people.getAll = handler`.
        *   **Return Value:** The fully assembled, nested client object ready for use.

#### ✅ **Task 4: Create a New Integration Test for the Full Client**

*   **File:** `src/api/client/client.test.ts` (new file)
*   **Purpose:** To perform an end-to-end test of the `createApiClient` factory.
*   **Changes:**
    1.  Import `createApiClient`, `pcoEntityManifest`, and `pcoResponseAdapter`.
    2.  Call `const client = createApiClient(...)`.
    3.  Write a test that uses the generated client: `const result = yield* client.people.getAll({ ... })`.
    4.  Assert that the result is correct. This validates that the entire manifest-to-client pipeline works.

### Phase 3: Advanced Typing for `include`

This is where we solve the dynamic return type problem. This is a more advanced TypeScript task and should only be done after the core functionality is proven.

#### ✅ **Task 5: Enhance Typing in `endpointHandler.ts` and `client.ts`**

*   **File:** `src/api/client/endpointHandler.ts` and `src/api/client/client.ts` (modify existing)
*   **Purpose:** To make the return type of `GET` requests reflect the `include` parameter.
*   **Changes:**
    1.  Define complex generic types that can take an `EndpointDefinition` and an `Include` array as input.
    2.  These types will look at the `relationships` map on the definition.
    3.  They will construct a new response type that adds properties for each included relationship (e.g., `emails: PCOEmail[]`).
    4.  The `createEndpointHandler` function will be updated to use these generics, making its return type dynamic.
    5.  The `createApiClient` function will inherit these dynamic types, so the final `client.people.getAll` method will be fully type-safe based on its inputs.
