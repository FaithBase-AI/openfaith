## Custom Fields: Extending Your Data Model in OpenFaith

A key aspect of OpenFaith's flexibility is the ability for users and applications to extend the core data model with **Custom Fields**. This allows organizations to capture specific information relevant to their unique ministry context that might not be covered by the standard fields in the OpenFaith Canonical Data Model (CDM). Furthermore, this system provides a standardized way to incorporate fields from external Church Management Systems (ChMS) that do not have direct equivalents in the OpenFaith CDM.

This system is designed to be both powerful and type-safe, leveraging a dedicated `Field` entity for definitions and a `customFields` (typically JSONB) column on core entities for storing the actual values.

### The Need for Custom Fields & Handling External Data

While the OpenFaith CDM aims to be comprehensive, several scenarios necessitate custom fields:

1.  **Organization-Specific Data:**
    - A church might want to track a "Spiritual Gifts Assessment Date" for each `Person`.
    - A youth ministry might need a "Parental Consent Form on File" (boolean) for `Person` entities in their youth `Group`.
2.  **Incorporating Non-Standard External ChMS Fields:**
    - When synchronizing data from an external ChMS, that system may contain fields specific to its platform or customized by the organization within that ChMS (e.g., "PCO Legacy Member ID," "CCB User Defined Field X").
    - If these external fields don't map directly to a standard field in an OpenFaith CDM entity, they are **translated into OpenFaith Custom Fields.** This ensures no data is lost during synchronization and that all relevant information from the external system is accessible within OpenFaith. The ChMS Adapter is responsible for identifying these fields and proposing or creating corresponding `Field` definitions during the sync process.

### Core Components of the Custom Fields System

1.  **`Field` Entity (in the "System" Module):**

    - This entity acts as the **definition repository** for all custom fields available within an organization.
    - **Key Attributes of a `Field` Entity:**
      - `id` (Primary Key for the field definition)
      - `orgId` (The organization this field definition belongs to)
      - `name` (A programmatic name/key for the field, e.g., "spiritualGiftsAssessmentDate", "pcoLegacyMemberId")
      - `label` (A user-friendly display label, e.g., "Spiritual Gifts Assessment Date", "PCO Legacy ID")
      - `targetEntityTypeTags` (Array of strings or a special value for "global": The `_tag`(s) of the OpenFaith entity type(s) this custom field applies to, e.g., `["person"]`, `["person", "group"]`, or `null`/`"global"` if applicable to all/many entity types. This allows a `Field` definition to be:
        - **Scoped to specific entity types:** e.g., "Baptism Date" applies only to "person".
        - **Scoped to multiple entity types:** e.g., a "Project Code" custom field might apply to "event" and "donation".
        - **Global (less common for user data, more for system metadata):** A custom field that could theoretically apply to any entity, though specific applicability will often still be context-dependent.
      - `fieldType` (The data type of the custom field, e.g., "text", "number", "boolean", "date").
      - `description` (Optional: A help text).
      - `options` (JSONB: For `select_single` or `select_multiple` types).
      - `validationRules` (JSONB: Optional rules).
      - `isRequired` (Boolean).
      - `sourceSystem` (String, Optional: If this field originated from an external ChMS, this could store an identifier for that system, e.g., "planning_center_online").
      - `displayOrder` (Integer).

2.  **`customFields` Column on Core Entities:**
    - Most core OpenFaith entities will have a `customFields` (JSONB) column.
    - This column stores the actual key-value pairs for custom fields set for that entity instance.
    - **Example `customFields` value for a `Person` entity (including a field from PCO):**
      ```json
      {
        "spiritualGiftsAssessmentDate": "2023-05-10",
        "pcoFieldMaritalStatus": "Married", // Example of a PCO field not in OpenFaith CDM
        "nextFollowUpStep": "Schedule coffee meeting"
      }
      ```

### How it Works: Definition, Input, Validation, and Storage

1.  **Defining a Custom Field:**

    - **User-Defined:** An administrator creates a new `Field` entity record, specifying its attributes, including `targetEntityTypeTags` to define its scope.
    - **System-Generated (from External Sync):** During synchronization, if a ChMS Adapter encounters a field from the external system that doesn't map to the OpenFaith CDM:
      - It can check if a `Field` definition already exists (perhaps by a conventional `name` like `pco_people_field_xyz` or by looking at `sourceSystem`).
      - If not, it can automatically create a new `Field` definition, inferring the `fieldType` and setting `sourceSystem`. The `targetEntityTypeTags` would correspond to the entity being synced.

2.  **Data Input/Sync:**

    - **Manual Input:** As previously described, UIs dynamically render inputs based on `Field` definitions relevant to the entity being edited.
    - **External Sync:** The ChMS Adapter, after transforming the main CDM fields, places any remaining non-standard external field data into a structure that will be stored in the `customFields` JSONB column, using the appropriate `Field.name` as the key.

3.  **Validation and Schema Generation (Leveraging Effect.Schema):**

    - When entity data (including custom field values from UI input or external sync) is processed:
    - The OpenFaith backend dynamically constructs an `Effect.Schema` for the `customFields` portion.
    - This dynamic schema is built by looking up all `Field` definitions applicable to the `orgId` and the entity's `_tag` (matching against `targetEntityTypeTags`, including handling of "global" definitions if any).
    - For each applicable `Field` definition, a corresponding `effect/Schema` type is generated.
    - The submitted `customFields` data is validated against this dynamic `Effect.Schema`.

4.  **Storage:**

    - Validated `customFields` JSON object is saved into the `customFields` JSONB column of the entity record.

5.  **Data Retrieval and Display:**
    - When an entity is fetched, its `customFields` JSONB data is retrieved.
    - The UI/API consumer again uses relevant `Field` definitions (scoped by `targetEntityTypeTags`) to interpret and display the labels and values.

### Benefits of this Approach

- **User-Driven & System-Driven Extensibility:** Supports both manually defined custom fields and automated handling of non-standard fields from external systems.
- **Data Fidelity:** Ensures data from external ChMS isn't lost if it doesn't fit the OpenFaith CDM perfectly.
- **Scoped or Global Definitions:** `Field` definitions can be precisely targeted to one or more entity types, or defined more broadly if applicable.
- **Centralized Definitions & Type Safety:** As before, maintains data integrity and clarity.
- **Dynamic UIs & API Consistency.**

### Considerations

- **Naming Conflicts:** Care must be taken with `Field.name` to avoid conflicts, especially when auto-generating from multiple external systems. A convention like `externalSystem_originalFieldName` might be useful.
- **Definition Management:** As the number of `Field` definitions grows (especially with auto-generation from syncs), UIs for managing these definitions become important.
- **Global Fields:** While "global" custom fields are possible, their use should be considered carefully. Most custom data is specific to certain entity types. Global custom fields might be more relevant for cross-cutting metadata rather than typical user data.
- Querying, Reporting, Permissions, and Schema Evolution for custom fields remain important considerations as previously noted.

### Conclusion

OpenFaith's custom fields system, with its ability to scope `Field` definitions and automatically translate non-standard external ChMS fields, offers a powerful and adaptive data model. By leveraging a dedicated `Field` entity for definitions and `Effect.Schema` for dynamic validation, OpenFaith ensures that organizations can capture all necessary information—whether defined internally or originating from diverse external sources—while maintaining data integrity and a clear, structured approach.
