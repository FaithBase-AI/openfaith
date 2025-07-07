# PCO Services Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Services module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data, while identifying which PCO entities should be treated as core OpenFaith entities and which can be simplified into fields or custom fields.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`ServiceType`**: The central organizational unit in Services, representing a type of service (e.g., "Sunday Morning Service"). It will be a core entity in OpenFaith.
*   **`Plan`**: A specific instance of a service, containing items, people, and times. This will be a core entity in OpenFaith.
*   **`Song`**: A musical piece used in services. This should be a core entity in OpenFaith.
*   **`Media`**: Digital assets (audio, video, images) used in services. This should be a core entity in OpenFaith.
*   **`Team`**: A group of people serving together (e.g., "Worship Team", "Usher Team"). This should be a core entity in OpenFaith.
*   **`Arrangement`**: A specific version or key of a `Song`. This should be a core entity in OpenFaith.
*   **`Key`**: The musical key for an `Arrangement`. This should be a core entity in OpenFaith.
*   **`Item`**: A component within a `Plan`, which can be a `Song`, `Media`, or a custom item. This should be a core entity in OpenFaith.
*   **`Blockout`**: A person's unavailability for scheduling. This should be a core entity in OpenFaith.
*   **`EmailTemplate`**: Templates for email communications within Services. This should be a core entity in OpenFaith.
*   **`ReportTemplate`**: Templates for generating various reports. This should be a core entity in OpenFaith.
*   **`TimePreferenceOption`**: Defines specific times a person prefers to be scheduled. This should be a core entity in OpenFaith.
*   **`Tag`**: Tags are used for filtering and organization. Since they can be applied across multiple entities and are managed centrally within Tag Groups, they should be a core entity.
*   **`TeamPosition`**: A specific role or position within a `Team`.

## 2. Folder-Type Entities

These PCO entities serve as containers and map directly to OpenFaith's `Folder` entity, as per the `docs/Folders.md` guide.

*   **`Folder`**: PCO's native folder structure for organizing `ServiceType`s. This maps directly to an OpenFaith `Folder` with `folderType: 'pco_services_folder'`.
*   **`Series`**: A collection of `Plan`s grouped together (e.g., a sermon series). This maps to an OpenFaith `Folder` with `folderType: 'pco_services_series'`.
*   **`TagGroup`**: A container for `Tag`s specific to Services entities. This maps to an OpenFaith `Folder` with `folderType: 'pco_services_tag_group'`. Individual `Tag` entities would be linked to this folder via an `Edge`.
*   **`ItemNoteCategory`**: Categories for notes on `Item`s. This maps to an OpenFaith `Folder` with `folderType: 'pco_services_item_note_category'`.
*   **`PlanNoteCategory`**: Categories for notes on `Plan`s. This maps to an OpenFaith `Folder` with `folderType: 'pco_services_plan_note_category'`.
*   **`AttachmentTypeGroup`**: Groups of `AttachmentType`s. This maps to an OpenFaith `Folder` with `folderType: 'pco_services_attachment_type_group'`.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and folder entities.

