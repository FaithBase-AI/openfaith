# PCO API Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) API module should be mapped and integrated into the OpenFaith platform. The API module is meta-data about the API itself, and is not directly related to church management. For this reason, most of these entities will be deferred.

## 1. Core PCO Entities to Support

There are no core entities in this module that need to be supported at this time.

## 2. Folder-Type Entities

There are no folder-type entities in this module.

## 3. Edge Relationships

There are no edge relationships in this module.

## 4. Fields and Custom Fields (Simplified Entities)

There are no entities in this module that can be simplified into fields.

## 5. Prioritization and Deferred Entities

The API module contains meta-data about the PCO API itself and is not directly related to core church management functionality. Therefore, all entities within this module are considered low priority and will be deferred.

### Low Priority (Defer for Later)

*   **`ConnectedApplication`**
*   **`ConnectedApplicationPerson`**
*   **`OauthApplication`**
*   **`OauthApplicationMau`**
*   **`Organization`** (API meta-view)
*   **`Person`** (API meta-view)
*   **`PersonalAccessToken`**

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `ConnectedApplication` | **Deferred** | Low | Not Started | Meta-data about connected applications. |
| `ConnectedApplicationPerson` | **Deferred** | Low | Not Started | Meta-data about people connected to applications. |
| `OauthApplication` | **Deferred** | Low | Not Started | Meta-data about OAuth applications. |
| `OauthApplicationMau` | **Deferred** | Low | Not Started | Monthly Active User data for OAuth applications. |
| `Organization` | **Deferred** | Low | Not Started | This is a meta-view of the organization, not the primary organization entity. |
| `Person` | **Deferred** | Low | Not Started | This is a meta-view of the person, not the primary person entity. |
| `PersonalAccessToken` | **Deferred** | Low | Not Started | Meta-data about personal access tokens. |
