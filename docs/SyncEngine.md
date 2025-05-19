## OpenFaith Synchronization Process: Initial and Ongoing

Synchronization is a core capability of the OpenFaith platform, enabling data to flow between OpenFaith's Canonical Data Model (CDM) and various external Church Management Systems (ChMS) or other applications. This document details both the **Initial Synchronization** process (when first connecting an external system) and the ongoing **Partial (Incremental) Synchronization** process.

The entire process relies heavily on:

- **[ChMS Adapters](/docs/ChMSAdapters.md):** TypeScript modules specific to each external system, handling API interactions, authentication, data transformation, pagination, and rate limiting.
- **[`ExternalLink` Entity](/docs/ExternalLinks.md):** The central mapping table linking OpenFaith entities to their counterparts in external systems.
- **Job Queue System:** For managing background tasks, retries, and concurrency.
- **`SyncStatus` Entity:** For tracking the overall progress and state of sync operations, visible to users.
- **`Token` Entity:** For securely storing and managing authentication tokens (e.g., OAuth refresh tokens) for external systems.

---

### I. Initial Synchronization Process

The Initial Synchronization process is triggered when an organization first connects OpenFaith to an external ChMS.

**User Configuration Options (Determining Sync Direction & Scope):**

Before starting, users typically define the behavior for this new connection:

1.  **Full Bi-Directional Sync (Mirroring):**

    - **Goal:** To make OpenFaith and the external ChMS mirrors of each other for the selected data entities.
    - **Incoming:** All relevant data from the selected entities/modules in the external ChMS is brought into OpenFaith. New OpenFaith entities are created for external records that don't have a match in OpenFaith. Existing matched entities are updated.
    - **Outgoing:** All relevant OpenFaith entities (that correspond to types supported by the ChMS Adapter) are pushed to the external ChMS. New records are created in the ChMS if no link exists. Existing linked records in the ChMS are updated.
    - **Use Case:** Treating both systems as collaborative peers, or migrating towards OpenFaith while keeping an existing ChMS in sync.

2.  **OpenFaith as Source of Truth (Push-Focused Sync):**

    - **Goal:** Primarily populate or update the external ChMS with data originating from or already mastered in OpenFaith.
    - **Incoming:** Data from the external ChMS is still pulled in to establish `ExternalLink`s and identify matches. However, _new_ OpenFaith entities are typically _not_ created from un-matched external records. Updates from the ChMS to _already linked_ OpenFaith records might be applied based on conflict resolution rules.
    - **Outgoing:** All relevant OpenFaith entities are pushed to the external ChMS. New records are created in the ChMS; existing linked records are updated.
    - **Use Case:** OpenFaith is the primary data store, and the external ChMS is a consuming system or a legacy system being fed data.

3.  **External ChMS as Source of Truth (Pull-Focused or "Limited Push" Sync):**
    - **Goal:** Primarily populate or update OpenFaith with data from the external ChMS, with controlled or no automatic push of unlinked OpenFaith data _to_ the external ChMS.
    - **Incoming:** All relevant data from the selected entities in the external ChMS is brought into OpenFaith. New OpenFaith entities _are created_ for external records that don't have a match in OpenFaith. Existing matched entities are updated.
    - **Outgoing:**
      - OpenFaith will **not** automatically push all its existing, unlinked data to the external ChMS.
      - Only changes to OpenFaith entities that are _already linked_ (via `ExternalLink`) to a record in the external ChMS will be considered for pushing out (subject to conflict resolution).
      - Users might later selectively "push" or "link and push" specific OpenFaith entities to the ChMS.
    - **Use Case:** Migrating _to_ OpenFaith from an existing ChMS, or using OpenFaith as a central hub that consumes data from an authoritative ChMS without immediately overwriting or populating that ChMS with all of OpenFaith's existing data. This is the scenario you described as "limited sync."

The chosen option significantly influences how Phases 3.3 (Creating New OpenFaith Entities) and the outgoing aspects of ongoing sync are handled. For simplicity in the following steps, we'll primarily describe the flow common to "Full Bi-Directional Sync" and "External ChMS as Source of Truth," noting differences where applicable.

