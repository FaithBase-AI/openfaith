## OpenFaith: An AI-First Platform – Intelligent Data Interaction

Beyond robust synchronization and a flexible Canonical Data Model (CDM), OpenFaith is architected to be an **AI-First platform**. This means the system is designed from the ground up to facilitate seamless, intelligent, and powerful interactions with church data through Large Language Models (LLMs) and AI-driven capabilities.

Our goal is to transform how users access, manipulate, and gain insights from their church management information, moving beyond traditional UIs to natural language conversations and AI-powered automation.

### The Vision: AI as a Core Interface

Imagine users being able to:

- **Query complex data in natural language:** "Show me all small group leaders in the North Campus whose groups haven't reported attendance in the last two weeks."
- **Perform actions via commands:** "Create a new event for the 'Youth Hangout,' schedule it for next Friday at 7 PM in the Youth Hall, add it to the public calendar, and draft an invitation email to all youth group members."
- **Automate workflows:** "Every Monday morning, find new members from the weekend services, send them a welcome email template, and create a follow-up task for the pastoral care team."
- **Generate insights and reports:** "What are the giving trends for the missions fund over the past year, and are there any notable demographic patterns among new givers?"

To achieve this, the OpenFaith CDM is more than just a passive schema; it's an **active, intelligent layer** equipped for AI interaction.

### Core Pillars of OpenFaith's AI-First Architecture

