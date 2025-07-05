## Facilitating Synchronization with `ExternalLink`: The Key to Robust Data Mapping

The `ExternalLink` entity is a cornerstone of the OpenFaith synchronization engine. It acts as the "Rosetta Stone," enabling robust and reliable mapping between entities within the OpenFaith Canonical Data Model (CDM) and their corresponding records in various external Church Management Systems (ChMS) or other applications.

This dedicated entity is crucial for building a scalable and maintainable sync system by directly addressing common challenges encountered in data integration, such as managing disparate ID systems and optimizing data operations.

### Problems `ExternalLink` Helps Avoid

1.  **Conflating Internal and External IDs:**

    - **Problem:** Relying on an `externalId` field directly on core OpenFaith entities (e.g., `Person.externalId`) creates several issues:
      - It tightly couples the OpenFaith entity to a single external system. What if a Person needs to link to PCO _and_ CCB?
      - It makes it difficult to assign a stable, internally generated OpenFaith ID if the `externalId` is used as the primary means of identification during imports.
    - **Solution with `ExternalLink`:** OpenFaith entities always have their own unique, internally generated `id`. The `ExternalLink` table separately manages the many-to-many relationships between OpenFaith IDs and any number of `(adapter, externalId)` pairs. This keeps the core OpenFaith model clean and independent.

2.  **Inefficient Data Lookups (Excessive Reads During Sync):**

    - **Problem:** Without a dedicated mapping table, determining if an incoming external record already exists in OpenFaith (and what its internal ID is) often requires "fuzzy" searching on OpenFaith tables based on attributes like email or name. For every incoming record, this could mean:
      - `SELECT * FROM People WHERE email = ? AND name = ? ...`
        This is read-intensive, slow for large datasets, and prone to errors (multiple matches, no matches for legitimate links). Updating an existing record also first requires finding it.
    - **Solution with `ExternalLink`:**
      - **Incoming Changes (Webhooks/Polls):** A direct, indexed lookup on `ExternalLinks` using `(adapter, externalId)` instantly provides the `entityId`. This is a single, highly efficient query.
      - **Outgoing Changes:** A direct, indexed lookup on `ExternalLinks` using `entityId` quickly retrieves all associated external system IDs for propagation.

3.  **Complex Logic for Initial Sync into Pre-existing Datasets:**

    - **Problem:** If an organization already has data in OpenFaith and wants to sync a new external ChMS, merging the datasets and establishing links without creating duplicates or missing connections is highly complex if relying only on attribute-based matching.
    - **Solution with `ExternalLink` (Unified Sync with Smart Conflict Resolution):**
      - **Unified Operation:** The system uses a single operation with intelligent conflict resolution via `ON CONFLICT DO UPDATE` to handle both initial sync and incremental updates efficiently.
      - **Smart Entity ID Management:** New external records get assigned OpenFaith entity IDs immediately, while existing records preserve their existing entity links during conflicts.
      - **Conditional Processing:** The system only updates `lastProcessedAt` when external records have actually changed, optimizing performance.

4.  **Difficulty Managing Multi-System Identities:**
    - **Problem:** How do you know if PCO Person "123" and CCB Person "ABC" are the same individual in your system without a central mapping?
    - **Solution with `ExternalLink`:** If both `ExternalLink` records `(pco, 123)` and `(ccb, ABC)` point to the same `entityId`, the system knows they represent the same canonical person.

### `ExternalLink` Entity Schema (Key Fields)

A typical `ExternalLink` record would include:

- `_tag` (Discriminated union tag, set to "externalLink")
- `orgId` (The OpenFaith organization this link belongs to)
- `entityId` (Foreign Key to the ID of the OpenFaith entity, e.g., `Person.id`)
- `entityType` (The `_tag` of the OpenFaith entity, e.g., "person", "group")
- `adapter` (A unique identifier for the external system, e.g., "pco", "ccb", "breeze")
- `externalId` (The unique identifier of the record _within_ the external system)
- `lastProcessedAt` (Timestamp indicating when this link was last involved in a successful sync operation)
- `updatedAt` (Timestamp from the external system indicating when the record was last modified)
- **Soft Delete:** `deletedAt`, `deletedBy`

**Primary Key:**

- The combination of (`orgId`, `adapter`, `externalId`) forms the composite primary key for the ExternalLink table. There is no separate `id` field.

**Critical Constraint:** A `UNIQUE` constraint is enforced on `(orgId, adapter, externalId)` to ensure that a specific external record can only be linked once per organization.

### How `ExternalLink` Facilitates Syncing (Unified Approach)

The OpenFaith implementation uses an efficient unified approach that combines initial sync and incremental updates into a single operation:

#### **Unified Sync Operation with Smart Conflict Resolution**

```sql
INSERT INTO external_links (orgId, adapter, externalId, entityId, entityType, ...)
VALUES (...)
ON CONFLICT (orgId, adapter, externalId) DO UPDATE SET
  lastProcessedAt = CASE
    WHEN EXCLUDED.updatedAt IS DISTINCT FROM external_links.updatedAt
    THEN EXCLUDED.lastProcessedAt
    ELSE external_links.lastProcessedAt
  END,
  updatedAt = EXCLUDED.updatedAt
```

**Key Benefits of This Approach:**

1. **Entity ID Preservation**: Existing `entityId` values are preserved during conflicts, maintaining established links between external and OpenFaith entities.

2. **Conditional Processing**: `lastProcessedAt` is only updated when the external record has actually changed, avoiding unnecessary processing.

3. **Atomic Operations**: The entire sync operation is atomic, ensuring data consistency.

4. **Efficient Updates**: No need for separate lookup queries - the conflict resolution handles both new records and updates seamlessly.

#### **Sync Flow**

1. **External Data Ingestion**: External records are inserted into `ExternalLinks` with new OpenFaith entity IDs
2. **Conflict Resolution**: Existing records preserve their entity links while updating timestamps
3. **Entity Processing**: Only records that were actually updated (based on `lastProcessedAt` comparison) are processed for entity updates

### Benefits of Using `ExternalLink`

- **Clean Core Model:** OpenFaith entities maintain their own independent ID system.
- **Multi-System Linking as a First-Class Citizen.**
- **Improved Performance:** Significantly reduces database reads during routine sync operations by enabling direct ID-based lookups once links are established.
- **Scalability:** Handles large datasets more effectively with unified operations.
- **Clarity and Traceability:** Provides a clear audit trail of how entities are connected.
- **Foundation for Advanced Features:** Merging duplicates, complex conflict resolution.
- **Efficient Conflict Resolution:** Smart handling of both initial sync and incremental updates in a single operation.

### Implementation Pattern

The current implementation pattern efficiently handles both scenarios:

- **Initial Sync**: New external records get assigned OpenFaith entity IDs and are processed for entity creation
- **Incremental Updates**: Existing records preserve their entity links while updating timestamps and processing only changed records

This unified approach eliminates the need for explicit phased operations while maintaining all the benefits of the ExternalLinks pattern.

In summary, the `ExternalLink` entity is not just a mapping table; it's a strategic component designed to optimize performance, ensure data integrity, and simplify the complex logic required for robust, bi-directional, and multi-system synchronization within the OpenFaith platform.
