## The OpenFaith Canonical Data Model (CDM)

At the heart of OpenFaith is a flexible and extensible Canonical Data Model (CDM) designed to represent core church-related information in a standardized way. This model serves as the "lingua franca" for data within the OpenFaith platform and is the target for transformations when synchronizing with external Church Management Systems (ChMS).

The CDM is defined using [Effect Schema](https://effect.website/docs/schema/introduction/), ensuring strong typing, validation, and the ability to derive various representations (e.g., database schemas via Drizzle ORM, API response DTOs).

### Design Philosophy

- **Modularity:** Entities are grouped into logical **Modules** (e.g., Directory, Domain, Schedule, Giving) that represent common areas of church management. These modules help organize the data model but are designed to be more generic and interconnected than typical siloed ChMS modules.
- **Generality & Extensibility:** The model aims for a balance between defining core structures and allowing for extensive customization through custom fields and user-defined hierarchies.
- **Interconnectedness:** A powerful `Edge` system allows any entity to be related to any other entity, enabling rich and complex data relationships beyond simple parent-child structures.
- **User-Defined Structure:** A generic `Folder` entity allows users to create arbitrary hierarchies and groupings for various types of entities, providing flexibility in how they organize their data.

### ASCII Overview of CDM Structure

```
OpenFaith Canonical Data Model (CDM) - Text Overview

===============================================================================
I. Core Entity Principles & Common Fields
===============================================================================
* Every Entity Type generally includes:
  - `id` (Unique Identifier, using [typeid](https://github.com/jetify-com/typeid): person_xxxx)
  - `_tag` (Primary entity type string, e.g., "person", "group")
  - `orgId` (Organization ID for multi-tenancy)
  - `type` (Optional sub-type or category string)
  - `customFields` (JSONB for user-defined data via 'Field' entity)
  - Timestamps: `createdAt`, `updatedAt`
  - User Tracking: `createdBy`, `updatedBy` (User IDs)
  - Soft Deletion: `deleted` (boolean), `deletedAt`, `deletedBy`
  - `tags` (Array of strings for user-driven categorization)
* (Note: An `externalId` field on core entities is for informational purposes;
  primary linking to external systems is handled by the `ExternalLink` entity).
* Entity definitions leverage Effect Schema, facilitating transformation to
  [Drizzle ORM](https://orm.drizzle.team/docs/overview) / [Zero](https://zero.rocicorp.dev/docs/introduction) schemas, including index definitions.
* The system is built to be a sync engine at its core, with OpenFaith acting
  as the source of truth even when integrating with other ChMS.
* Apps can be built to create new Modules and Entity Types within this framework.

===============================================================================
II. Module Breakdown & Key Entities
===============================================================================

  +------------------+
  |    MANAGEMENT    |
  +------------------+
  | - User           |
  | - OrgUser        |
  | - Organization   |
  | - Roles          |
  +------------------+

  +------------------+
  |    DIRECTORY     |
  +------------------+
  | - Person         |
  | - Household      |
  | - PhoneNumber    |
  | - Email          |
  | - Address        |
  | - Location       |  (Hub/joining entity for addresses, events, etc.)
  | - Invitation     |
  +------------------+

  +------------------+
  |      DOMAIN      |
  +------------------+
  |  (Circles)       |
  |    - Group       |
  |    - Team        |
  |  (Congregation)  |
  |    - Campus      |
  |    - HouseChurch |
  |  (Other)         |
  |    - Association |
  +------------------+

  +------------------+
  |    COLLECTION    |
  +------------------+
  | - List           |  (Filter-based / dynamic grouping)
  | - Folder         |  (Manual / hierarchical grouping)
  | - View           |  (Saved data views/configurations)
  +------------------+

  +------------------+
  |      GIVING      |
  +------------------+
  | - Donation       |
  | - Recurring      |  (Recurring donations)
  +------------------+

  +------------------+
  |     SCHEDULE     |
  +------------------+
  |  (Event Main)    |
  |    - Gathering   |  (Specific event occurrences)
  |    - Service     |  (Plan / template for services)
  |  (Supporting)    |
  |    - Roster      |
  |    - Time        |  (Time slots, event timings)
  +------------------+

  +------------------+
  |      DRIVE       |
  +------------------+
  | - Files          |
  | - Documents      |
  +------------------+

  +------------------+
  | SYSTEM (Global)  |
  +------------------+
  | - Edge           |  (Defines relationships between any two entities)
  | - Field          |  (Definitions for custom fields)
  | - Tag            |  (Manages defined tags)
  | - Activity       |
  | - History        |
  | - Permissions    |
  | - Log            |
  +------------------+

  +------------------+
  |     EXTERNAL     |
  +------------------+
  | - Token          |  (Secure storage for external API credentials)
  | - SyncStatus     |  (Tracks state of synchronization jobs)
  | - ExternalLink   |  (Maps OpenFaith IDs to external system IDs)
  | - Webhooks       |  (Manages incoming webhook configurations)
  +------------------+

===============================================================================
III. Key Cron Jobs (System Operations)
===============================================================================
  - 15min Interval: Synchronize the last 20 minutes of data from external systems.
  - 1 hour Interval: Refresh external API tokens.
```

### Special Entity Concepts

- **`Folder` (in Collection):** A generic, hierarchical entity that can contain other `Folder`s or be linked (via `Edge`s) to any other entity type. This allows users to create custom organizational structures for services, groups, documents, etc., reducing the need for many specialized container-type entities.
- **`Location` (in Directory):** Acts as a "hub" or joining entity. It doesn't just store an address but can be linked (via `Edge`s) to an `Address`, `Gathering`/`Service` entities (where events occur), `Time` entities (operating hours), and potentially `Resource` entities available at that location.
- **`Edge` (in System):** The backbone of relationships. Instead of numerous foreign keys or join tables for specific relationships, `Edge`s provide a universal way to connect `(Source Entity) --[Relationship Type]--> (Target Entity)`, with optional properties on the edge itself.

### Summary

The OpenFaith CDM is designed to be a robust, flexible, and schema-enforced foundation. By using a common set of core fields, a powerful `Edge` system for relationships, generic `Folder`s for hierarchy, and clear distinctions for `System` and `External` integration entities, it aims to provide a comprehensive yet adaptable model for church data that can evolve and integrate with a wide array of external systems.