1.  **Intelligent CDM & Tooling (The "Active Schema"):**

    - Each core entity and module within the OpenFaith CDM (e.g., Person, Group, Event, Donation, Folder, Edge) will be exposed to the AI layer through a set of well-defined **"tools" or "functions."**
    - These tools are analogous to the ChMS Adapters used for external sync but are designed for _internal_ data access and manipulation based on the OpenFaith CDM.
    - **Tool capabilities will include:**
      - **CRUDL Operations:** Creating, reading (single and lists), updating, and deleting entities.
      - **Relationship Management:** Creating, querying, and removing `Edge` connections between entities.
      - **Specialized Actions:** Higher-level business logic operations (e.g., `find_available_rooms(criteria)`, `get_group_attendance_summary(groupId, dateRange)`, `process_new_donation_workflow(donationData)`).
    - Each tool will have a clear definition (name, description, input parameters with types, output schema) that LLMs can understand and request to use (akin to OpenAI's Function Calling or similar mechanisms).

2.  **LLM Orchestration Layer:**

    - A central service responsible for managing all interactions with the chosen LLM(s).
    - **Responsibilities:**
      - Receiving natural language input from users or other system components.
      - Constructing appropriate prompts (including system prompts and user queries) for the LLM.
      - Sending requests to the LLM.
      - Receiving responses, which may include requests to call specific OpenFaith tools.
      - Dispatching tool calls to the "Intelligent CDM & Tooling" layer.
      - Sending tool execution results back to the LLM for further processing or final response generation.
      - Formatting the LLM's final output for the user or system.

3.  **Dynamic Prompt Engineering & Context Management:**

    - The system will dynamically generate rich **system prompts** to provide the LLM with the necessary context to operate effectively and safely. These prompts will include:
      - An overview of the OpenFaith CDM: Key modules, entity types, and their primary attributes.
      - A manifest of available tools, their descriptions, and how to use them.
      - The current user's context: Organization ID, roles, and relevant permissions to guide data access.
      - Data formatting preferences or constraints.
      - Instructions on when and how to consider using the SQL fallback mechanism.
    - The context provided in each turn of a conversation will also be carefully managed.

4.  **Secure Data Access & Permission Enforcement:**

    - Crucially, all tool calls initiated by the LLM (and any fallback SQL queries) will be executed **within the security context of the authenticated user.**
    - OpenFaith's existing permission system (RBAC with campus scoping, etc.) will be strictly enforced. The LLM itself does not bypass permissions; it requests actions that are then validated and executed by the OpenFaith backend.
    - This ensures data privacy and adherence to organizational access controls.

5.  **Hybrid Querying: Tools & SQL Fallback:**
    - **Primary Interaction:** LLMs will be guided to use the predefined, strongly-typed **tools** associated with the CDM for most data retrieval and manipulation tasks. This is safer, more predictable, and easier to secure.
    - **SQL Fallback Mechanism:** For highly complex, ad-hoc queries that are not well-covered by existing tools (e.g., multi-step aggregations, obscure joins not anticipated by standard tools), the system will allow for a fallback:
      1.  The LLM, based on its understanding and the system prompt, might determine that a direct SQL query is the most efficient way to answer a complex user request.
      2.  It could attempt to **generate a SQL query** (read-only by default for safety).
      3.  This generated SQL will be passed to a **secure SQL execution service** within OpenFaith.
      4.  **Crucial Safeguards for SQL Fallback:**
          - **Validation & Sanitization:** Generated SQL must be rigorously validated against a schema-aware allowlist of operations, tables, and functions to prevent SQL injection or unintended data modification/exposure.
          - **Read-Only Preference:** Strongly prefer read-only SQL generation. Write operations via SQL fallback should be extremely restricted or disallowed.
          - **Resource Limiting:** Queries should be resource-limited (query time, rows returned).
          - **Permission Enforcement:** The SQL query must still be executed under the user's database role and permissions.
          - **Auditing:** All generated and executed SQL queries will be logged.
      - The results of the SQL query are then returned to the LLM to formulate a natural language response.

### How This Differs from Standard API Access

While a traditional API also allows programmatic access, the AI-first approach with "Intelligent CDM & Tooling" is specifically tailored for LLM interaction:

- **Natural Language Interface:** The primary goal is to enable interaction through conversation.
- **Tool Discoverability for LLMs:** Tools are described in a way LLMs can understand and choose to use.
- **LLM-Driven Orchestration:** The LLM helps decide _which_ tools to call in _what sequence_ to fulfill a user's intent.
- **Contextual Understanding:** The system actively works to provide the LLM with relevant context.

### Example Workflow (AI Interaction)

1.  **User:** "Who are the new members that joined last week in the South Campus?"
2.  **OpenFaith UI/Interface:** Sends this query to the LLM Orchestration Layer.
3.  **LLM Orchestration Layer:**
    - Constructs a prompt with system instructions, tool definitions (e.g., `list_people_tool`, `filter_by_date_tool`, `filter_by_campus_tool`), and user context.
    - Sends to LLM: "User wants new members from last week in South Campus. Available tools: `list_people_tool(filters: [{field, operator, value}], include_relations: [...])`..."
4.  **LLM (Responds to Orchestrator):** "I should call `list_people_tool` with filters: `[{field: 'join_date', operator: 'within_last_7_days'}, {field: 'campus_id', operator: 'equals', value: 'south_campus_id'}]`."
5.  **LLM Orchestration Layer:**
    - Parses the tool call request.
    - Invokes the internal `list_people_tool` via the Intelligent CDM layer, applying the filters. This execution respects the user's permissions (e.g., can they see people in South Campus?).
6.  **Intelligent CDM Layer:** Executes the query against the OpenFaith database (potentially constructing a safe, parameterized SQL query internally based on the tool's logic).
7.  **LLM Orchestration Layer:** Receives the list of people (as structured data) from the tool.
    - Sends the tool execution result back to the LLM: "Tool `list_people_tool` returned: `[{name: 'Alice', ...}, {name: 'Bob', ...}]`."
8.  **LLM (Responds to Orchestrator):** "The new members who joined last week in the South Campus are Alice Smith and Bob Johnson."
9.  **LLM Orchestration Layer:** Sends this final natural language response to the User Interface.

### Conclusion

By designing OpenFaith as an AI-First platform, we aim to unlock unprecedented levels of usability, automation, and insight generation from church data. The Intelligent CDM with its built-in tooling, coupled with robust LLM orchestration and secure data access mechanisms (including a careful SQL fallback), will provide a powerful and intuitive way for users to interact with their information, truly making data work for ministry. This approach positions OpenFaith at the forefront of next-generation church management technology.
