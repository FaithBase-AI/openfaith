# PCO Registrations Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Registrations module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`Signup`**: The central entity in the module. It will be a core entity in OpenFaith, representing a single event registration or signup.

## 2. Folder-Type Entities

These PCO entities serve as containers and map directly to OpenFaith's `Folder` entity, as per the `docs/Folders.md` guide.

*   **`Category`**: A category for `Signup`s. This maps perfectly to an OpenFaith `Folder` with `folderType: 'pco_registrations_category'`. Signups are then linked to this folder via an `Edge`.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and folder entities.

*   **`Registration`**: This entity represents a single registration for a `Signup`, which may include multiple attendees. This can be modeled as an `Edge` between a `Person` (the registrant) and a `Signup`.
*   **`Attendee`**: An attendee is a person registered for a signup. This is an `Edge` connecting a `Person` to a `Signup`.
*   **`Signup` <-> `Campus`**: The assignment of a `Signup` to a `Campus` is an `Edge`.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`SignupTime`**: The start and end times of a signup can be stored as fields on the `Signup` entity.
*   **`SignupLocation`**: The location of a signup can be stored as a structured JSON `address` field on the `Signup` entity.
*   **`SelectionType`**: The name and price of a selection type can be stored as a JSON field on the `Attendee` (Edge) entity.
*   **`EmergencyContact`**: The emergency contact information can be stored as a JSON field on the `Attendee` (Edge) entity.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`Signup`**: The central entity for this module.
2.  **`Registration`**: Essential for linking people to signups.
3.  **`Attendee`**: For tracking individual attendees.

### Medium Priority (Important Features)

1.  **`Category`**: For organizing signups.
2.  **`Campus`**: For multi-site organizations, linking signups to a campus is crucial.

### Low Priority (Defer for Later)

*   **`SelectionType`**: Different registration options can be simplified or deferred.
*   **`EmergencyContact`**: Emergency contact information is a secondary feature.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Signup` | **Core Entity** | High | Not Started | The central entity for this module. |
| `Registration` | **Edge** | High | Not Started | Connects a `Person` to a `Signup`. |
| `Attendee` | **Edge** | High | Not Started | Connects a `Person` to a `Signup`. |
| `Category` | **Folder** | Medium | Not Started | A `Folder` with `folderType: 'pco_registrations_category'`. |
| `Campus` | **Edge** | Medium | Not Started | Connects a `Signup` to a `Campus`. |
| `SignupTime` | **Field on `Signup`** | Low | Not Started |  |
| `SignupLocation` | **Field on `Signup`** | Low | Not Started |  |
| `SelectionType` | **Field on `Edge`** | Low | Not Started |  |
| `EmergencyContact` | **Field on `Edge`** | Low | Not Started |  |
