## OpenFaith ChMS Adapters: Bridging External Systems to the Canonical Model

ChMS Adapters (or simply "Connectors") are a fundamental component of the OpenFaith platform, acting as the crucial bridge between external Church Management Systems (ChMS) or other applications and the OpenFaith Canonical Data Model (CDM). Each Adapter is a dedicated, code-defined module (written in TypeScript) responsible for encapsulating all the specific knowledge required to interact with a particular external system's API.

The primary goal of the Adapter pattern in OpenFaith is to abstract away the unique complexities of each external API, allowing the core Sync Engine to operate with a standardized interface for fetching, transforming, and pushing data.

### Problems Solved by ChMS Adapters

Manually integrating with multiple, diverse APIs is a time-consuming, error-prone, and repetitive task. ChMS Adapters are designed to solve these common problems:

1.  **Repetitive CRUD Implementation:**

    - **Problem:** For every entity (People, Groups, Donations) in every ChMS, developers typically rewrite boilerplate code for basic Create, Read, Update, Delete, and List (CRUDL) operations, including HTTP request construction, header management, and response parsing.
    - **Adapter Solution:** Adapters provide a standardized set of methods (e.g., `listRecords()`, `getRecordById()`, `createRecord()`, `updateRecord()`) for each entity they support. The core Sync Engine calls these common methods, while the Adapter internally handles the specific API endpoint paths, HTTP methods, and request/response structures for the target ChMS.

2.  **Data Transformation Complexity:**

    - **Problem:** Each external ChMS has its own unique data schema, field names, data types, and relationship structures. Manually mapping this data to a common internal format (and vice-versa) for every integration point is complex and leads to inconsistent transformation logic.
    - **Adapter Solution:** Each Adapter contains dedicated transformation logic to:
      - Convert raw data from the external API response into a normalized internal representation of that external data.
      - Map this normalized external data to the OpenFaith Canonical Data Model (CDM).
      - Conversely, map data from the OpenFaith CDM into the specific format required by the external API for create or update operations.
        This centralizes transformation logic per ChMS, ensuring consistency and leveraging the strongly-typed OpenFaith CDM (defined with Effect.Schema).

3.  **Handling Diverse API Pagination Schemes:**

    - **Problem:** APIs implement pagination in various ways (offset-based, cursor-based, page number, link headers). Writing custom pagination logic for each endpoint and each ChMS is tedious.
    - **Adapter Solution:** The Adapter's `listRecords()` method (or similar) encapsulates the specific pagination strategy of the external API. It handles fetching subsequent pages transparently, presenting a unified stream or complete list of records to the Sync Engine, which can then request data in manageable chunks if needed. The Adapter itself knows how to ask for "the next set" from the external system.

4.  **Managing Authentication Mechanisms:**

    - **Problem:** Different APIs use different authentication schemes (OAuth 2.0, API Keys in headers, API Keys in query parameters, Basic Auth). Implementing and securely managing these for each system is non-trivial.
    - **Adapter Solution:** While the core Sync Engine might manage the secure storage of credentials (e.g., in the `Token` entity), the Adapter is responsible for using these credentials correctly to authenticate with the external API. This includes:
      - Knowing where to place API keys (header, query).
      - Implementing the OAuth 2.0 token acquisition and refresh flow if necessary, often utilizing a shared OpenFaith authentication service or library.
      - Adding appropriate `Authorization` headers to requests.

5.  **API-Specific Query Parameters, Filters, and Includes:**

    - **Problem:** APIs offer different ways to filter, sort, and include related data (e.g., PCO's `where[field]=value` and `include=related_resource`, CCB's `search_v2.php` parameters).
    - **Adapter Solution:** The Adapter exposes methods that accept generic filter/sort/include criteria defined by OpenFaith. The Adapter then translates these generic criteria into the specific query parameter syntax required by the external ChMS API.

