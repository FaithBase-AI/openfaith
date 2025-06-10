### Project Implementation To-Do List

This list represents the core tasks for building the API Client library (`@your-org/api-client`).

#### **Phase 1: The Core Definitions (The "Blueprint")**

These are the foundational data structures. They have no logic but define the shape of everything else.

*   [x] **1. Create `src/api/EndpointTypes.ts`**
    *   **Goal:** Define your custom, high-level, developer-friendly endpoint configuration objects.
    *   **Tasks:**
        *   Create the `BaseEndpointDefinition` interface.
        *   Create the method-specific interfaces (`GetEndpointDefinition`, `PostEndpointDefinition`, etc.) that extend the base.
        *   Include the `relationships` map on `GetEndpointDefinition` for `include` metadata.
        *   Create the overloaded `defineEndpoint` helper function that developers will use.

*   [x] **2. Create `src/api/EntityManifest.ts`**
    *   **Goal:** Define the structure for the central entity registry.
    *   **Tasks:**
        *   Create the `EntityManifestEntry` interface. It must contain `entity`, `apiSchema`, `canonicalSchema`, and the `endpoints` object which holds `EndpointDefinition`s.
        *   Export a type alias for `EntityName` (e.g., `keyof typeof pcoEntityManifest`).

*   [x] **3. Implement Schemas for a Single Entity (e.g., Person)**
    *   **Goal:** Create the concrete schemas for our first test case.
    *   **Tasks:**
        *   Create `src/pco/schemas/person.ts`.
        *   Define and export `PCOPerson` (the raw API schema).
        *   Define and export `BasePerson` (the internal canonical schema).

*   [x] **4. Implement Endpoint Definitions for the "Person" Entity**
    *   **Goal:** Use your `defineEndpoint` helper to create the static definitions for all Person-related operations.
    *   **Tasks:**
        *   Create `src/pco/endpoints/people.ts`.
        *   Define and export `getAllPeopleDefinition`, `getPersonByIdDefinition`, `createPersonDefinition`, etc., filling them out with data from the PCO documentation.

#### **Phase 2: The Adapters and Transformers (The "Connective Tissue")**

This phase bridges your custom definitions with the `@effect/platform` tools.

*   [x] **5. Create `src/api/ResponseAdapter.ts`**
    *   **Goal:** Define the strategy interface for handling different API response structures.
    *   **Tasks:**
        *   Create the `ResponseAdapter` interface with `adaptSingle` and `adaptCollection` methods.

*   [x] **6. Implement the PCO-Specific `ResponseAdapter`**
    *   **Goal:** Create the concrete adapter for the Planning Center JSON:API format.
    *   **Tasks:**
        *   Create `src/pco/PcoResponseAdapter.ts`.
        *   Implement the `pcoResponseAdapter` object. `adaptSingle` should wrap the schema in `{ data: ... }`, and `adaptCollection` should wrap it in the full `{ data: [...], links: ..., meta: ... }` envelope.

*   [x] **7. Create `src/api/EndpointAdapter.ts`**
    *   **Goal:** Build the transformer that converts your high-level `EndpointDefinition` into a platform-native `HttpApiEndpoint`.
    *   **Tasks:**
        *   Implement the `createEndpointTransformer` factory function. It should accept a `ResponseAdapter`.
        *   The returned function should take your `EndpointDefinition` and use a `switch` or `Match` on the `method` property.
        *   Inside each case, call the appropriate `HttpApiEndpoint` constructor (e.g., `.get()`, `.post()`) and use the `ResponseAdapter` to set the correct success schema via `.addSuccess()`.
        *   Implement the `buildUrlParamsSchema` and `buildPayloadSchema` helpers within this file.

#### **Phase 3: The Live Client (The "Engine")**

This is where you assemble everything into a working client.

*   [x] **8. Create the PCO `HttpApi` Definition**
    *   **Goal:** Assemble all transformed endpoints into a single, platform-native `HttpApi` object.
    *   **Tasks:**
        *   Create `src/pco/api.ts`.
        *   Import the `pcoEntityManifest` (which we will create next).
        *   Create the `pcoEndpointTransformer` by passing `pcoResponseAdapter` to `createEndpointTransformer`.
        *   Iterate through the manifest, transform each endpoint using your transformer, and assemble them into `HttpApiGroup`s.
        *   Combine the groups into a single exported `PcoApi` object.

*   [ ] **9. Create the PCO `EntityManifest`**
    *   **Goal:** Populate the central manifest with your "Person" entity data.
    *   **Tasks:**
        *   Create `src/pco/entity-manifest.ts`.
        *   Import the schemas and endpoint definitions from steps 3 & 4.
        *   Create and export the `pcoEntityManifest` object, starting with the entry for `Person`.

*   [ ] **10. Create the `ApiClient.ts` (with the High-Level Wrapper)**
    *   **Goal:** Build the final `createApi` function that generates the user-facing, dynamically-typed client.
    *   **Tasks:**
        *   The `createApi` function will take the `HttpApi` object and a `RuntimeConfig`.
        *   Inside, it will create the `authLayer` (simple version first).
        *   It will derive the `baseClient` using `HttpApiClient.make`.
        *   It will then loop through the `EntityManifest` to build the high-level wrapper object. Each method on the wrapper (e.g., `client.people.getAll`) will:
            *   Call the corresponding `baseClient` method.
            *   Perform the runtime "stitching" of `data` and `included`.
            *   Perform the transformation to the canonical model.
            *   Return the final, enriched data.

#### **Phase 4: Testing and Validation**

*   [ ] **11. Write an Integration Test**
    *   **Goal:** Create a test file (`test.ts` or similar) to prove the end-to-end flow.
    *   **Tasks:**
        *   Create a `SimpleRuntimeConfig` with your PCO token.
        *   Call `createApi` to get the client effect.
        *   Write a program that uses the client (e.g., `client.people.getAll({ query: { include: ['emails'] } })`).
        *   Provide the `FetchHttpClient.layer`.
        *   Run the program using `Effect.runPromise` and `console.log` the result.
        *   Assert that the returned `person` objects have an `emails` property.

Completing these steps in order will result in a well-architected, testable, and powerful API client library that perfectly matches the sophisticated design we've outlined.