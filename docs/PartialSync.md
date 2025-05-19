## Partial (Incremental) Synchronization Process

Partial synchronization, also known as incremental or delta sync, is the process of keeping OpenFaith data up-to-date with changes from external systems (and vice-versa) after an initial full sync has been performed. This process is designed to be efficient by only processing records that have been created or modified since the last sync cycle.

It typically runs periodically (e.g., every 15 minutes via a cron job) or is triggered by real-time events like webhooks.

### A. Incoming Changes: External System -> OpenFaith

This flow describes how changes originating in an external ChMS (e.g., Planning Center Online - PCO) are reflected in OpenFaith.

**Prerequisites:**

- Initial full sync has been completed.
- `ExternalLink` table is populated, mapping external system IDs to OpenFaith entity IDs.
- `SyncStatus` table (or similar mechanism) stores the `lastSuccessfulPollTimestamp` for each `(orgId, externalSystemName, entityType)` that relies on polling.
- OpenFaith Adapters for the relevant external systems are configured and loaded.

**Trigger Mechanisms:**

1.  **Polling (Scheduled Job):**
    - A scheduled job (e.g., cron) initiates the polling process for an organization and a specific external system.
    - It retrieves the `lastSuccessfulPollTimestamp` for each entity type to be synced from that system.
2.  **Webhooks (Real-time Event):**
    - An external system sends a webhook to a dedicated OpenFaith endpoint, signaling a change to a specific record.

**Step-by-Step Process:**

1.  **Step 1: Identify Changed Records in External System**

    - **For Polling:**
      a. The appropriate OpenFaith Adapter constructs an API request to the external ChMS.
      b. The request asks for all records of a specific entity type (e.g., "People") that have been created or updated _since_ the `lastSuccessfulPollTimestamp`. This typically uses a filter like `WHERE external_updated_at > lastSuccessfulPollTimestamp`.
      c. The Adapter handles pagination to retrieve all pages of changed records.
    - **For Webhooks:**
      a. The webhook payload usually contains the ID of the changed external record and sometimes the nature of the change (create, update, delete) or even the full updated record.
      b. The OpenFaith Webhook Ingestor validates and passes the payload to the relevant Adapter's webhook processing logic.

2.  **Step 2: For Each Changed External Record - Find or Create `ExternalLink`**
    a. Extract the `externalSystemEntityId` and `externalSystemName` from the incoming data.
    b. **Lookup in `ExternalLinks` Table:** Query the `ExternalLinks` table:
    `SELECT id, openFaithEntityId, linkMetadata FROM ExternalLinks WHERE orgId = ? AND externalSystemName = ? AND externalSystemEntityId = ?;`
    c. **If `ExternalLink` Exists:**

    - Proceed to Step 3 with the found `openFaithEntityId`.
      d. **If `ExternalLink` Does Not Exist (Rare after initial sync, but possible for newly created records or system recovery):**
      i. This indicates a record newly created in the external system that OpenFaith hasn't seen before (or a link that was missed/lost).
      ii. **Attempt Entity Resolution:** Try to find an existing OpenFaith entity that might correspond to this new external record (e.g., by matching email for a Person). This is a more complex step and might involve heuristics defined in the Adapter.
      iii. **If Resolved to an Existing OpenFaith Entity:** Create a new `ExternalLink` record, linking the `externalSystemEntityId` to the found `openFaithEntityId`. Proceed to Step 3.
      iv. **If Not Resolved (Truly New Entity):** 1. Transform the partial or full data from the external record into the OpenFaith Canonical Data Model (CDM). 2. Create a \*new\* OpenFaith entity record. Let its ID be `newOpenFaithEntityId`. 3. Create a new `ExternalLink` record, linking the `externalSystemEntityId` to `newOpenFaithEntityId`. 4. The process for this specific record is largely complete (as it was created fresh). Update `ExternalLinks.lastProcessedAt` and `linkMetadata`. Skip to Step 5 for this record.

3.  **Step 3: Fetch Full External Record (If Necessary) & Transform**
    a. If the webhook or polling response only provided partial data (e.g., just an ID), the Adapter makes an API call to the external ChMS to fetch the full, current state of the `externalSystemEntityId`.
    b. The Adapter's transformation logic converts the full external record data into the OpenFaith CDM format. Let this be `canonicalExternalData`.

