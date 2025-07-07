# PCO Check-Ins Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Check-Ins module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`Event`**: The central entity in the module. It will be a core entity in OpenFaith, representing a check-in event.
*   **`EventPeriod`**: Represents a specific recurrence of an event. This should be a core entity in OpenFaith, linked to an `Event`.
*   **`Location`**: Represents a physical location where people can check in. This should be a core entity in OpenFaith.
*   **`CheckIn`**: Represents an attendance record for an event. This should be a core entity in OpenFaith.
*   **`Station`**: Represents a device where people can be checked in. This should be a core entity in OpenFaith.

## 2. Folder-Type Entities

These PCO entities serve as containers and map directly to OpenFaith's `Folder` entity, as per the `docs/Folders.md` guide.

*   **`Location`**: A PCO `Location` with `kind="Folder"` is a container for other `Location`s. This maps perfectly to an OpenFaith `Folder` with `folderType: 'pco_check_in_location_folder'`. Locations are then linked to this folder via an `Edge`.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and folder entities.

*   **`CheckIn` <-> `Person`**: The relationship between a check-in and a person is an `Edge`.
*   **`CheckIn` <-> `EventPeriod`**: The relationship between a check-in and an event period is an `Edge`.
*   **`CheckIn` <-> `Location`**: A `CheckInTime` can be modeled as an `Edge` between a `CheckIn` and a `Location`.
*   **`Event` <-> `Location`**: The relationship between an event and a location is an `Edge`.
*   **`Event` <-> `Label`**: An `EventLabel` can be modeled as an `Edge` between an `Event` and a `Label`.
*   **`Location` <-> `Label`**: A `LocationLabel` can be modeled as an `Edge` between a `Location` and a `Label`.
*   **`CheckInGroup`**: This entity groups `CheckIn`s by the person who checked them in. This can be modeled as a `Folder` with `folderType: 'pco_check_in_group'` containing `CheckIn` entities via `Edge`s.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`AttendanceType`**: The name and color can be stored as fields on the `Headcount` entity.
*   **`Headcount`**: The total can be stored as a field on the `EventTime` entity.
*   **`Option`**: The body and quantity can be stored as a JSON field on the `CheckIn` entity.
*   **`Theme`**: The theme attributes can be stored as a JSON field on the `Station` entity.
*   **`Pass`**: The code and kind can be stored as fields on the `Person` entity.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`Event`**: The central entity for this module.
2.  **`EventPeriod`**: Essential for handling recurring events.
3.  **`Location`**: Core to where check-ins happen.
4.  **`CheckIn`**: The record of attendance.

### Medium Priority (Important Features)

1.  **`Station`**: For managing check-in devices.
2.  **`Label`**: For printing name tags and security labels.
3.  **`EventLabel`** and **`LocationLabel`**: For configuring label printing.

### Low Priority (Defer for Later)

*   **`Theme`**: Custom styling for stations is a secondary feature.
*   **`Pass`**: Barcode check-in is a secondary feature.
*   **`IntegrationLink`**: Linking to other PCO products can be deferred.
*   **`PreCheck`**, **`RosterListPerson`**: These are related to specific check-in modes that can be implemented later.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Event` | **Core Entity** | High | Not Started | The central entity for this module. |
| `EventPeriod` | **Core Entity** | High | Not Started | Represents a specific recurrence of an event. |
| `Location` | **Core Entity** | High | Not Started | Represents a physical location where people can check in. |
| `CheckIn` | **Core Entity** | High | Not Started | Represents an attendance record for an event. |
| `Station` | **Core Entity** | Medium | Not Started | Represents a device where people can be checked in. |
| `Label` | **Core Entity** | Medium | Not Started | Represents a printable label. |
| `EventLabel` | **Edge** | Medium | Not Started | Connects an `Event` to a `Label`. |
| `LocationLabel` | **Edge** | Medium | Not Started | Connects a `Location` to a `Label`. |
| `CheckInGroup` | **Folder** | Medium | Not Started | A `Folder` with `folderType: 'pco_check_in_group'`. |
| `CheckInTime` | **Edge** | Medium | Not Started | Connects a `CheckIn` to a `Location`. |
| `AttendanceType` | **Field on `Headcount`** | Low | Not Started |  |
| `Headcount` | **Field on `EventTime`** | Low | Not Started |  |
| `Option` | **Field on `CheckIn`** | Low | Not Started |  |
| `Theme` | **Field on `Station`** | Low | Not Started |  |
| `Pass` | **Field on `Person`** | Low | Not Started |  |
| `IntegrationLink` | **Deferred** | Low | Not Started |  |
| `PreCheck` | **Deferred** | Low | Not Started |  |
| `RosterListPerson` | **Deferred** | Low | Not Started |  |
