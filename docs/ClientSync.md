## OpenFaith Client Sync: Powered by Rocicorp Zero for Instantaneous Application Experiences

A core tenet of OpenFaith is to empower developers to build applications that are **fast and instantly responsive**, regardless of the underlying dataset size—whether an organization has one person or one million. To achieve this, OpenFaith will directly integrate and leverage [**Zero**](https://zero.rocicorp.dev/) as its client-side synchronization engine.

Zero enables applications to feel as if they have the entire backend database available locally, in memory, by caching data for queries on the device and efficiently keeping this data up-to-date.

### The Principle: Local-First, Real-time Sync with Zero

By adopting Rocicorp Zero, OpenFaith applications will benefit from Zero's established principles:

1.  **Instantaneous Reads:** Most data queries are answered immediately from Zero's local SQLite replica on the client device, eliminating network latency for common data access patterns.
2.  **Optimistic Updates:** Writes (creates, updates, deletes) made through Zero's mutator system are applied locally first, updating the UI immediately. These changes are then synchronized to the backend server (and other clients) in the background using Zero's server reconciliation mechanism.
3.  **Real-time Collaboration:** Zero is designed for real-time updates, where changes made by one user are efficiently propagated and reflected in other connected clients.
4.  **Query-Driven Synchronization:** Zero syncs data based on the ZQL (Zero Query Language) queries your application actively uses. It maintains a local replica of data required by these queries and uses Incremental View Maintenance (IVM) to keep them efficiently updated.
5.  **Efficient Data Management:** Zero manages the client-side data replica, focusing on data relevant to active or backgrounded queries (via TTLs), optimizing storage and bandwidth.

### Leveraging the OpenFaith CDM for Zero Schema Generation

The OpenFaith Canonical Data Model (CDM), defined with [Effect.Schema](https://effect.website/docs/schema/introduction), serves as the authoritative source for generating the schema required by Rocicorp Zero.

1.  **Automatic Zero Schema Generation:**

    - OpenFaith will provide tooling and build-time processes to **translate OpenFaith CDM schemas (Effect.Schema definitions) into Rocicorp Zero schema definitions** (using Zero's `table()`, `string()`, `number()`, `relationships()`, etc., API).
    - This translation will map:
      - **OpenFaith Entities to Zero Tables:** Core CDM entities (Person, Circle, Event, etc.) and their standard fields become tables and columns in the Zero schema.
      - **OpenFaith `Edge`s to Zero Relationships:** OpenFaith's flexible `Edge` definitions will be translated into first-class relationships within the Zero schema, enabling ZQL queries like `z.query.circle.related('members')`.
      - **Data Types:** `effect/Schema` types will be mapped to corresponding Zero column types.
      - **Custom Fields:** Definitions from the OpenFaith `Field` entity, when relevant to synced entities, will also be incorporated into the generated Zero schema, likely as part of a JSON column or through schema extensions if feasible.
    - This generated `schema.ts` (or equivalent) will be used to initialize the Zero client instance.

2.  **Type Safety End-to-End:**
    - Using the OpenFaith CDM as the source for the Zero schema ensures strong type safety from client-side ZQL queries through to backend data structures.

### Developer Experience: OpenFaith SDK with Zero Bindings

To simplify development, OpenFaith will provide a client-side SDK that offers convenient wrappers and hooks for interacting with the Zero instance, tailored to the OpenFaith environment.

1.  **Simplified Zero Client Initialization:** The SDK will help configure and initialize the `Zero` client, potentially handling aspects like authentication token management specific to OpenFaith's auth system.
2.  **`useOpenFaithQuery` Hook (wrapping Zero's `useQuery`):**

    - Provides a React Hook (and equivalents for other frameworks) that mirrors Zero's `useQuery` but might offer additional OpenFaith-specific context or schema-awareness.
    - Developers will write ZQL queries against the OpenFaith-generated Zero schema.
      ```typescript
      // Example: Using the OpenFaith hook, which internally uses Zero's useQuery
      const { data: activeGroups, resultInfo } = useOpenFaithQuery(
        (z) =>
          z.query.circle // 'circle' table derived from OpenFaith CDM
            .where("type", "=", "group") // 'type' field from OpenFaith CDM
            .where("isActive", "=", true) // 'isActive' field from OpenFaith CDM
            .related("leaders") // 'leaders' relationship derived from OpenFaith Edges
            .orderBy("name", "asc"),
        { ttl: "1d" }
      );
      ```
    - The hook returns reactive data that updates in real-time as Zero syncs changes.

3.  **Mutation Hooks (wrapping Zero's mutators):**

    - The SDK will facilitate calling Zero mutators (both standard CRUD and [Custom Mutators](https://zero.rocicorp.dev/docs/custom-mutators) if OpenFaith implements a push endpoint compatible with Zero's protocol).
      ```typescript
      const { mutate: createOpenFaithPerson } =
        useOpenFaithMutation("person.create"); // Maps to a Zero mutator
      // ...
      // createOpenFaithPerson({ id: nanoid(), firstName: 'Jane', lastName: 'Doe', _tag: 'person', ... });
      ```
    - This ensures optimistic updates and server reconciliation are handled by Zero.

4.  **Schema-Aware Utilities:** The SDK might provide additional utilities that leverage the OpenFaith CDM to simplify common tasks or provide richer type information when working with Zero.

### Backend Integration with `zero-cache`

- An OpenFaith backend deployment will need to include `zero-cache` instances.
- `zero-cache` will connect to the OpenFaith PostgreSQL database (which stores data according to the OpenFaith CDM, translated to Drizzle/SQL schemas).
- The OpenFaith CDM-to-Zero schema generator will also inform the `schema.ts` used by `zero-cache`.
- If [Custom Mutators](https://zero.rocicorp.dev/docs/custom-mutators) are used for writes, OpenFaith will need to expose a "push endpoint" compatible with Zero's protocol. This endpoint would execute business logic against the OpenFaith CDM before writing to the PostgreSQL database.

### Benefits of Using Rocicorp Zero

1.  **Proven, High-Performance Sync Engine:** Leverages Zero's battle-tested Incremental View Maintenance (IVM) and efficient synchronization capabilities.
2.  **Instantaneous UI:** Delivers the "local-first" fast application experience OpenFaith aims for.
3.  **Real-time Updates & Optimistic Writes:** Built-in features of Zero.
4.  **Reduced Development Effort for Sync Logic:** OpenFaith can focus on its unique CDM, AI features, and church-specific workflows, rather than building a complex client sync engine from scratch.
5.  **Strong Tooling & Community:** Benefits from Zero's existing documentation, community support, and ongoing development.
6.  **Clear Path for Permissions & Custom Logic:** Zero's support for custom mutators and its own permission system (if used, or if OpenFaith's permissions are translated) provide robust mechanisms for server-side validation and control.

### Challenges and Considerations

- **Schema Translation Fidelity:** Ensuring accurate and comprehensive translation from OpenFaith's Effect.Schema-based CDM (including `Edge`s, `Folder`s, sub-typing via `type`, and `customFields`) to Zero's schema definition.
- **Integrating OpenFaith Permissions:** If OpenFaith has its own distinct permission model, integrating it with Zero's data access (which also has a permission layer) will require careful design. Zero's permissions are ZQL-based; OpenFaith's might need to be compiled to this or evaluated at a different layer.
- **Custom Mutator Endpoint:** Implementing a Zero-compatible push endpoint that correctly applies OpenFaith's business logic and updates the CDM.
- **Deployment Complexity:** Managing `zero-cache` instances alongside the core OpenFaith backend components.

### Conclusion

By directly integrating Rocicorp Zero as the client synchronization engine, OpenFaith takes a significant leap towards its goal of enabling developers to build exceptionally fast, responsive, and real-time capable church management applications. The automatic generation of Zero schemas from the OpenFaith CDM, coupled with an SDK providing convenient developer hooks, will abstract the complexities of data synchronization. This allows OpenFaith to leverage a powerful, existing solution for client-side data management, freeing up resources to innovate on its unique Canonical Data Model, AI-first architecture, and rich ecosystem of tools for ministry.
