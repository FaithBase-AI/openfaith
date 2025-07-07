# PCO Calendar Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Calendar module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`Event`**: The central entity in the module. It will be a core entity in OpenFaith, representing a single event.
*   **`EventInstance`**: Represents a specific occurrence of an event, including recurrence information. This should be a core entity in OpenFaith, linked to an `Event`.
*   **`Resource`**: Represents a room or other resource that can be booked for an event. This should be a core entity in OpenFaith.
*   **`Tag`**: Tags are used for filtering and organization. Since they can be applied across multiple events and are managed centrally within Tag Groups, they should be a core entity.

## 2. Folder-Type Entities

These PCO entities serve as containers and map directly to OpenFaith's `Folder` entity, as per the `docs/Folders.md` guide.

*   **`ResourceFolder`**: This is a container for `Resource`s. It maps perfectly to an OpenFaith `Folder` with `folderType: 'pco_resource_folder'`. Resources are then linked to this folder via an `Edge`.
*   **`TagGroup`**: A container for `Tag`s. This should be mapped to a `Folder` with `folderType: 'pco_tag_group'`. Individual `Tag` entities would be linked to this folder via an `Edge`.
*   **`Feed`**: A feed is a source of events. This can be modeled as a `Folder` with `folderType: 'pco_feed'` containing `Event` entities via `Edge`s.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and folder entities.

*   **`Event` <-> `Resource`**: An `EventResourceRequest` and `ResourceBooking` can be modeled as an `Edge` between an `Event` and a `Resource`, with metadata containing the status and other details.
*   **`Event` <-> `Tag`**: The many-to-many relationship between events and tags is managed via `Edge`s.
*   **`Event` <-> `Person`**: The relationship between an event and its owner is an `Edge`.
*   **`Event` <-> `Attachment`**: The relationship between an event and an attachment is an `Edge`.
*   **`Resource` <-> `ResourceApprovalGroup`**: The relationship between a resource and a resource approval group is an `Edge`.
*   **`EventConnection`**: This entity explicitly represents a link between a Calendar event and another PCO entity. This is a perfect use case for an `Edge`.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`EventTime`**: The start and end times of an event instance can be stored as fields on the `EventInstance` entity.
*   **`RoomSetup`**: The details of a room setup can be stored as a JSON field on the `Resource` entity.
*   **`ResourceQuestion` and `EventResourceAnswer`**: These can be modeled as custom fields on the `Resource` and `EventResourceRequest` (Edge) respectively.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`Event`**: The central entity representing a calendar event.
2.  **`EventInstance`**: Crucial for handling single and recurring event occurrences.
3.  **`Resource`**: Essential for managing rooms and bookable items.
4.  **`ResourceFolder`**: The primary way to organize resources.
5.  **`ResourceBooking`**: The direct link between an event and a resource.

### Medium Priority (Important Features)

1.  **`Tag` & `TagGroup`**: Important for filtering and categorizing events.
2.  **`Attachment`**: For files associated with events.
3.  **`EventResourceRequest`**: Managing the approval process for resource bookings.

### Low Priority (Defer for Later)

*   **`Feed`**: Importing events from external feeds is a secondary feature.
*   **`Conflict`**: Conflict resolution logic is complex and can be deferred.
*   **`ResourceApprovalGroup`** and **`RequiredApproval`**: The full approval workflow with groups of people can be implemented later.
*   **`RoomSetup`**, **`ResourceQuestion`**, **`EventResourceAnswer`**, **`ResourceSuggestion`**: These are detailed features related to resource management that are not critical for an initial version.
*   **`ReportTemplate`**, **`JobStatus`**: Internal PCO entities that are not a priority for integration.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Event` | **Core Entity** | High | Not Started | The central entity for this module. |
| `EventInstance` | **Core Entity** | High | Not Started | Represents a specific occurrence of an event. |
| `Resource` | **Core Entity** | High | Not Started | Represents a room or other resource. |
| `ResourceFolder` | **Folder** | High | Not Started | A `Folder` with `folderType: 'pco_resource_folder'`. |
| `ResourceBooking` | **Edge** | High | Not Started | Connects an `Event` to a `Resource`. |
| `Tag` | **Core Entity** | Medium | Not Started | A tag that can be applied to events. |
| `TagGroup` | **Folder** | Medium | Not Started | A `Folder` with `folderType: 'pco_tag_group'`. |
| `Attachment` | **Core Entity** | Medium | Not Started | Represents a file attached to an event. |
| `EventResourceRequest` | **Edge** | Medium | Not Started | Connects an `Event` to a `Resource` with a request status. |
| `Feed` | **Folder** | Low | Not Started | A `Folder` with `folderType: 'pco_feed'`. |
| `Conflict` | **Deferred** | Low | Not Started | Conflict resolution is a complex feature that can be deferred. |
| `ReportTemplate` | **Deferred** | Low | Not Started | Reporting is a secondary feature. |
| `JobStatus` | **Deferred** | Low | Not Started | Internal PCO job status, not relevant to OpenFaith. |
| `RoomSetup` | **Field on `Resource`** | Low | Not Started | Store as a JSON field. |
| `ResourceQuestion` | **Custom Field on `Resource`** | Low | Not Started |  |
| `EventResourceAnswer` | **Custom Field on `Edge`** | Low | Not Started |  |
| `ResourceSuggestion` | **Deferred** | Low | Not Started |  |
| `RequiredApproval` | **Edge** | Low | Not Started | Connects a `Resource` to a `ResourceApprovalGroup`. |
| `ResourceApprovalGroup` | **Core Entity** | Low | Not Started | Represents a group of people who can approve resource requests. |
