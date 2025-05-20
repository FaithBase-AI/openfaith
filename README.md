# OpenFaith: The Universal Church Management Sync & Data Platform

**OpenFaith is an open-source initiative to create a standardized, flexible, and extensible platform for synchronizing, managing, and intelligently interacting with church data across various Church Management Systems (ChMS) and church-related applications.**

A core design philosophy of OpenFaith is its adaptability. The platform's [Canonical Data Model (CDM)](/docs/CDM.md) and architectural principles like [Sub-Typing](/docs/SubTypes.md) and [Edge-Based Relationships](/docs/EdgeRelationships.md) are engineered to serve not just traditional local churches, but a diverse spectrum of faith-based organizations, including missions, parachurch ministries, and denominations / church networks. This ensures OpenFaith can be tailored to fit various operational needs beyond standard ChMS functionalities. ([Learn more about Adapting for Diverse Ministries](/docs/DiverseMinistries.md))

Our vision is to empower churches and developers by:

1.  Providing a **Canonical Data Model (CDM)** for core church entities, designed for both structured access and AI-driven interaction.
2.  Offering a robust **Sync Engine** to enable bi-directional data flow between OpenFaith and external ChMS platforms (like Planning Center, Church Community Builder, Breeze, etc.).
3.  Establishing an **Open Specification** for how applications can integrate and share data within the OpenFaith ecosystem.
4.  Delivering a suite of **Open Source Libraries and Tools**, including those that facilitate an AI-first approach to data engagement.
5.  Enabling **intelligent data interaction** through natural language, allowing users to query, command, and automate tasks using Large Language Models (LLMs).

Ultimately, OpenFaith aims to break down data silos, reduce manual data entry, foster innovation by allowing different church software solutions to work together seamlessly, and unlock new ways to gain insights and manage ministry through AI.

## Key Docs

- [Canonical Data Model (CDM)](/docs/CDM.md)
- [ChMS Adapters](/docs/ChMSAdapters.md)
- [AI-First Architecture](/docs/AIArch.md)
- [External Links](/docs/ExternalLinks.md)
- [Sync Engine](/docs/SyncEngine.md)
- [Schema Design](/docs/SchemaDesign.md)
- [`Edge`-Based Relationships](/docs/EdgeRelationships.md)
- [Custom Fields](/docs/CustomFields.md)
- [User-defined Hierarchical Structures](/docs/Folders.md)
- [Sub Types](/docs/SubTypes.md)
- [FE SDK](/docs/FESdk.md)
- [Client Sync](/docs/ClientSync.md)
- [Adapting for Diverse Ministries](/docs/DiverseMinistries.md)
- [Authentication and Authorization](/docs/Authentication.md)
- [Permissions and Secure Data Access](/docs/Permissions.md)

## Core Architectural Principles