6.  **Rate Limiting Adherence:**

    - **Problem:** External APIs enforce rate limits. Violating these can lead to temporary or permanent blocks.
    - **Adapter Solution:** While the core Sync Engine's job queue might provide a global rate-limiting mechanism, the Adapter itself can contain metadata about the specific rate limits of the ChMS it connects to. It can also implement more nuanced rate-limiting behavior if required by the API (e.g., different limits for different types of requests), often by interacting with a shared rate-limiting service within OpenFaith.

7.  **Webhook Processing and Validation:**

    - **Problem:** Webhook payloads vary significantly between systems in terms of structure, data provided (full object vs. just ID), and security (signature verification).
    - **Adapter Solution:** Adapters contain dedicated logic to:
      - Parse the incoming webhook payload according to the external system's format.
      - Validate webhook signatures if applicable.
      - Extract the relevant event type (create, update, delete) and entity identifiers.
      - Transform the webhook data into a standardized format that the Sync Engine can process.

8.  **API Idiosyncrasies and Error Handling:**
    - **Problem:** APIs have quirks, non-standard error responses, or specific sequences of calls needed for certain operations.
    - **Adapter Solution:** The Adapter is the place to encapsulate this system-specific knowledge, providing a cleaner interface to the Sync Engine. It can interpret unique error codes from the external API and translate them into standardized OpenFaith errors or trigger specific retry logic.

### Structure of a ChMS Adapter (Conceptual)

Each ChMS Adapter is typically a TypeScript module containing one or more classes or collections of functions that implement a standardized interface defined by OpenFaith. This interface might include methods like:

- **Configuration & Authentication:**
  - `constructor(orgConfig: OrgSpecificAdapterConfig, tokenProvider: ITokenProvider)`: Initializes with org-specific settings and an auth token provider.
  - `getBaseUrl(): string`
  - `getAuthHeaders(): Promise<Record<string, string>>`
- **Entity Operations (repeated for each supported entity like Person, Group, etc.):**
  - `listPeople(params: OpenFaithListParams): Promise<{ records: MyPerson[], nextPageToken?: string }>`
  - `getPersonById(externalId: string, params: OpenFaithReadParams): Promise<MyPerson | null>`
  - `createPerson(data: MyPerson): Promise<{ newExternalId: string, createdRecord?: MyPerson }>`
  - `updatePerson(externalId: string, data: MyPerson): Promise<MyPerson | null>`
  - `deletePerson?(externalId: string): Promise<void>`
- **Transformation Logic (internal or exposed):**
  - `_normalizeRawPCOPersonResponse(apiResponse: any): PCONormalizedPerson`
  - `_transformPCONormalizedPersonToCanonical(pcoPerson: PCONormalizedPerson): MyPerson`
  - `_transformCanonicalPersonToPCOPayload(person: MyPerson): PCOApiPayload`
- **Webhook Handling:**
  - `processPersonWebhook(payload: any): Promise<{ eventType: string, canonicalRecord?: MyPerson, externalId: string }>`
- **Metadata & Capabilities:**
  - `getEntityDependencies(entityType: string): string[]` (for sync order)
  - `isWebhookSupported(entityType: string): boolean`
  - `getIdPath(entityType: string): string` (JSONPath to ID in external record)
  - `getUpdatedAtPath(entityType: string): string` (JSONPath to updated_at in external record)

### Benefits of the Adapter Approach

- **Modularity & Maintainability:** Each Adapter is self-contained, making it easier to develop, test, and update integrations for one ChMS without impacting others.
- **Reusability:** The core Sync Engine code is generic and reusable across all integrations.
- **Testability:** Adapters and their transformation logic can be unit-tested independently.
- **Scalability:** New ChMS integrations can be added by developing new Adapters without modifying the core Sync Engine.
- **Developer Experience:** Provides a clear pattern and set of responsibilities for developers building new integrations.

By centralizing the complexities of external API interactions within dedicated Adapters, OpenFaith aims to create a more manageable, robust, and scalable data integration platform.