*   **`PlanPerson`**: Represents a `Person` scheduled to a `Plan`. This is an `Edge` connecting a `Person` to a `Plan`, with metadata like `status`, `notes`, and `team_position_name`.
*   **`Schedule`**: Represents a `Person`'s overall schedule derived from `PlanPerson` assignments. This is an `Edge` connecting a `Person` to a `Plan`.
*   **`Attendance`**: Tracks a `Person`'s attendance at a specific `PlanTime`. This is an `Edge` connecting a `Person` to a `PlanTime`.
*   **`Contributor`**: Represents a `Person` who has contributed to a `Plan`. This is an `Edge` connecting a `Person` to a `Plan`.
*   **`PersonTeamPositionAssignment`**: Assigns a `Person` to a `TeamPosition`. This is an `Edge` connecting a `Person` to a `TeamPosition`.
*   **`TeamLeader`**: Designates a `Person` as a leader for a `Team`. This is an `Edge` connecting a `Person` to a `Team`.
*   **`Attachment`**: Represents a file attached to various Services entities (`Arrangement`, `Item`, `Key`, `Media`, `Plan`, `ServiceType`, `Song`). This is an `Edge` connecting the `Attachment` entity to its respective parent entity.
*   **`PlanNote`**: A note associated with a `Plan`. This is an `Edge` connecting a `Plan` to a `PlanNoteCategory`.
*   **`ItemNote`**: A note associated with an `Item`. This is an `Edge` connecting an `Item` to an `ItemNoteCategory`.
*   **`MediaSchedule`**: Represents a `Media` item scheduled within a `Plan`. This is an `Edge` connecting `Media` to `Plan`.
*   **`SongSchedule`**: Represents a `Song` scheduled within a `Plan`. This is an `Edge` connecting `Song` to `Plan`.
*   **`NeededPosition`**: Represents an unfilled `TeamPosition` needed for a `Plan`. This is an `Edge` connecting a `Plan` to a `TeamPosition`.
*   **`SignupSheet`**: Represents an available `TeamPosition` for `Person`s to sign up for within a `Plan`. This is an `Edge` connecting a `Plan` to a `TeamPosition`.
*   **`ScheduledPerson`**: Represents a `Person` who has signed up for a `SignupSheet`. This is an `Edge` connecting a `Person` to a `SignupSheet`.
*   **`SplitTeamRehearsalAssignment`**: Connects a `Team` to a `PlanTime` for specific rehearsal assignments. This is an `Edge` connecting a `Team` to a `PlanTime`.
*   **`Zoom`**: Describes a zoom level for an `Attachment` for a specific `Person`. This is an `Edge` connecting an `Attachment` to a `Person`.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`ArrangementSections`**: Sections of an `Arrangement` can be stored as a structured field (e.g., JSON array) on the `Arrangement` entity.
*   **`AttachmentActivity`**: Details like `attachment_url` can be fields on the `Attachment` entity.
*   **`AttachmentType`**: The type of an `Attachment` can be a field on the `Attachment` entity.
*   **`BlockoutDate`**: The specific dates generated by a `Blockout` can be stored as a list of dates on the `Blockout` entity.
*   **`BlockoutException`**: Exceptions to a `Blockout` can be stored as a list of dates on the `Blockout` entity.
*   **`BlockoutScheduleConflict`**: Conflict details can be fields on the `Schedule` entity.
*   **`Chat`**: Simple chat messages can be stored as fields on the `Organization` or `Plan` entity, or integrated with a separate chat system.
*   **`CustomSlide`**: The body and label of a custom slide can be fields on the `Item` entity.
*   **`EmailTemplateRenderedResponse`**: This is an ephemeral response and does not need a persistent mapping.
*   **`FolderPath`**: The path of a `Folder` is a derived attribute and not a separate entity.
*   **`ItemTime`**: Specific times for an `Item` can be fields on the `Item` entity.
*   **`Layout`**: Formatting details for an `Item` can be a field on the `Item` entity.
*   **`PlanPersonTime`**: The status of a `Person` for a specific `PlanTime` can be a field on the `PlanPerson` entity.
*   **`PublicView`**: Settings for public viewing of a `ServiceType` can be fields on the `ServiceType` entity.
*   **`ServiceTypePath`**: The path of a `ServiceType` is a derived attribute and not a separate entity.
*   **`SignupSheetMetadata`**: Metadata for a `SignupSheet` can be fields on the `SignupSheet` entity.
*   **`SkippedAttachment`**: The skipped status can be a boolean field on the `Attachment` entity.
*   **`SongbookStatus`**: This is an ephemeral status and does not need a persistent mapping.
*   **`TextSetting`**: Texting preferences for a `Person`.
*   **`Live`**: Real-time control features for live services.
*   **`LiveController`**: A person who can control Services LIVE without the required permissions.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`ServiceType`**: Fundamental for organizing services.
2.  **`Plan`**: Core unit for scheduling and managing services.
3.  **`Song`**: Essential musical asset.
4.  **`Media`**: Essential media asset.
5.  **`Team`**: Core for managing serving groups.
6.  **`Arrangement`**: Key detail for songs.
7.  **`Item`**: Core component of a plan.
8.  **`PlanPerson`**: Essential for scheduling people to plans.
9.  **`Schedule`**: Represents a person's overall service schedule.
10. **`Attachment`**: Critical for files associated with various entities.
11. **`Folder`**: PCO's native folder structure.
12. **`Tag`**: Provides categorization and filtering.
13. **`TeamPosition`**: A specific role or position within a team.

