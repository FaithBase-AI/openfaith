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
      - `fieldType` (The data type of the custom field, e.g., "string", "number", "boolean", "date").
      - `description` (Optional: A help text).
      - `options` (JSONB: For `select_single` or `select_multiple` types).
      - `validationRules` (JSONB: Optional rules).
      - `isRequired` (Boolean).
      - `sourceSystem` (String, Optional: If this field originated from an external ChMS, this could store an identifier for that system, e.g., "planning_center_online").
      - `displayOrder` (Integer).

2.  **`customFields` Column on Core Entities:**
    - Most core OpenFaith entities will have a `customFields` (JSONB) column.
    - This column stores structured custom field objects, each containing type information, metadata, and values.
    - **Structure of a Custom Field Object:**
      ```typescript
      {
        _tag: 'string' | 'number' | 'boolean' | 'date',  // Field type discriminator
        name: string,                                    // Field identifier
        source?: 'pco' | 'ccb' | string | undefined,     // Source system identifier
        value: string | number | boolean | null          // The actual value
      }
      ```
    - **Example `customFields` array for a `Person` entity:**
      ```json
      [
        {
          "_tag": "date",
          "name": "spiritualGiftsAssessmentDate",
          "value": "2023-05-10"
        },
        {
          "_tag": "string",
          "name": "pco_middle_name",
          "source": "pco",
          "value": "Alexander"
        },
        {
          "_tag": "boolean",
          "name": "parentalConsentOnFile",
          "value": true
        }
      ]
      ```

### Custom Field Schema Implementation

OpenFaith uses Effect.Schema to provide type-safe custom field handling:

```typescript
// Base schema for all custom fields
const BaseCustomFieldSchema = Schema.Struct({
  name: Schema.String,
  source: Schema.Union(Schema.Literal('pco', 'ccb'), Schema.String, Schema.Undefined),
})

// Specific field type schemas
const StringFieldSchema = Schema.TaggedStruct('string', {
  ...BaseCustomFieldSchema.fields,
  value: Schema.String.pipe(Schema.NullishOr),
})

const NumberFieldSchema = Schema.TaggedStruct('number', {
  ...BaseCustomFieldSchema.fields,
  value: Schema.Number.pipe(Schema.NullishOr),
})

const BooleanFieldSchema = Schema.TaggedStruct('boolean', {
  ...BaseCustomFieldSchema.fields,
  value: Schema.Boolean.pipe(Schema.NullishOr),
})

const DateFieldSchema = Schema.TaggedStruct('date', {
  ...BaseCustomFieldSchema.fields,
  value: Schema.String.pipe(Schema.optional), // ISO date string
})

// Union of all custom field types
const CustomFieldSchema = Schema.Union(
  StringFieldSchema,
  NumberFieldSchema,
  BooleanFieldSchema,
  DateFieldSchema,
)
```

### Working with Custom Fields

The system provides utility functions for common operations:

```typescript
// Extract a custom field value by name
const getCustomFieldValue = (customFields: Array<CustomFieldSchema>) => (fieldName: string) =>
  pipe(
    customFields,
    Array.findFirst((x) => x.name === fieldName),
    Option.flatMapNullable((x) => x.value),
  )

// Create a new custom field
const mkCustomField = <T extends 'string' | 'number' | 'boolean'>(
  type: T,
  name: string,
  value: /* appropriate type based on T */,
  source?: 'pco' | 'ccb' | string,
) => ['customFields', /* CustomFieldSchema object */]
```

### How it Works: Definition, Input, Validation, and Storage

1.  **Defining a Custom Field:**

    - **User-Defined:** An administrator creates a new `Field` entity record, specifying its attributes, including `targetEntityTypeTags` to define its scope.
    - **System-Generated (from External Sync):** During synchronization, if a ChMS Adapter encounters a field from the external system that doesn't map to the OpenFaith CDM:
      - It can check if a `Field` definition already exists (perhaps by a conventional `name` like `pco_middle_name` or by looking at `sourceSystem`).
      - If not, it can automatically create a new `Field` definition, inferring the `fieldType` and setting `sourceSystem`. The `targetEntityTypeTags` would correspond to the entity being synced.

