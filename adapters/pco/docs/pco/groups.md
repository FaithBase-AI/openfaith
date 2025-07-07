# PCO Groups Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Groups module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`Group`**: The central entity in the module. It will be a core entity in OpenFaith, representing a collection of people.
*   **`Event`**: Represents a specific meeting or gathering for a group. It has its own distinct attributes like start/end times and location, and should be a core entity in OpenFaith.
*   **`Resource`**: Represents shared files and links within a group. Given that resources have their own properties (URL, type, visibility), they should be treated as a core entity.
*   **`Tag`**: Tags are used for filtering and organization. Since they can be applied across multiple groups and are managed centrally within Tag Groups, they should be a core entity.

## 2. Folder-Type Entities

These PCO entities serve as containers and map directly to OpenFaith's `Folder` entity, as per the `docs/Folders.md` guide.

*   **`GroupType`**: This is a category for `Group`s. It maps perfectly to an OpenFaith `Folder` with `folderType: 'pco_group_type'`. Groups are then linked to this folder via an `Edge`.
*   **`TagGroup`**: A container for `Tag`s. This should be mapped to a `Folder` with `folderType: 'pco_tag_group'`. Individual `Tag` entities would be linked to this folder via an `Edge`.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and folder entities.

*   **`Membership`**: This entity represents the relationship between a `Person` and a `Group`. It is a classic example of an `Edge`. The `role` (e.g., 'leader', 'member') should be stored as metadata on the `Edge`.
*   **`Attendance`**: This tracks a `Person`'s attendance at a group `Event`. This is an `Edge` connecting a `Person` to an `Event`, with metadata like `attended` and `role`.
*   **`Group` <-> `Tag`**: The many-to-many relationship between groups and tags is managed via `Edge`s.
*   **`Group` <-> `Campus`**: The assignment of a `Group` to a `Campus` is an `Edge`.
*   **`Event` <-> `Location`**: If `Location` is modeled as a core entity, this relationship is an `Edge`. If it's a field, this doesn't apply.
*   **`GroupApplication`**: This represents a request from a `Person` to join a `Group`. It can be modeled as a temporary `Edge` with a `status` property (`pending`, `approved`, `rejected`) in its metadata.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`Enrollment`**: The attributes on this entity (like `strategy`, `member_limit`, `status`) describe the state and rules of a `Group`. These should be flattened into corresponding fields directly on the `Group` entity in OpenFaith (e.g., `enrollmentStrategy`, `memberLimit`, `enrollmentStatus`).
*   **`Location`**: A `Location` for a group or event can often be treated as a value object. It is recommended to store its details as a structured JSON `address` field on the `Group` (for the default location) and `Event` (for specific event locations) entities.
*   **`EventNote`**: A note on an event is simple enough to be a text field on the `Event` entity itself, with the `Owner` (creator) stored as a `createdBy` field.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`Group`**: The central entity for this module.
2.  **`GroupType`**: The primary organizational structure for groups.
3.  **`Membership`**: Essential for linking people to groups.
4.  **`Campus`**: For multi-site organizations, linking groups to a campus is crucial.

### Medium Priority (Important Features)

1.  **`Event`**: Group meetings and events.
2.  **`Attendance`**: Tracking who attended events.
3.  **`Location`**: Where groups and events take place.
4.  **`Tag` & `TagGroup`**: Important for filtering and organizing groups.

### Low Priority (Defer for Later)

*   **`Enrollment`**: The rules for joining a group can be simplified or deferred.
*   **`Resource`**: Shared files and links are a secondary feature.
*   **`GroupApplication`**: The process of requesting to join a group can be handled later.
*   **`EventNote`**: Simple notes on events are not critical for initial setup.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Group` | **Core Entity** | High | Not Started | The central entity for this module. |
| `GroupType` | **Folder** | High | Not Started | A `Folder` with `folderType: 'pco_group_type'`. |
| `Membership` | **Edge** | High | Not Started | Connects a `Person` to a `Group`. Role stored in metadata. |
| `Campus` | **Edge** | High | Not Started | Connects a `Group` to a `Campus`. |
| `Event` | **Core Entity** | Medium | Not Started | Represents a group meeting or event. |
| `Attendance` | **Edge** | Medium | Not Started | Connects a `Person` to an `Event`. |
| `Location` | **Field on `Group`/`Event`** | Medium | Not Started | Store as a structured JSON `address` field. |
| `TagGroup` | **Folder** | Medium | Not Started | A `Folder` with `folderType: 'pco_tag_group'`. |
| `Tag` | **Core Entity** | Medium | Not Started | A tag that can be applied to groups. |
| `Enrollment` | **Fields on `Group`** | Low | Not Started | Attributes are flattened into the `Group` entity. |
| `Resource` | **Core Entity** | Low | Not Started | Represents a file or link shared with a group. |
| `GroupApplication` | **Edge** | Low | Not Started | A temporary edge representing a request to join. |
| `EventNote` | **Field on `Event`** | Low | Not Started | A simple text field on the `Event` entity. |