### Medium Priority (Important Features)

1.  **`Key`**: Important detail for song arrangements.
2.  **`Blockout`**: Manages person unavailability.
3.  **`Attendance`**: Tracks attendance for plans/times.
4.  **`Contributor`**: Tracks contributions to plans.
5.  **`PersonTeamPositionAssignment`**: Detailed assignments of people to team positions.
6.  **`TeamLeader`**: Defines leadership roles within teams.
7.  **`PlanNote`**: Notes specific to plans.
8.  **`ItemNote`**: Notes specific to plan items.
9.  **`NeededPosition`**: Tracks unfilled positions.
10. **`SignupSheet`**: Manages volunteer sign-ups.
11. **`TimePreferenceOption`**: Captures person's scheduling preferences.
12. **`Series`**: Organizes plans into thematic groups.
13. **`TagGroup`**: Container for `Tag`s.
14. **`ItemNoteCategory`**: Categories for `ItemNote`s.
15. **`PlanNoteCategory`**: Categories for `PlanNote`s.
16. **`AttachmentTypeGroup`**: Groups of `AttachmentType`s.

### Low Priority (Defer for Later)

*   **`EmailTemplate`**: Email communication features.
*   **`ReportTemplate`**: Advanced reporting capabilities.
*   **`Chat`**: Real-time communication features.
*   **`CustomSlide`**: Custom text slides for presentations.
*   **`Layout`**: Specific formatting for items in Projector.
*   **`Live`**: Real-time control features for live services.
*   **`PublicView`**: Settings for publicly accessible plans.
*   **`ScheduledPerson`**: Specific to the signup sheet workflow.
*   **`SplitTeamRehearsalAssignment`**: Advanced scheduling for split teams.
*   **`Zoom`**: Attachment zoom level settings.
*   **`ArrangementSections`**: Sections of an `Arrangement`.
*   **`AttachmentActivity`**: Details like `attachment_url`.
*   **`AttachmentType`**: Type of an `Attachment`.
*   **`BlockoutDate`**: Specific dates generated by a `Blockout`.
*   **`BlockoutException`**: Exceptions to a `Blockout`.
*   **`BlockoutScheduleConflict`**: Conflict details.
*   **`EmailTemplateRenderedResponse`**: Ephemeral response.
*   **`FolderPath`**: Derived attribute.
*   **`ItemTime`**: Specific times for an `Item`.
*   **`PlanPersonTime`**: Status of a `Person` for a `PlanTime`.
*   **`ServiceTypePath`**: Derived attribute.
*   **`SignupSheetMetadata`**: Metadata for a `SignupSheet`.
*   **`SkippedAttachment`**: Skipped status.
*   **`SongbookStatus`**: Ephemeral status.
*   **`TextSetting`**: Texting preferences for a `Person`.
*   **`LiveController`**: Controller for `Live` features.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `ServiceType` | **Core Entity** | High | Not Started | Central organizational unit. |
| `Plan` | **Core Entity** | High | Not Started | Specific instance of a service. |
| `Song` | **Core Entity** | High | Not Started | Musical piece. |
| `Media` | **Core Entity** | High | Not Started | Digital assets. |
| `Team` | **Core Entity** | High | Not Started | Group of people serving. |
| `Arrangement` | **Core Entity** | High | Not Started | Version/key of a song. |
| `Item` | **Core Entity** | High | Not Started | Component within a plan. |
| `PlanPerson` | **Edge** | High | Not Started | Connects `Person` to `Plan`. |
| `Schedule` | **Edge** | High | Not Started | Represents a `Person`'s service schedule. |
| `Attachment` | **Edge** | High | Not Started | File attached to various entities. |
| `Folder` | **Folder** | High | Not Started | PCO's native folder structure. |
| `Tag` | **Core Entity** | High | Not Started | A tag that can be applied to entities. |
| `TeamPosition` | **Core Entity** | High | Not Started | A specific role or position within a team. |
| `Key` | **Core Entity** | Medium | Not Started | Musical key for an arrangement. |
| `Blockout` | **Core Entity** | Medium | Not Started | Person's unavailability. |
| `Attendance` | **Edge** | Medium | Not Started | Tracks `Person`'s attendance at `PlanTime`. |
| `Contributor` | **Edge** | Medium | Not Started | `Person` contributing to a `Plan`. |
| `PersonTeamPositionAssignment` | **Edge** | Medium | Not Started | Assigns `Person` to `TeamPosition`. |
| `TeamLeader` | **Edge** | Medium | Not Started | Designates `Person` as `Team` leader. |
| `PlanNote` | **Edge** | Medium | Not Started | Note associated with a `Plan`. |
| `ItemNote` | **Edge** | Medium | Not Started | Note associated with an `Item`. |
| `MediaSchedule` | **Edge** | Medium | Not Started | `Media` scheduled within a `Plan`. |
| `SongSchedule` | **Edge** | Medium | Not Started | `Song` scheduled within a `Plan`. |
| `NeededPosition` | **Edge** | Medium | Not Started | Unfilled `TeamPosition` needed for `Plan`. |
| `SignupSheet` | **Edge** | Medium | Not Started | Available `TeamPosition` for sign-up. |
| `TimePreferenceOption` | **Core Entity** | Medium | Not Started | Person's scheduling preferences. |
| `Series` | **Folder** | Medium | Not Started | Collection of `Plan`s. |
| `TagGroup` | **Folder** | Medium | Not Started | Container for `Tag`s. |
| `ItemNoteCategory` | **Folder** | Medium | Not Started | Categories for `ItemNote`s. |
| `PlanNoteCategory` | **Folder** | Medium | Not Started | Categories for `PlanNote`s. |
| `AttachmentTypeGroup` | **Folder** | Medium | Not Started | Groups of `AttachmentType`s. |
| `EmailTemplate` | **Core Entity** | Low | Not Started | Templates for email communications. |
| `ReportTemplate` | **Core Entity** | Low | Not Started | Templates for generating reports. |
| `ArrangementSections` | **Field on `Arrangement`** | Low | Not Started | Sections of an `Arrangement`. |
| `AttachmentActivity` | **Field on `Attachment`** | Low | Not Started | Details like `attachment_url`. |
| `AttachmentType` | **Field on `Attachment`** | Low | Not Started | Type of an `Attachment`. |
| `BlockoutDate` | **Field on `Blockout`** | Low | Not Started | Specific dates generated by a `Blockout`. |
| `BlockoutException` | **Field on `Blockout`** | Low | Not Started | Exceptions to a `Blockout`. |
| `BlockoutScheduleConflict` | **Field on `Schedule`** | Low | Not Started | Conflict details. |
| `Chat` | **Field on `Organization`/`Plan`** | Low | Not Started | Simple chat messages. |
| `CustomSlide` | **Field on `Item`** | Low | Not Started | Body and label of a custom slide. |
| `ItemTime` | **Field on `Item`** | Low | Not Started | Specific times for an `Item`. |
| `Layout` | **Field on `Item`** | Low | Not Started | Formatting details for an `Item`. |
| `PlanPersonTime` | **Field on `PlanPerson`** | Low | Not Started | Status of a `Person` for a `PlanTime`. |
| `PublicView` | **Field on `ServiceType`** | Low | Not Started | Settings for public viewing. |
| `ScheduledPerson` | **Edge** | Low | Not Started | `Person` signed up for `SignupSheet`. |
| `SplitTeamRehearsalAssignment` | **Edge** | Low | Not Started | Connects `Team` to `PlanTime`. |
| `Zoom` | **Edge** | Low | Not Started | Zoom level for an `Attachment`. |
| `EmailTemplateRenderedResponse` | **Ephemeral** | Low | Not Applicable | Ephemeral response. |
| `FolderPath` | **Derived Attribute** | Low | Not Applicable | Derived attribute. |
| `Live` | **Deferred** | Low | Not Started | Real-time control features. |
| `LiveController` | **Field on `Live`** | Low | Not Started | Controller for `Live` features. |
| `ServiceTypePath` | **Derived Attribute** | Low | Not Applicable | Derived attribute. |
| `SignupSheetMetadata` | **Field on `SignupSheet`** | Low | Not Started | Metadata for a `SignupSheet`. |
| `SkippedAttachment` | **Field on `Attachment`** | Low | Not Started | Skipped status. |
| `SongbookStatus` | **Ephemeral** | Low | Not Applicable | Ephemeral status. |
| `TextSetting` | **Field on `Person`** | Low | Not Started | Texting preferences for a `Person`. |