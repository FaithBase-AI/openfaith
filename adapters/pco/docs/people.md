# PCO People Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) People module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data, while identifying which PCO entities should be treated as core OpenFaith entities and which can be simplified into fields or custom fields.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

- **`Person`**: This is the central entity in the People module. It will be a core entity in OpenFaith. It holds demographic information, contact details, and serves as the anchor for most other relationships.
- **`Address`**, **`Email`**, **`PhoneNumber`**: These are value objects tightly coupled to a `Person`. The current implementation correctly models these as first-class entities in OpenFaith for better query performance and normalization.
- **`Household`**: Represents a group of people living together. In OpenFaith, a `Household` can be its own entity. The `HouseholdMembership` records that link a `Person` to a `Household` are a perfect use case for an **`Edge`** relationship, connecting a `Person` entity to a `Household` entity.
- **`Campus`**: A core organizational structure in PCO. Given its importance for segmenting data across the entire PCO suite, `Campus` should be treated as a first-class entity in OpenFaith.
- **`Note`**: While attached to a person, a `Note` has its own content and metadata (like the note category and author). It should be a distinct entity in OpenFaith, linked to a `Person` via an `Edge`.

## 2. Folder-Type Entities

Several PCO entities serve primarily as containers or organizational groups. Following the principles in `docs/Folders.md`, these should be mapped to OpenFaith's generic `Folder` entity with a specific `folderType`.

- **`List`**: A PCO `List` is a collection of `Person` records. This maps directly to an OpenFaith `Folder` with `folderType: 'pco_list'`.
  - **`ListCategory`**: A PCO `ListCategory` that groups lists should be modeled as a parent `Folder`.
  - The relationship between a `Person` and a `List` (a `ListResult`) will be an **`Edge`**.
- **`Workflow`**: PCO Workflows are used to manage processes involving people.
  - A `Workflow` itself can be mapped to a `Folder` with `folderType: 'pco_workflow'`.
  - **`WorkflowCategory`**: A PCO `WorkflowCategory` that groups workflows should be modeled as a parent `Folder`.
  - A `WorkflowCard` which connects a `Person` to a `Workflow` at a specific `WorkflowStep` is a prime candidate for an **`Edge`** with rich metadata (step, assignee, due date, etc.).
- **`NoteCategory`**: Categories for `Note` entities are another folder-like structure. A `NoteCategory` can be a `Folder` with `folderType: 'pco_note_category'` containing `Note` entities via `Edge`s.
- **`Tab` (Custom Fields)**: A `Tab` in PCO is a container for custom `FieldDefinition`s. This should be mapped to a `Folder` with `folderType: 'pco_custom_field_tab'`.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling connections between entities.

- **`Person` <-> `Household`**: A `HouseholdMembership` is an `Edge`.
- **`Person` <-> `List`**: A `ListResult` is an `Edge` connecting a `Person` to a `Folder` (the List).
- **`Person` <-> `Workflow`**: A `WorkflowCard` is an `Edge` connecting a `Person` to a `Folder` (the Workflow).
- **`Person` <-> `Note`**: The relationship between a `Person` and a `Note` is an `Edge`.

## 4. Fields and Custom Fields (Simplified Entities)

Many PCO entities are simple lookup tables or value objects. Instead of creating corresponding tables in OpenFaith, their data should be denormalized into fields on the primary entity (usually `Person`).

- **`MaritalStatus`**: Should be a `marital_status` text field on the `Person` entity.
- **`InactiveReason`**: Should be an `inactive_reason` text field on the `Person` entity.
- **`NamePrefix` / `NameSuffix`**: Should be `name_prefix` and `name_suffix` text fields on the `Person` entity.
- **`SchoolOption`**: Should be a `school` text field on the `Person` entity.
- **PCO Custom Fields (`FieldDefinition`, `FieldDatum`)**: These map directly to OpenFaith's custom field implementation. A `FieldDefinition` defines the custom field (associated with a `Tab`/`Folder`), and the `FieldDatum` provides the value for a specific `Person`.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`Person`**: The absolute core of the module.
2.  **`Address`, `Email`, `PhoneNumber`**: Essential contact information, to be handled as fields on `Person`.
3.  **`Household` & `HouseholdMembership`**: Core family/grouping structure.
4.  **`Campus`**: Essential for organizational structure.
5.  **`List` & `ListCategory`**: A primary way users organize people in PCO.
6.  **`MaritalStatus`, `InactiveReason`**: Simple but important fields on a person's profile.

