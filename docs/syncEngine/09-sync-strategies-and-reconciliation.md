# 09: Sync Strategies and Reconciliation

A robust synchronization system cannot rely on a single method for keeping data up-to-date. Different scenarios require different strategies. Our Sync Engine employs a multi-layered approach to ensure data is not only current but also complete and accurate over the long term.

This document details our three primary sync strategies: **Delta Sync**, **Reconciliation Sync**, and **Webhook-Triggered Sync**.

## 1. Delta Sync (The "Fast Lane")

This is the most frequent and efficient type of sync. Its goal is to fetch only what has changed since the last run.

*   **Trigger:** Runs on a fixed schedule, typically every 5-15 minutes.
*   **Mechanism:**
    1.  The orchestrator retrieves the `last-sync-timestamp` for a given entity (e.g., `'people'`) from our Key-Value Store.
    2.  It executes the generic `SyncEntityWorkflow` for that entity.
    3.  It passes a `where` clause to the client, using the `deltaSyncField` (e.g., `'updated_at'`) defined on the endpoint: `?where[updated_at][gt]=<last-sync-timestamp>`.
    4.  It only processes records that have been created or updated since the last sync.
    5.  Upon successful completion, it updates the `last-sync-timestamp` to the current time.
*   **Purpose:** To provide timely updates for new and modified data with minimal API usage.
*   **Limitation:** Delta syncs **cannot detect deletions**. If a record is deleted in the source API, it will never appear in an `updated_at` query, and we will never know it's gone.

## 2. Reconciliation Sync (The "Janitor")

This is a slower, more exhaustive process designed specifically to solve the problem of detecting deletions and correcting data drift.

*   **Trigger:** Runs on a less frequent schedule, typically once every 24 hours during off-peak times.
*   **Mechanism:**
    1.  The orchestrator starts a reconciliation workflow for an entity (e.g., `'people'`).
    2.  **Fetch All Source IDs:** It uses the API Client's `streamAll` method to efficiently fetch the unique IDs of *every single active record* from the source API. This is a crucial step and must not load the full objects into memory.
    3.  **Fetch All Destination IDs:** It performs a query against our own application database to get a list of all corresponding record IDs that we currently have stored.
    4.  **Compare the Lists:** The workflow compares the two sets of IDs.
        *   **IDs in Destination but NOT in Source:** These records have been **deleted** in the source API. The workflow will mark them as deleted (soft delete) in our database.
        *   **IDs in Source but NOT in Destination:** These are records that were missed by previous delta syncs (a rare but possible event). The workflow will schedule a targeted sync job to fetch these specific records.
*   **Purpose:** To ensure data consistency over the long term, correct any data drift, and reliably handle deletions.
*   **When It's Used:** This is mandatory for any entity that does **not** support deletion webhooks (`supportsWebhooks: false` in the endpoint definition). For entities that do support webhooks, it serves as a valuable daily safety net.

## 3. Webhook-Triggered Sync (The "Real-Time")

This is the fastest and most targeted type of sync, providing near real-time updates.

*   **Trigger:** An incoming webhook event from the third-party API (e.g., `person.created`, `donation.refunded`).
*   **Mechanism:**
    1.  An ingestion service receives the webhook payload.
    2.  It validates the payload and extracts the relevant entity ID (e.g., `personId`).
    3.  It executes a highly-targeted workflow (e.g., `SyncSinglePersonWorkflow`) with the specific ID.
    4.  This workflow calls the API Client's `getById` method for that single record and upserts the result into our database.
*   **Purpose:** To provide immediate updates for individual records, making the user experience feel instantaneous.
*   **When It's Used:** This is the preferred method for all create, update, and delete operations for any entity where `supportsWebhooks: true`.

### How They Work Together

These three strategies form a complete data integrity solution:

*   **Webhooks** handle the vast majority of day-to-day changes in real-time.
*   **Delta Syncs** act as a frequent catch-up mechanism, ensuring that any missed webhooks or recent changes are quickly captured.
*   **Reconciliation Sync** is the ultimate safety net, guaranteeing that our data store never permanently drifts from the source of truth by correcting for deletions and other silent inconsistencies.