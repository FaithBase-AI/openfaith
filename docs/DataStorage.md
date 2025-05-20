## Data Storage in OpenFaith: PostgreSQL with Drizzle ORM, Derived from a Canonical Schema

OpenFaith's backend relies on **PostgreSQL** as its primary relational database management system (RDBMS). This choice is driven by PostgreSQL's robustness, feature set, scalability, and its compatibility with key technologies in the OpenFaith stack, notably [Zero](https://zero.dev/) for client-side synchronization.

Interaction with the PostgreSQL database is managed via [**Drizzle ORM**](https://orm.drizzle.team/), a modern, TypeScript-first Object-Relational Mapper. Crucially, the Drizzle ORM schemas are **derived from OpenFaith's Canonical Data Model (CDM)**, which is defined using [Effect.Schema](https://effect.website/docs/schema/introduction). This ensures the CDM remains the single source of truth for data structures across the entire platform.

### Why PostgreSQL?

PostgreSQL offers a compelling set of features that align well with OpenFaith's requirements:

1.  **Reliability and ACID Compliance:** Ensures data integrity and consistency.
2.  **Extensibility:** Supports a wide range of data types, including powerful JSONB support (crucial for `customFields` and `Edge.metadata`), full-text search, and geospatial data.
3.  **Scalability:** Can handle large datasets and high transaction volumes.
4.  **Open Source and Community Support:** Mature ecosystem of tools and extensions.
5.  **Compatibility with Zero:** `zero-cache` works effectively with PostgreSQL.
6.  **Advanced Features:** Supports advanced indexing, window functions, CTEs, and robust security.

### Drizzle ORM: Typed Database Access Derived from the CDM

OpenFaith employs Drizzle ORM for backend interactions with PostgreSQL. The definition of database tables and their columns using Drizzle ORM is directly informed and generated from the OpenFaith CDM Effect.Schemas.

1.  **CDM as the Source of Truth for Database Schema:**

    - The primary definition of all entities, their fields, types, and basic validation rules resides in the OpenFaith CDM, expressed using `Effect.Schema`.
    - OpenFaith will include **tooling or build-time processes to translate these canonical Effect.Schema definitions into Drizzle ORM table schemas** (e.g., `pgTable`, `varchar`, `jsonb`).
    - This translation process will map CDM entity fields to Drizzle columns, Effect.Schema types to PostgreSQL/Drizzle types, and utilize annotations within the Effect.Schemas (e.g., for primary keys, foreign keys, indexes, `NOT NULL` constraints) to generate accurate Drizzle schema declarations.

2.  **Schema Migration with Drizzle Kit:**

    - Once the Drizzle ORM schemas are generated from the CDM, Drizzle Kit is used to compare these TypeScript schema definitions with the actual database state and generate the necessary SQL migration scripts. This ensures controlled and versioned database schema evolution, all traceable back to the source CDM definitions.

3.  **Type-Safe Queries:**

    - Drizzle ORM provides a fully type-safe query builder. Queries written in TypeScript are checked at compile time against the Drizzle schemas (which are themselves derived from the CDM), offering end-to-end type safety from the canonical model down to the database query.
    - It supports all standard SQL operations as well as complex joins, aggregations, and subqueries.

4.  **Performance & Developer Experience:**
    - Drizzle ORM is lightweight and generates efficient SQL. It allows for raw SQL when needed.
    - Its SQL-like syntax and excellent TypeScript support enhance developer productivity.

**Example: Deriving Drizzle Schema from CDM (Conceptual Flow)**

```typescript
// 1. Define in OpenFaith CDM (e.g., cdm/person.schema.ts)
import * as S from "@effect/schema/Schema";

export const PersonCdmSchema = S.Struct({
  id: S.UUID.annotations({
    identifier: "PersonID",
    drizzle: { primaryKey: true, defaultRandom: true },
  }),
  _tag: S.Literal("person").annotations({
    drizzle: { notNull: true, default: "person" },
  }),
  orgId: S.UUID.annotations({
    drizzle: {
      notNull: true,
      foreignKey: { table: "organizations", column: "id" },
    },
  }),
  type: S.optional(S.String),
  firstName: S.optional(S.String),
  lastName: S.optional(S.String),
  customFields: S.optional(S.Any.annotations({ drizzle: { type: "jsonb" } })), // S.Any often maps to jsonb
  createdAt: S.Date.annotations({
    drizzle: { notNull: true, defaultNow: true, withTimezone: true },
  }),
  updatedAt: S.Date.annotations({
    drizzle: { notNull: true, defaultNow: true, withTimezone: true },
  }),
});

// -----------------------------------------------------

// 2. Generated Drizzle Schema (e.g., drizzle/schema.ts - conceptual output of tooling)
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
// import { organizations } from './organization-drizzle-schema'; // Assume this is also generated

export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  _tag: text("_tag").notNull().default("person"),
  orgId: uuid("org_id").notNull() /*.references(() => organizations.id)*/, // FK ref would be added by tooling
  type: text("type"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ... other generated tables and relations ...
```

_(The `drizzle` annotations in the Effect.Schema are hypothetical examples of how metadata could guide the generation.)_

### Data Storage Strategy Highlights

- **CDM Drives Table Structure:** Each core entity in the OpenFaith CDM maps to a PostgreSQL table, with its structure dictated by the CDM Effect.Schema definition.
- **JSONB for Flexibility:** CDM fields intended for flexible data (like `customFields` on entities, or `metadata` on `Edge` and `ExternalLink`) are mapped to `JSONB` columns.
- **`Edge` Table for Relationships:** The generic `Edge` table (whose structure is also defined in the CDM) is central to modeling relationships.
- **Indexing Strategy:** Indexes (primary keys, foreign keys, query optimization indexes) are defined based on annotations in the CDM Effect.Schemas or inferred by the generation tooling.
- **Multi-Tenancy & Soft Deletes:** `orgId` for multi-tenancy and fields for soft deletes are standard parts of CDM entity definitions and thus reflected in the database schema.

### Interaction with Zero

The principle of the OpenFaith CDM Effect.Schemas being the single source of truth extends to Zero:

1.  **`zero-cache` Backend:** The server-side `zero-cache` component connects to the OpenFaith PostgreSQL database (whose schema is derived from the CDM).
2.  **Zero Schema Generation from CDM:**
    - Tooling within OpenFaith will **translate the CDM Effect.Schema definitions into Zero's `schema.ts` format.**
    - This ensures that the schema used by `zero-cache` on the server and the Zero client on the device are both consistent with and derived from the same canonical OpenFaith data model.
    - This translation will map CDM entities to Zero tables, CDM fields to Zero columns, and OpenFaith `Edge` relationships to Zero relationships, enabling ZQL queries like `z.query.circle.related('members')`.
3.  **Data Flow:**
    - **Client -> Server:** Mutations from the Zero client are processed by `zero-cache` (potentially via OpenFaith custom push endpoint/mutators) and written to PostgreSQL using Drizzle ORM.
    - **Server -> Client:** `zero-cache` observes changes in PostgreSQL and propagates them to Zero clients based on their ZQL queries, all operating on schemas derived from the single OpenFaith CDM.

### Future Considerations

- **Database Partitioning:** For very large tables, partitioning strategies might be considered.
- **Read Replicas:** For scaling read-heavy workloads.
- **Full-Text Search:** Leveraging PostgreSQL's capabilities.

### Conclusion

OpenFaith's data storage strategy is built on the robust foundation of PostgreSQL, accessed via the type-safe Drizzle ORM. Critically, the database schema itself is a **direct derivative of the OpenFaith Canonical Data Model (CDM) defined with Effect.Schema.** This ensures that the CDM is the single source of truth for data structures across the platform, from backend persistence to client-side synchronization with Zero. This schema-first, derivation-based approach promotes consistency, type safety, and a streamlined development workflow for managing and evolving OpenFaith's data layer.