### Medium Priority (Important Features)

1.  **`Note` & `NoteCategory`**: Important for pastoral care and tracking interactions.
2.  **Custom Fields (`Tab`, `FieldDefinition`, `FieldDatum`)**: Crucial for capturing church-specific data.

### Low Priority (Defer for Later)

- **`Workflow`**: Workflows are a powerful but complex feature. Full integration can be deferred. Initially, we might only sync that a person is _in_ a workflow, without syncing the detailed step-by-step data.
- **`App` / `PersonApp`**: PCO-specific metadata about application access. Not essential for core ChMS functionality.
- **`Form` and related entities**: Forms are a significant feature set. While useful, they are less foundational than core profile data and can be addressed in a later phase.
- **`BackgroundCheck`**: Important for safety, but a specialized feature that can be added later.

## 6. Detailed Entity Mapping

| PCO Entity            | OpenFaith Mapping Strategy | Priority | Status      | Notes                                                        |
| :-------------------- | :------------------------- | :------- | :---------- | :----------------------------------------------------------- |
| `Person`              | **Core Entity**            | High     | Done        | The central entity. Mapped to OpenFaith's `people` table.    |
| `Address`             | **Core Entity**            | High     | Done        | Mapped to OpenFaith's `addresses` table.                     |
| `Email`               | **Core Entity**            | High     | Done        | Mapped to OpenFaith's `emails` table.                        |
| `PhoneNumber`         | **Core Entity**            | High     | Done        | Mapped to OpenFaith's `phoneNumbers` table.                  |
| `Household`           | **Core Entity**            | High     | Not Started | Represents a household.                                      |
| `HouseholdMembership` | **Edge**                   | High     | Not Started | Connects a `Person` to a `Household`.                        |
| `Campus`              | **Core Entity**            | High     | Done        | Represents a campus. Mapped to OpenFaith's `campuses` table. |
| `List`                | **Folder**                 | High     | Not Started | A `Folder` with `folderType: 'pco_list'`.                    |
| `ListCategory`        | **Folder**                 | High     | Not Started | A parent `Folder` for `List` folders.                        |
| `ListResult`          | **Edge**                   | Low      | Not Started | Connects a `Person` to a `List` folder.                      |
| `MaritalStatus`       | **Field on `Person`**      | Medium   | Not Started | A simple text field.                                         |
| `InactiveReason`      | **Field on `Person`**      | Low      | Not Started | A simple text field.                                         |
| `Note`                | **Core Entity**            | Medium   | Not Started | A note attached to a person.                                 |
| `NoteCategory`        | **Folder**                 | Medium   | Not Started | A `Folder` with `folderType: 'pco_note_category'`.           |
| `Tab`                 | **Folder**                 | Medium   | Not Started | A `Folder` with `folderType: 'pco_custom_field_tab'`.        |
| `FieldDefinition`     | **Core Entity**            | Medium   | Not Started | A custom field definition.                                   |
| `FieldDatum`          | **Edge**                   | Medium   | Not Started | Connects a `Person` to a `FieldDefinition` with a value.     |
| `Workflow`            | **Folder**                 | Low      | Not Started | A `Folder` with `folderType: 'pco_workflow'`.                |
| `WorkflowCategory`    | **Folder**                 | Low      | Not Started | A parent `Folder` for `Workflow` folders.                    |
| `WorkflowCard`        | **Edge**                   | Low      | Not Started | Connects a `Person` to a `Workflow` folder.                  |
| `App`                 | **Deferred**               | Low      | Not Started | PCO-specific metadata.                                       |
| `PersonApp`           | **Deferred**               | Low      | Not Started | PCO-specific metadata.                                       |
| `Form`                | **Deferred**               | Low      | Not Started | Complex feature set for later implementation.                |
| `BackgroundCheck`     | **Deferred**               | Low      | Not Started | Specialized feature for later implementation.                |
| `NamePrefix`          | **Field on `Person`**      | Low      | Not Started | A simple text field.                                         |
| `NameSuffix`          | **Field on `Person`**      | Low      | Not Started | A simple text field.                                         |
| `SchoolOption`        | **Field on `Person`**      | Low      | Not Started | A simple text field.                                         |
