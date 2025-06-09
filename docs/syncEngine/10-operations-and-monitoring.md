# 10: Operations and Monitoring

This document is a practical guide for engineers responsible for the operational health and maintenance of the Sync Engine. It covers how to monitor the system's status, diagnose problems, and perform common administrative tasks.

## 1. How to Check Sync Status

The state of every workflow is persisted in the PostgreSQL database used by `@effect/cluster`. This provides a single source of truth for the status of all sync jobs.

### A. Querying the Workflow Database

You can directly query the `workflows` table to get a high-level overview of all running and failed jobs.

```sql
-- Find all workflows that are currently in a failed state
SELECT
  id,
  name,
  status,
  payload,
  created_at,
  updated_at,
  result ->> 'message' as error_message -- Extract the error message from the JSONB result
FROM workflows
WHERE status = 'failed'
ORDER BY updated_at DESC;
```

*   **`id`**: The unique execution ID of the workflow.
*   **`name`**: The name of the workflow (e.g., `Sync-people.people.getAll`).
*   **`status`**: The current status (`running`, `paused`, `completed`, `failed`).
*   **`payload`**: The input parameters the workflow was started with.
*   **`result`**: A JSONB column containing the success value or the structured `ApiError` on failure.

### B. Using the (Future) Admin UI

*(This section describes a planned feature).*

A dedicated admin UI will be built to provide a user-friendly interface for monitoring workflows. It will allow you to:
*   View a list of all workflows with filtering and searching.
*   Drill down into a specific workflow's execution history and view its logs.
*   See the payload it was started with and the error it failed with.
*   Manually trigger retries for failed workflows.

## 2. Interpreting Logs

The Sync Engine produces structured JSON logs for all significant events. You can trace the entire lifecycle of a sync job by filtering logs by its `executionId`.

**Key Log Annotations:**

*   **`workflowName`**: The name of the workflow being executed.
*   **`workflowId`**: The unique execution ID.
*   **`activityName`**: The name of the specific durable activity being run.
*   **`errorTag`**: If an error occurred, this will contain our canonical error tag (e.g., `ValidationError`, `RateLimitError`).

**Example Log Search (in a log management tool like Datadog or Splunk):**
`json.workflowId:"<the-execution-id-from-the-db>"`

This will show you the full history of the job, including every page it processed and the exact point of failure.

## 3. Common Failure Modes & Recovery Playbook

This is a guide for what to do when you receive an alert.

#### **Scenario 1: Alert fires for `ApiError` with `tag: 'ValidationError'` or `tag: 'ConflictError'`**

*   **Meaning:** The third-party API rejected our data. This is almost always a permanent error caused by a data issue or a bug.
*   **Diagnosis:**
    1.  Find the failed workflow in the database to get its `executionId`.
    2.  Use the `executionId` to find the logs for that specific run.
    3.  Examine the `error.cause` in the log entry. It will contain the structured response body from the API, telling you exactly which field was invalid (e.g., `source.pointer: "/data/attributes/email"`).
*   **Action:**
    *   **Do not retry the workflow.** It will fail again with the same error.
    *   File a bug report for the engineering team, including the `executionId` and the error payload.
    *   The issue will require a code fix in our data transformer or a manual correction of the source data.

#### **Scenario 2: Alert fires for `ApiError` with `tag: 'InternalServerError'` or `tag: 'ServiceUnavailableError'`**

*   **Meaning:** The third-party API is having problems. Our client's automatic retry policy (`backoff`) likely failed after several attempts.
*   **Diagnosis:**
    1.  Check the third-party API's official status page. There is likely an ongoing incident.
    2.  Find the failed workflow(s) in the database.
*   **Action:**
    1.  **Acknowledge the alert.** No immediate code change is needed from our side.
    2.  Once the third-party API's incident is resolved, you can manually trigger a retry for the failed workflows via the Admin UI or a CLI command. The workflows will resume from the last successful activity.

#### **Scenario 3: A workflow is stuck in `running` state for an unusually long time.**

*   **Meaning:** This could indicate a "poison pill" message or a bug in our workflow logic causing an infinite loop. It could also mean the workflow is simply processing an enormous amount of data.
*   **Diagnosis:**
    1.  Find the workflow's `executionId` in the database.
    2.  Check its `updated_at` timestamp. If it's not changing, the workflow might be stuck.
    3.  Examine the logs for that `executionId`. Look for repeating log messages or a lack of progress.
*   **Action:**
    1.  This is a high-priority issue. Escalate to the engineering team immediately.
    2.  The team may need to manually terminate and inspect the workflow.

## 4. How to Trigger a Manual Sync

You can manually trigger syncs using a provided CLI tool. This is useful for onboarding a new organization, retrying a large failed job, or forcing a reconciliation.

```bash
# Trigger a full sync for a specific organization
sync-tool workflow start SyncAllPeople --payload '{"orgId": "org_123"}'

# Trigger a reconciliation for a specific entity
sync-tool workflow start ReconcileDonations --payload '{"orgId": "org_456"}'
```
This command sends a message to the cluster, which will then schedule and execute the workflow on an available node.