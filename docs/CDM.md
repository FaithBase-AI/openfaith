## The OpenFaith Canonical Data Model (CDM)

At the heart of OpenFaith is a flexible and extensible Canonical Data Model (CDM) designed to represent core church-related information in a standardized way. This model serves as the "lingua franca" for data within the OpenFaith platform and is the target for transformations when synchronizing with external Church Management Systems (ChMS).

The CDM is defined using [Effect.Schema](https://github.com/Effect-TS/schema), ensuring strong typing, validation, and the ability to derive various representations (e.g., database schemas via Drizzle ORM, API response DTOs).

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
  - `id` (Unique Identifier, typically UUID)
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
* Entity definitions leverage Effect.Schema, facilitating transformation to
  Drizzle ORM / ZeroSQL schemas, including index definitions.
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

### Key Modules and Entity Types (Descriptive Text - already part of your previous README)

_(This is where the existing descriptive text for each module would follow, as generated previously. I'm omitting it here for brevity as it's unchanged, but it would naturally fit after the ASCII diagram and the "Core Entity Principles" summary)._

- **Management:** ...
- **Directory:** ...
- _(etc. for all modules)_

### Special Entity Concepts (Descriptive Text - already part of your previous README)

- **`Folder` (in Collection):** ...
- **`Location` (in Directory):** ...
- **`Edge` (in System):** ...

### Summary (Descriptive Text - already part of your previous README)

The OpenFaith CDM is designed to be a robust, flexible, and schema-enforced foundation...

---

**Notes on the ASCII Diagram section:**

- It's explicitly labeled as a "Text Overview" to set expectations.
- I've tried to incorporate the key notes from the left panel of your visual diagram into section "I. Core Entity Principles & Common Fields" to preserve that important context.
- The module boxes are simple and list the entities.
- It's not a perfect visual replacement but provides a good textual structure that a developer can quickly scan.
- I corrected "Invatation" to "Invitation". If the typo was intentional, you can revert it. I also noted "Household" from the diagram.

This should integrate well into your README!
