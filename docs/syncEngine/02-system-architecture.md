# System Architecture

This document provides a high-level overview of the major components of the Sync Engine and how they interact. Our architecture is designed around the principle of **decoupling**, separating the generic task of communicating with an API from the specific business logic of data synchronization.

## 1. Core Components

The system is composed of two primary packages and their supporting infrastructure:

1.  **The API Client Library (`@openfaith/pco-client`):** A general-purpose, standalone library whose only job is to provide a type-safe and resilient interface for communicating with a specific third-party API (e.g., Planning Center Online).
2.  **The Sync Engine (`@openfaith/sync-engine`):** A durable, distributed application that *uses* the API Client Library to perform long-running data synchronization tasks. It contains all the business logic for orchestration, data transformation, and state management.
3.  **Shared Infrastructure:** The services that support both components, such as a Key-Value Store (like Redis) for distributed state and a SQL Database (like PostgreSQL) for workflow persistence.

### High-Level Diagram

```
+--------------------------+      +--------------------------+
|   External APIs          |      |   Our Application        |
|   (e.g., PCO)            |      |   (e.g., Web UI, etc.)   |
+-------------+------------+      +-------------+------------+
              ^                                  ^
              | (HTTP/S)                         | (Database/API Calls)
              |                                  |
+-------------+----------------------------------+---------------+
|             THE SYNC ENGINE ECOSYSTEM                          |
|                                                                |
|   +--------------------------+      +------------------------+ |
|   | API Client Library       |      | Sync Engine            | |
|   | (@openfaith/pco-client)  | <--- | (@openfaith/sync-eng)  | |
|   |                          | uses |                        | |
|   | - Type-safe Schemas      |      | - Workflow Definitions | |
|   | - Endpoint Definitions   |      | - Data Transformers    | |
|   | - Rate Limiting & Auth   |      | - Sync Orchestration   | |
|   | - Streaming & Pagination |      |                        | |
|   +--------------------------+      +-----------+------------+ |
|             ^                                   |              |
|             |                                   |              |
|   +---------+-----------------------------------+------------+ |
|   |                    Shared Infrastructure                 | |
|   |                                                          | |
|   |  +------------------+      +-------------------------+   | |
|   |  | Key-Value Store  |      | SQL Database            |   | |
|   |  | (e.g., Redis)    |      | (e.g., PostgreSQL)      |   | |
|   |  +------------------+      +-------------------------+   | |
|   +--------------------------------------------------------+ | |
+----------------------------------------------------------------+
```

## 2. The API Client Library

This is the foundation of our integration. It is a reusable package that can be used by any application, not just our sync engine. Its primary goal is to make interacting with the target API as safe and simple as possible.

**Key Responsibilities:**

*   **Type-Safe Communication:** It uses `effect/Schema` to define the shape of API resources. This ensures that all data flowing in and out of the API is validated, preventing entire classes of bugs.
*   **Declarative Endpoint Definition:** Endpoints are defined via a simple configuration object. This includes the path, HTTP method, request/response schemas, and API-specific capabilities (e.g., supported `include` parameters).
*   **Resilient Request Execution:** It transparently handles low-level network complexities.
    *   **Authentication:** Automatically attaches API tokens to every request.
    *   **Rate Limiting:** Manages API rate limits, even in a distributed environment, by using a pluggable key-value store. This prevents `429 Too Many Requests` errors.
    *   **Error Handling:** Maps API-specific error codes (e.g., 401, 422, 503) to a set of canonical, typed errors that the application can easily handle.
    *   **Automatic Retries:** Automatically retries requests that fail due to transient server-side issues (5xx errors).
*   **Efficient Data Fetching:** Provides streaming interfaces (`streamPages`, `streamAll`) to handle large datasets efficiently without loading them into memory.

## 3. The Sync Engine

The Sync Engine is the "brain" of the operation. It's a long-running, distributed application built using **`@effect/cluster`** and **`@effect/workflow`**. Its responsibility is to orchestrate the complex process of data synchronization.

**Key Responsibilities:**

*   **Durable Workflow Execution:** Each sync task (e.g., "Sync all People," "Reconcile Donations") is defined as a durable workflow.
    *   **Durability:** Workflows are persistent. If the application restarts, crashes, or is redeployed, any in-progress workflows will automatically resume from their last completed step. This is powered by a SQL database backend.
    *   **Scalability:** The cluster can distribute workflow executions across multiple server nodes, allowing for horizontal scaling.
*   **Orchestration & Dependency Management:**
    *   **Graph Traversal:** The engine automatically determines the correct order to sync entities based on the hard dependencies defined in the API Client's endpoints (e.g., it knows to sync `Groups` before syncing the `Events` that belong to them).
    *   **Fan-Out:** A single workflow can spawn thousands of child workflows to process dependent data in parallel (e.g., one "Sync All Groups" workflow can start an individual "Sync Events" workflow for each group).
*   **Data Transformation:** It consumes the raw, API-specific data from the client and transforms it into our canonical, internal data model before saving it to our primary application database.
*   **State Management:** It manages the high-level state of the sync process, such as tracking the last successful sync timestamp for delta updates and handling reconciliation for entities that don't support webhooks.