- **[Canonical Data Model (CDM)](/docs/CDM.md):** OpenFaith defines its own internal, standardized representation for core church entities (e.g., Person, Group, Team, Event, Donation). This CDM, defined using [Effect Schema](https://effect.website/docs/schema/introduction/), serves as the "lingua franca" for all data within the system and is structured to support AI tool usage.
- **[Adapter/Connector Pattern](/docs/ChMSAdapters.md):** For each external ChMS or application, an "Adapter" is responsible for understanding that system's API, authentication, and data structures. Adapters translate data between the external system's format and the OpenFaith CDM.
- **[Sync Engine](/docs/SyncEngine.md):** A central orchestrator manages sync jobs, handles change detection (via webhooks or polling), implements conflict resolution strategies, and maintains sync state.
- **[Schema-Driven](/docs/SchemaDesign.md):** Data shapes, transformations, and even parts of connector behavior are driven by schemas and declarative configurations, complemented by code for complex logic.
- **[AI-First Design](/docs/AIArch.md):** The platform is architected with intelligent interaction in mind. The CDM and its access layers are designed as "active schemas" with built-in tooling, enabling Large Language Models (LLMs) to understand the data model, query information, and perform actions via natural language.
- **[`Edge`-Based Relationships](/docs/EdgeRelationships.md):** A generic `Edge` entity allows flexible, many-to-many relationships between any entities in the system, enabling rich data modeling that AI can also leverage.
- **[Sub-Typing for Adaptability](/docs/SubTypes.md):** Core entities utilize a `type` field, allowing organizations to define specialized variations (e.g., a "Team" as a `type` of "Circle") to match their specific ministry language without altering the fundamental data model.
- **[Authentication & Authorization](/docs/Authentication.md):** Utilizes a dedicated library (e.g., Better Auth) for robust Authentication (AuthN), while implementing its own [Role-Based Access Control (RBAC) system with contextual scoping](/docs/Permissions.md) for Authorization (AuthZ), ensuring secure, granular, and ministry-aware data access.
- **Extensibility:** Designed for [custom fields](/docs/CustomFields.md), [user-defined hierarchical structures](/docs/Folders.md) (via a generic `Folder` entity), and future support for dynamically created modules and entity types.

## Key Components

- **OpenFaith Core:**
  - **Database:** (e.g., PostgreSQL) Storing canonical data, external links, sync state, etc.
  - **API Layer & Intelligent Tooling:** Exposing OpenFaith data and functionality through structured APIs for traditional applications, and a rich set of "tools" or "functions" for AI/LLM interaction.
  - **Canonical Data Schemas:** Defined with Effect Schema, providing the structure for both programmatic and AI-driven access.
- **Universal Sync Engine (USE):**
  - **Connector Manager:** Loads and manages Adapters.
  - **Job Scheduler & Workers:** Handles polling, retries, rate limiting, and background tasks.
  - **Webhook Ingestor:** Receives and processes webhooks from external systems.
  - **Transformation Engine:** (Logic embedded within Adapters) Converts data between external formats and the CDM.
  - **State Manager:** Tracks `last_synced_timestamp`, ID mappings, etc.
  - **Conflict Resolution Module:** (e.g., "Last Write Wins" as a starting point).
- **[ChMS Adapters (Connectors)](/docs/ChMSAdapters.md):** Pluggable modules, one for each external system.
- **LLM Orchestration Layer (Conceptual):** A component responsible for managing interactions with LLMs, including prompt engineering, tool dispatch, and response handling. _(More details in [AI-First Architecture](/docs/AIArch.md))._
- **[Frontend SDK](/docs/FESdk.md):** A library of pre-built, customizable React components (using shadcn/ui) and helper functions to dynamically generate UI (tables, forms) from the OpenFaith Canonical Data Model schemas. This accelerates UI development and ensures consistency, also supporting AI chat interactions for displaying data and forms.
- **[Client Sync Engine (via Zero)](/docs/ClientSync.md):** Leverages Zero to provide instantaneous, local-first application experiences with real-time, query-driven synchronization of OpenFaith CDM data to client devices.

## Connector Definition: Code-First Integration

To integrate with an external ChMS, OpenFaith uses **code-defined Adapters written in TypeScript.** This approach provides maximum flexibility and power to handle the diverse and often complex nature of external APIs.

Each Adapter (typically a TypeScript class or a collection of well-defined functions within a module) is responsible for:

1.  **Configuration Management:**
    - Storing or programmatically accessing necessary metadata such as base API URLs, external entity names, API version details, and paths for critical data points (like unique IDs or last-updated timestamps).
    - Implementing or utilizing shared mechanisms for authentication against the external system (e.g., handling OAuth2 token refresh cycles, managing API key injection).
2.  **API Interaction Logic:**
    - Providing methods to perform CRUD (Create, Read, Update, Delete) and List operations for each entity it supports within the external ChMS.
    - Encapsulating the logic for constructing API requests, including correct parameterization for pagination, filtering, sorting, and any specific "include" directives or query languages of the target API.
3.  **Data Transformation:**
    - Implementing robust functions to normalize raw API responses from the external system into a consistent intermediate format if necessary.
    - Clearly defining the transformation pathways to convert data from the external system's structure to the OpenFaith Canonical Data Model (CDM).
    - Conversely, transforming data from the OpenFaith CDM into the precise format expected by the external API for creation or update operations.
4.  **Webhook Processing (if applicable):**
    - Containing the logic to parse, validate, and interpret incoming webhook payloads from the external system.
    - Extracting meaningful events and data from webhooks and translating them into actions or data updates within the OpenFaith sync engine.
5.  **Sync Strategy & Metadata:**
    - Exposing information about its capabilities and requirements, such as whether webhooks are supported, any dependencies between entities for correct import ordering, or specific fields used for incremental polling (e.g., an `updated_at` timestamp).
    - Implementing custom error handling routines or retry strategies tailored to the known behaviors or quirks of the specific external API.

The Universal Sync Engine discovers these TypeScript-based Adapters, instantiates them (or invokes their functions) with appropriate organization-specific configurations (like API credentials), and then utilizes their defined methods to orchestrate the entire data synchronization process. This code-first methodology ensures that all nuances of integrating with a diverse range of external APIs can be handled with the full power and expressiveness of TypeScript.

## AI-Powered Interaction

A core goal of OpenFaith is to enable users to interact with their data through natural language. The [AI-First Architecture](/docs/AIArch.md) details how the OpenFaith CDM is designed with "tool calls" for each entity, allowing LLMs to understand and access the data model. This includes generating system prompts that guide the LLM and providing a secure fallback to SQL for complex queries when necessary, all while respecting user permissions. This transforms the CDM from a passive data store into an active, intelligent interface.

## Getting Started (Conceptual Roadmap)

1.  **Define Core CDM Schemas:** Solidify Effect Schema definitions for key entities (Person, Group, Folder, Edge, ExternalLink, etc.), keeping AI tool definitions in mind.
2.  **Develop the Sync Engine Basics:**
    - Job queue system for managing tasks.
    - Initial implementation of the `ExternalLink` table and logic.
    - Connector Manager to load and interact with TypeScript-based Adapters.
3.  **Build the First Adapter (in TypeScript):**
    - Building out for PCO first and then following on with CCB.
    - Implement the Adapter module/class for its "People" entity, handling authentication, API calls, and transformations to/from the OpenFaith Person CDM.
4.  **Implement Initial Sync Logic:** Focus on the phased approach (staging external IDs, matching, creating new, full data sync), orchestrated by the Sync Engine using the Adapter methods.
5.  **Implement Incremental Sync Logic:** Polling based on `updatedAtPath` (exposed by the Adapter) and webhook ingestion (handled by Adapter logic).
6.  **Develop Core Application UI (Editor/Data Vis):** To interact with and visualize OpenFaith data.
7.  **(Future) Develop AI Interaction Layer:** Implement the LLM Orchestration Layer and define the initial set of AI tools for core CDM entities.

## Contributing

OpenFaith is an ambitious project, and community contributions are welcome! (Details on contribution guidelines, code of conduct, and specific areas needing help will be added here as the project matures).

## License

This project will be licensed under an open-source license (e.g., MIT or Apache 2.0 - TBD).
