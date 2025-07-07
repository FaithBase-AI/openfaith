# PCO Publishing Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Publishing module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`Episode`**: The central entity in the module. It will be a core entity in OpenFaith, representing a single sermon or piece of content.
*   **`Speaker`**: Represents the person who delivered the sermon. This should be a core entity in OpenFaith.

## 2. Folder-Type Entities

These PCO entities serve as containers and map directly to OpenFaith's `Folder` entity, as per the `docs/Folders.md` guide.

*   **`Channel`**: A collection of sermons. This maps perfectly to an OpenFaith `Folder` with `folderType: 'pco_publishing_channel'`. Episodes are then linked to this folder via an `Edge`.
*   **`Series`**: A collection of `Episode`s. This should be mapped to a `Folder` with `folderType: 'pco_publishing_series'`. Individual `Episode` entities would be linked to this folder via an `Edge`.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and folder entities.

*   **`Episode` <-> `Speaker`**: A `Speakership` can be modeled as an `Edge` between an `Episode` and a `Speaker`.
*   **`Episode` <-> `Series`**: The relationship between an episode and a series is an `Edge`.
*   **`Episode` <-> `Channel`**: The relationship between an episode and a channel is an `Edge`.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`EpisodeResource`**: The details of an episode resource can be stored as a JSON field on the `Episode` entity.
*   **`EpisodeTime`**: The start and end times of an episode can be stored as fields on the `Episode` entity.
*   **`NoteTemplate`**: The note template can be stored as a field on the `Episode` entity.
*   **`ChannelDefaultEpisodeResource`** and **`ChannelDefaultTime`**: These can be stored as JSON fields on the `Channel` (Folder) entity.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`Episode`**: The central entity for this module.
2.  **`Channel`**: The primary organizational structure for episodes.
3.  **`Series`**: For grouping episodes into a series.

### Medium Priority (Important Features)

1.  **`Speaker`**: The person who delivered the sermon.
2.  **`Speakership`**: For linking speakers to episodes.

### Low Priority (Defer for Later)

*   **`EpisodeStatistics`**: Viewership statistics are a secondary feature.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Episode` | **Core Entity** | High | Not Started | The central entity for this module. |
| `Channel` | **Folder** | High | Not Started | A `Folder` with `folderType: 'pco_publishing_channel'`. |
| `Series` | **Folder** | High | Not Started | A `Folder` with `folderType: 'pco_publishing_series'`. |
| `Speaker` | **Core Entity** | Medium | Not Started | Represents the person who delivered the sermon. |
| `Speakership` | **Edge** | Medium | Not Started | Connects an `Episode` to a `Speaker`. |
| `EpisodeResource` | **Field on `Episode`** | Low | Not Started | Store as a JSON field. |
| `EpisodeTime` | **Field on `Episode`** | Low | Not Started |  |
| `NoteTemplate` | **Field on `Episode`** | Low | Not Started |  |
| `ChannelDefaultEpisodeResource` | **Field on `Channel`** | Low | Not Started |  |
| `ChannelDefaultTime` | **Field on `Channel`** | Low | Not Started |  |
| `EpisodeStatistics` | **Deferred** | Low | Not Started |  |