**Step-by-Step Initial Sync Process:**

1.  **Step 1: Authentication & Authorization (OAuth Connect & Token Storage)**
    a. The user initiates a connection to an external ChMS (e.g., Planning Center Online) through the OpenFaith UI.
    b. OpenFaith redirects the user to the external ChMS's OAuth 2.0 authorization server.
    c. The user grants OpenFaith permission to access their data.
    d. The external ChMS redirects back to OpenFaith with an authorization code.
    e. OpenFaith (via the relevant ChMS Adapter's authentication logic) exchanges this code for an access token and a refresh token.
    f. The **access token** (short-lived) is used for immediate API calls.
    g. The **refresh token** (long-lived) is securely stored in OpenFaith's `Token` entity, associated with the organization and the external system. This token will be used to obtain new access tokens in the future without requiring user re-authentication.
    h. The `SyncStatus` for this `(orgId, externalSystemName)` is initialized (e.g., "Pending Initial Sync").

2.  **Step 2: Determine Sync Scope & Entity Order**
    a. Based on the user's choice (Full Sync vs. Limited Sync) and the capabilities defined in the ChMS Adapter (e.g., which entities it supports, their dependencies via `adapter.getEntityDependencies()`), the Sync Engine determines the list of entity types to sync and their correct order (e.g., "Funds" before "Donations").

3.  **Step 3: For Each Entity Type in Order - Phased Data Ingestion (Primarily Incoming)**
    _(This process is managed by the Job Queue system. Progress is updated in `SyncStatus`.)_

    - **Phase 3.1: Staging External Records & Basic Data into `ExternalLinks`**
      i. The Adapter fetches all records for the current entity type from the external ChMS, page by page. \* **Pagination & Rate Limiting:** The Adapter is responsible for handling the specific pagination mechanism of the external API and adhering to its rate limits (often by coordinating with a global rate limiter in the job queue).
      ii. For each batch of external records: 1. An `ExternalLink` entry is created or updated (upserted) using `(orgId, externalSystemName, externalSystemEntityId)`. 2. `openFaithEntityId` is initially set to `NULL`. 3. `linkMetadata` in `ExternalLinks` stores minimal data from the external record (e.g., email, name for a Person; key identifiers for other entities) needed for potential matching in the next phase.
      iii. `SyncStatus` is updated to reflect progress (e.g., "Initial Sync: Processed X of Y People - Staging External IDs").

    - **Phase 3.2: Matching & Linking to Existing OpenFaith Entities**
      i. The Sync Engine queries `ExternalLinks` for records of the current entity type where `openFaithEntityId` is `NULL`.
      ii. For each such `ExternalLink` record (in batches): 1. Using the data in `linkMetadata` (and potentially more data fetched via the Adapter if needed), attempt to find a matching existing OpenFaith entity (e.g., match a PCO Person to an OpenFaith Person by email). This logic can be complex and might be part of the Adapter or a shared entity resolution service. 2. If a unique, confident match is found to an existing OpenFaith entity, update the `ExternalLink` record's `openFaithEntityId` with the ID of the matched OpenFaith entity.
      iii. `SyncStatus` is updated (e.g., "Initial Sync: Processed X of Y People - Matching Existing").

    - **Phase 3.3: Creating New OpenFaith Entities (Controlled by Sync Option)**
      i. **If Sync Option is "OpenFaith as Source of Truth":** This phase is typically **skipped or heavily restricted** for creating _new OpenFaith entities from un-matched external data_. The focus is on linking.
      ii. **If Sync Option is "Full Bi-Directional" or "External ChMS as Source of Truth":** 1. Query `ExternalLinks` for records of the current entity type where `openFaithEntityId` is still `NULL`. 2. For each such `ExternalLink` (in batches):
      a. Adapter fetches full data for the external record.
      b. Data is transformed to OpenFaith CDM.
      c. A new OpenFaith entity is created.
      d. `ExternalLink.openFaithEntityId` is updated with the new OpenFaith entity's ID.
      iii. `SyncStatus` updated.

    - **Phase 3.4: Full Data Population/Update for Linked Entities**
      i. Iterate through all `ExternalLink` records for the current entity type for this `(orgId, externalSystemName)` where `openFaithEntityId` is NOT `NULL`.
      ii. For each `ExternalLink` (in batches): 1. The Adapter fetches the full, current data for the `externalSystemEntityId` from the external ChMS. 2. The data is transformed into the OpenFaith CDM format. 3. The corresponding OpenFaith entity (identified by `openFaithEntityId`) is updated in the database with this transformed data. (Conflict resolution during initial sync usually favors the external system's data as the source of truth being imported). 4. Update `ExternalLinks.lastProcessedAt` and relevant `linkMetadata` (e.g., store the external system's `updated_at` timestamp).
      iii. `SyncStatus` is updated (e.g., "Initial Sync: Processed X of Y People - Populating Data").

4.  **Step 4: Initial Outgoing Data Push (Controlled by Sync Option)**
    a. **If Sync Option is "External ChMS as Source of Truth" (your "Limited Sync"):** This step is **skipped or highly selective**. OpenFaith does not automatically push its existing unlinked data to the external ChMS. Only OpenFaith entities that were _just linked or updated_ as a result of the incoming sync (Phases 3.1-3.4) might be considered for an immediate push back if their data is deemed more current by conflict resolution (unlikely for initial import).
    b. **If Sync Option is "Full Bi-Directional" or "OpenFaith as Source of Truth":**
    i. Identify all relevant OpenFaith entities that should be synced to the external ChMS. This includes newly created/updated OpenFaith entities (from Phase 3) and potentially all other existing OpenFaith entities of the types being synced.
    ii. For each such OpenFaith entity: 1. Check `ExternalLinks` to see if it's already linked to a record in the target external ChMS. 2. Transform the OpenFaith entity data to the external ChMS format using the Adapter. 3. If linked, call the Adapter's `updateRecord` method for the external ChMS. 4. If not linked, call the Adapter's `createRecord` method in the external ChMS. Upon success, create a new `ExternalLink`. 5. This is also rate-limited, paginated (conceptually for batches of records), and updates `SyncStatus`.
    c. `SyncStatus` updated (e.g., "Initial Sync: Pushing OpenFaith Data to External System").

5.  **Step 4: Finalize Initial Sync**
    a. Once all selected entity types have completed all phases, the overall `SyncStatus` for the `(orgId, externalSystemName)` is updated to "Initial Sync Complete" or "Active - Incremental Sync Enabled."
    b. The `lastSuccessfulPollTimestamp` in `SyncStatus` (or equivalent table) is set for relevant entity types to enable subsequent partial syncs.

---

### II. Partial (Incremental) Synchronization Process

Partial synchronization keeps OpenFaith data up-to-date _after_ an initial full sync. It processes only records created or modified since the last sync cycle. It runs periodically (e.g., every 15 minutes) or via real-time webhooks.

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

#### B. Outgoing Changes: OpenFaith -> External System

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
    c. Transform OpenFaith data to external format (`payloadForExternal`).
    d. **If `externalSystemEntityId` exists (from `ExternalLinks`):**
    _ Adapter calls `updateRecord` in external ChMS.
    e. **If `externalSystemEntityId` does NOT exist:**
    i. **Check Sync Option:**
    _ If initial option was **"External ChMS as Source of Truth" (your "Limited Sync")**: Typically, do **not** automatically create a new record in the external ChMS for an unlinked OpenFaith entity. This change might be queued for manual review or a selective "push" action by the user. The goal is to avoid populating the ChMS with OpenFaith data it doesn't know about.
    _ If initial option was **"Full Bi-Directional" or "OpenFaith as Source of Truth"**: Proceed to create the record.
    ii. Adapter calls `createRecord` in external ChMS.
    iii. Upon success, create new `ExternalLink`.
    f. Update `ExternalLinks.lastProcessedAt` etc. _(Same)\*

### Error Handling & Retries

- Throughout both incoming and outgoing sync processes, any API call failures or transformation errors should be logged.
- A job queue system should manage retries for transient errors (e.g., network issues, temporary API unavailability, rate limit hits) with appropriate backoff strategies.
- Persistent errors might require moving a task to a "dead-letter queue" for manual investigation.