4.  **Step 4: Apply Changes to OpenFaith Entity (Update & Conflict Resolution)**
    a. Fetch the current OpenFaith entity from the database using the `openFaithEntityId` obtained from the `ExternalLink`. Let this be `currentOpenFaithData`.
    b. **Conflict Resolution:** Compare `canonicalExternalData` with `currentOpenFaithData`.
    _ A common strategy is "Last Write Wins," comparing the `updated_at` timestamp from `canonicalExternalData` (originating from the external system) with `currentOpenFaithData.updatedAt` (from OpenFaith).
    _ Other strategies might involve field-level merging or flagging conflicts for manual review.

    - The `linkMetadata` in `ExternalLinks` (e.g., `external_updated_at` stored there from the \*previous\* sync) can also be used to determine if the incoming change is genuinely newer than what OpenFaith last saw from that specific external link.
      c. If the conflict resolution dictates an update:
      i. Merge the changes from `canonicalExternalData` into `currentOpenFaithData`.
      ii. Update the OpenFaith entity record in the database. This will also update its `updatedAt` timestamp.
      d. Update the `ExternalLinks` record's `lastProcessedAt` and `linkMetadata` (e.g., store the new `external_updated_at` from `canonicalExternalData`).

5.  **Step 5: Update Sync Status (for Polling)**
    - If the batch of changes processed via polling for an entity type was successful, update the `lastSuccessfulPollTimestamp` in the `SyncStatus` table to the current time (or the timestamp of the latest record processed from the external system) for that `(orgId, externalSystemName, entityType)`. This ensures the next poll starts from the correct point.

### B. Outgoing Changes: OpenFaith -> External System

This flow describes how changes originating within OpenFaith are propagated to linked external systems.

**Prerequisites:**

- Change Data Capture (CDC) mechanism or eventing system within OpenFaith to detect when OpenFaith entities are created or updated.

**Trigger Mechanism:**

- An OpenFaith entity is created or updated, triggering an internal event or CDC record.

**Step-by-Step Process:**

1.  **Step 1: Detect Change in OpenFaith**

    - The OpenFaith eventing system captures the `openFaithEntityId`, `openFaithEntityTypeTag`, and the changed data (or at least signifies that a change occurred).

2.  **Step 2: Identify Linked External Systems**

    - Query the `ExternalLinks` table:
      `SELECT externalSystemName, externalSystemEntityId FROM ExternalLinks WHERE orgId = ? AND openFaithEntityId = ? AND openFaithEntityTypeTag = ?;`
    - This returns a list of all external records (across different ChMS) linked to the changed OpenFaith entity.

3.  **Step 3: For Each Linked External System - Transform & Propagate**
    a. Load the OpenFaith Adapter for the `externalSystemName`.
    b. Fetch the full current state of the changed OpenFaith entity.
    c. The Adapter's transformation logic converts the OpenFaith entity data into the format expected by the `externalSystemName`'s API for an update or create operation. Let this be `payloadForExternal`.
    d. **If `externalSystemEntityId` exists (from `ExternalLinks`):**
    _ The Adapter makes an API call to the external ChMS to `UPDATE` the record identified by `externalSystemEntityId` using `payloadForExternal`.
    e. **If `externalSystemEntityId` does NOT exist (should be rare for updates, more common if this OpenFaith entity was just created and not yet linked to this particular external system):**
    _ The Adapter makes an API call to `CREATE` a new record in the external ChMS using `payloadForExternal`.
    _ Upon successful creation, the external ChMS will return its new ID.
    _ A new `ExternalLink` record is created to map the OpenFaith entity to this newly created external record.
    f. Upon successful API call (create or update): \* Update `ExternalLinks.lastProcessedAt` and potentially `linkMetadata` for that specific link.

### Error Handling & Retries

- Throughout both incoming and outgoing sync processes, any API call failures or transformation errors should be logged.
- A job queue system should manage retries for transient errors (e.g., network issues, temporary API unavailability, rate limit hits) with appropriate backoff strategies.
- Persistent errors might require moving a task to a "dead-letter queue" for manual investigation.