2.  **Data Input/Sync:**

    - **Manual Input:** UIs dynamically render inputs based on `Field` definitions relevant to the entity being edited, creating appropriate custom field objects.
    - **External Sync:** The ChMS Adapter, after transforming the main CDM fields, places any remaining non-standard external field data into a structure that will be stored in 
    the `customFields` JSONB column with appropriate type tags, names (following naming conventions like `pco_[original_field_name]`), and source identifiers.

3.  **Validation and Schema Generation (Leveraging Effect.Schema):**

    - When entity data (including custom field values from UI input or external sync) is processed:
    - The custom fields array is validated against the `CustomFieldSchema` union type.
    - Additional validation can be performed by looking up corresponding `Field` definitions to check requirements, constraints, and applicability.
    - The discriminated union approach with `_tag` ensures type safety and proper validation for each field type.

4.  **Storage:**

    - The validated `customFields` array is saved directly with the entity record.
    - Database storage will use JSONB structured data types to maintain queryability.

5.  **Data Retrieval and Display:**
    - When an entity is fetched, its `customFields` array is retrieved.
    - The UI/API consumer uses the `_tag` discriminator and corresponding `Field` definitions to interpret and display the labels and values appropriately.
    - Helper functions like `getCustomFieldValue` provide easy access to specific field values.

### External ChMS Integration Example

When syncing from Planning Center Online (PCO), fields marked as custom are transformed into OpenFaith custom fields:

```typescript
// PCO field annotation
const PCOItem = Schema.Struct({
  first_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'firstName',
  }),
  middle_name: Schema.NullOr(Schema.String).annotations({
    [OfFieldName]: 'middleName',
    [OfCustomField]: true,  // Marks this as a custom field
  }),
})

// Resulting OpenFaith entity
{
  firstName: 'John',
  customFields: [
    {
      _tag: 'string',
      name: 'pco_middle_name',
      source: 'pco',
      value: 'Alexander'
    }
  ]
}
```

### Benefits of this Approach

- **Type Safety:** The discriminated union with `_tag` provides compile-time type safety and runtime validation.
- **Structured Storage:** Unlike simple key-value pairs, the structured approach maintains metadata about field types and sources.
- **User-Driven & System-Driven Extensibility:** Supports both manually defined custom fields and automated handling of non-standard fields from external systems.
- **Data Fidelity:** Ensures data from external ChMS isn't lost if it doesn't fit the OpenFaith CDM perfectly.
- **Scoped or Global Definitions:** `Field` definitions can be precisely targeted to one or more entity types through the definition system.
- **Source Tracking:** The `source` property maintains provenance information for fields originating from external systems.
- **Dynamic UIs & API Consistency:** The structured approach enables consistent handling across different interfaces.

### Considerations

- **Naming Conflicts:** Care must be taken with field names to avoid conflicts, especially when auto-generating from multiple external systems. A convention like `externalSystem_originalFieldName` is used (e.g., `pco_middle_name`).
- **Definition Management:** As the number of `Field` definitions grows (especially with auto-generation from syncs), UIs for managing these definitions become important.
- **Array Performance:** While arrays provide structure and type safety, consider performance implications for entities with many custom fields.
- **Migration:** When changing custom field structures, migration strategies should account for the array-based storage format.
- Querying, Reporting, Permissions, and Schema Evolution for custom fields remain important considerations.

### Conclusion

OpenFaith's custom fields system, with its structured array-based storage and Effect.Schema validation, offers a powerful and type-safe approach to data extensibility. By combining a dedicated `Field` entity for definitions with structured custom field objects that maintain type information and source metadata, OpenFaith ensures that organizations can capture all necessary information—whether defined internally or originating from diverse external sources—while maintaining data integrity and providing excellent developer experience through strong typing and validation.
