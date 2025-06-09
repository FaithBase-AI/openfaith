# 06: Sync Engine Architecture

This document provides a high-level overview of the Sync Engine's architecture. While the **API Client Library** handles the "how" of communicating with an external API, the **Sync Engine** is responsible for the "what" and "when" of the data synchronization process.

It is a stateful, durable, and scalable application designed to orchestrate complex data flows reliably.

## 1. Core Responsibility

The Sync Engine's primary purpose is to act as a **durable conductor**. It uses the stateless API Client as its instrument to perform complex, long-running data synchronization tasks. Its responsibilities include:

*   **Orchestration:** Executing sync jobs in the correct order based on data dependencies.
*   **Durability:** Ensuring that sync processes can survive restarts, deployments, and transient failures without losing state or corrupting data.
*   **State Management:** Keeping track of the progress of each sync, such as the last record processed or the timestamp of the last successful update.
*   **Scalability:** Distributing the workload across multiple server nodes to handle large amounts of data and a high number of concurrent sync jobs.
*   **Data Transformation:** Converting data from the API's canonical format into the schema required by our primary application database.

## 2. Technology Choices

To meet these demanding requirements, the Sync Engine is built upon two core technologies from the Effect-TS ecosystem: **`@effect/cluster`** and **`@effect/workflow`**.

### A. `@effect/cluster`: For Scalability and Fault Tolerance

A single server cannot handle the workload of syncing data for thousands of organizations simultaneously. `@effect/cluster` allows us to run the Sync Engine as a cohesive group of nodes that work together.

*   **What it is:** A framework for building distributed, fault-tolerant applications.
*   **Why we use it:**
    *   **Horizontal Scaling:** We can add more nodes to the cluster to increase our overall processing capacity. The cluster automatically distributes work across all available nodes.
    *   **Fault Tolerance:** If a node crashes, the cluster detects it and automatically re-assigns its work to healthy nodes. This ensures the system as a whole remains operational.
    *   **Location Transparency:** We can send a command to the cluster (e.g., "start sync for organization X") without needing to know which specific node will execute it.

### B. `@effect/workflow`: For Durability and Observability

A sync job can take minutes, hours, or even days to complete. It is unacceptable for such a process to lose its progress due to a server restart or a network blip. `@effect/workflow` solves this by making our business logic durable.

*   **What it is:** A framework for defining and executing long-running, persistent, and resumable processes.
*   **Why we use it:**
    *   **Durability:** Every sync job is modeled as a workflow. The state of each workflow is automatically persisted to a SQL database (PostgreSQL) at each step. If the application restarts, all in-progress workflows resume from exactly where they left off.
    *   **Observability:** Because the state of every workflow is in a database, we have a complete, queryable history of all sync jobs. We can easily build dashboards or admin panels to see what's running, what has completed, and what has failed.
    *   **Durable Timers & Activities:** Workflows can safely schedule future work (e.g., "retry this in 5 minutes" or "run a reconciliation sync in 24 hours") and execute individual steps (`Activities`) with at-most-once guarantees.

## 3. The Sync Lifecycle

The Sync Engine manages several types of sync jobs, each designed for a specific purpose. A complete data integration relies on all of them working together.

```
                                     +---------------------------+
                                     |   Webhook Event           |
                                     | (e.g., Person Updated)    |
                                     +-------------+-------------+
                                                   | (Real-time)
                                                   v
+---------------------+      +---------------------+      +------------------------+
| Initial Full Sync   |----->| Periodic Delta Sync |----->| Nightly Reconciliation |
| (Onboarding)        |      | (Every 15 mins)     |      | (Detects Deletions)    |
+---------------------+      +---------------------+      +------------------------+
  |         ^                        |                              |
  |         | (Manual Trigger)       |                              |
  +---------+------------------------+------------------------------+
            |
            v
+------------------------------------------------------------------+
|                          Our Application DB                      |
|                         (The Source of Truth)                    |
+------------------------------------------------------------------+
```

*   **Initial Full Sync:** Triggered when a new organization connects their account. This workflow fetches *all* historical data for every entity in the correct dependency order.
*   **Periodic Delta Sync:** The most common type of sync. It runs on a schedule (e.g., every 15 minutes) and uses the `deltaSyncField` (`updated_at`) to fetch only the records that have changed since the last run.
*   **Nightly Reconciliation Sync:** A critical "janitor" process. It fetches all record IDs from the source API and compares them to our database to detect records that were deleted in the source system. This is the only reliable way to handle deletions for APIs without deletion webhooks.
*   **Webhook-Triggered Updates:** For APIs that support webhooks, incoming events trigger a small, targeted workflow to sync the changes for a single record in near real-time.