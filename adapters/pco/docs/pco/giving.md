# PCO Giving Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Giving module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`Donation`**: The central entity in the module. It will be a core entity in OpenFaith, representing a single gift.
*   **`Fund`**: Represents a category of giving. This should be a core entity in OpenFaith.
*   **`PledgeCampaign`**: A campaign for raising funds. This should be a core entity in OpenFaith.
*   **`RecurringDonation`**: A recurring donation schedule. This should be a core entity in OpenFaith.

## 2. Folder-Type Entities

These PCO entities serve as containers and map directly to OpenFaith's `Folder` entity, as per the `docs/Folders.md` guide.

*   **`Batch`**: A collection of `Donation`s. This maps perfectly to an OpenFaith `Folder` with `folderType: 'pco_giving_batch'`. Donations are then linked to this folder via an `Edge`.
*   **`BatchGroup`**: A container for `Batch`es. This should be mapped to a `Folder` with `folderType: 'pco_giving_batch_group'`. Individual `Batch` folders would be linked to this folder via an `Edge`.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and folder entities.

*   **`Donation` <-> `Fund`**: A `Designation` can be modeled as an `Edge` between a `Donation` and a `Fund`, with the amount as metadata.
*   **`Donation` <-> `Person`**: The relationship between a donation and a donor is an `Edge`.
*   **`Donation` <-> `Campus`**: The assignment of a `Donation` to a `Campus` is an `Edge`.
*   **`Pledge`**: A pledge can be modeled as an `Edge` between a `Person` and a `PledgeCampaign`, with the pledged amount as metadata.
*   **`RecurringDonation` <-> `Fund`**: A `RecurringDonationDesignation` can be modeled as an `Edge` between a `RecurringDonation` and a `Fund`.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`PaymentMethod`**: The details of a payment method can be stored as a JSON field on the `Person` entity.
*   **`PaymentSource`**: The name of the payment source can be stored as a field on the `Donation` entity.
*   **`Note`**: A note on a donation is simple enough to be a text field on the `Donation` entity itself.
*   **`Label`**: Tags on a donation can be stored as an array of strings on the `Donation` entity.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`Donation`**: The central entity for this module.
2.  **`Fund`**: Essential for categorizing donations.
3.  **`Designation`**: For linking donations to funds.

### Medium Priority (Important Features)

1.  **`Batch`** and **`BatchGroup`**: For organizing donations.
2.  **`RecurringDonation`**: For managing recurring gifts.
3.  **`PledgeCampaign`** and **`Pledge`**: For managing fundraising campaigns.

### Low Priority (Defer for Later)

*   **`InKindDonation`**: Non-cash donations are a secondary feature.
*   **`Refund`** and **`DesignationRefund`**: Handling refunds can be deferred.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Donation` | **Core Entity** | High | Not Started | The central entity for this module. |
| `Fund` | **Core Entity** | High | Not Started | Represents a category of giving. |
| `Designation` | **Edge** | High | Not Started | Connects a `Donation` to a `Fund`. |
| `Batch` | **Folder** | Medium | Not Started | A `Folder` with `folderType: 'pco_giving_batch'`. |
| `BatchGroup` | **Folder** | Medium | Not Started | A `Folder` with `folderType: 'pco_giving_batch_group'`. |
| `RecurringDonation` | **Core Entity** | Medium | Not Started | Represents a recurring donation schedule. |
| `RecurringDonationDesignation` | **Edge** | Medium | Not Started | Connects a `RecurringDonation` to a `Fund`. |
| `PledgeCampaign` | **Core Entity** | Medium | Not Started | A campaign for raising funds. |
| `Pledge` | **Edge** | Medium | Not Started | Connects a `Person` to a `PledgeCampaign`. |
| `PaymentMethod` | **Field on `Person`** | Low | Not Started | Store as a JSON field. |
| `PaymentSource` | **Field on `Donation`** | Low | Not Started |  |
| `Note` | **Field on `Donation`** | Low | Not Started |  |
| `Label` | **Field on `Donation`** | Low | Not Started |  |
| `InKindDonation` | **Deferred** | Low | Not Started |  |
| `Refund` | **Deferred** | Low | Not Started |  |
| `DesignationRefund` | **Deferred** | Low | Not Started |  |
