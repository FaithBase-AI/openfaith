# PCO Webhooks Module: Entity Relationship Mapping for OpenFaith

This document outlines how entities from the Planning Center Online (PCO) Webhooks module should be mapped and integrated into the OpenFaith platform. The primary goal is to leverage OpenFaith's generic `Folder` and `Edge` concepts to create a flexible and simplified representation of PCO's data, while identifying which PCO entities should be treated as core OpenFaith entities and which can be simplified into fields or custom fields.

## 1. Core PCO Entities to Support

These are fundamental entities that should have a direct or near-direct representation in OpenFaith.

*   **`WebhookSubscription`**: The central entity for configuring and managing webhook endpoints. It will be a core entity in OpenFaith.
*   **`Event`**: Represents a specific event that occurred in Planning Center and was sent via a webhook. This will be a core entity in OpenFaith.
*   **`AvailableEvent`**: Describes a type of event that can be subscribed to via webhooks. This should be a core entity in OpenFaith.

## 2. Folder-Type Entities

There are no explicit folder-type entities within the PCO Webhooks module itself. The `Organization` entity serves as a root for all PCO applications, and its mapping is handled at a higher level within the PCO adapter documentation.

## 3. Edge Relationships

OpenFaith's `Edge` entity is ideal for modeling the connections between the core and other entities.

*   **`Event` <-> `WebhookSubscription`**: An `Event` is generated as a result of a `WebhookSubscription`. This is an `Edge` connecting an `Event` to its `WebhookSubscription`.
*   **`Delivery` <-> `Event`**: A `Delivery` represents an attempt to send an `Event` to a subscribed URL. This is an `Edge` connecting a `Delivery` to its `Event`.

## 4. Fields and Custom Fields (Simplified Entities)

Some PCO entities can be simplified by flattening their attributes into fields on a core entity, reducing complexity.

*   **`Delivery`**: Attributes such as `status`, `request_headers`, `request_body`, `response_headers`, `response_body`, `created_at`, `updated_at`, `timing`, and `object_url` can be directly stored as fields on the `Delivery` entity itself.
*   **`AvailableEvent`**: Attributes like `name`, `app`, `version`, `type`, `resource`, and `action` can be directly stored as fields on the `AvailableEvent` entity itself.
*   **`Event`**: Attributes such as `created_at`, `status`, `updated_at`, `uuid`, and `payload` can be directly stored as fields on the `Event` entity itself.

## 5. Prioritization and Deferred Entities

For an initial integration, we should focus on the most critical entities to provide immediate value.

### High Priority (Core Functionality)

1.  **`WebhookSubscription`**: Essential for enabling and managing webhook functionality.
2.  **`Event`**: Represents the actual data flow from PCO to OpenFaith.
3.  **`AvailableEvent`**: Necessary for understanding what events can be subscribed to.

### Medium Priority (Important Features)

1.  **`Delivery`**: Provides crucial debugging and monitoring information for webhook events.

### Low Priority (Defer for Later)

*   **`Organization`**: This is a root entity for the entire PCO API and is handled as a core entity in other modules. Its direct mapping within the Webhooks module is not required.

## 6. Detailed Entity Mapping

| PCO Entity | OpenFaith Mapping Strategy | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `WebhookSubscription` | **Core Entity** | High | Not Started | Central entity for webhook configuration. |
| `Event` | **Core Entity** | High | Not Started | Represents a specific webhook event. |
| `AvailableEvent` | **Core Entity** | High | Not Started | Describes a type of event that can be subscribed to. |
| `Delivery` | **Core Entity** | Medium | Not Started | Represents an attempt to send an `Event`. |
| `Organization` | **Deferred** | Low | Not Started | Handled at a higher level in the PCO adapter. |
