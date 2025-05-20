## Permissions in OpenFaith: Secure and Contextual Data Access

OpenFaith employs a robust and layered approach to control access to data and functionalities, ensuring that users can only see and interact with information appropriate to their roles and responsibilities within their organization. This system is built upon two key pillars:

1.  **Authentication (AuthN):** Verifying the identity of a user, primarily handled by an external library like [Better Auth](https://better-auth.com) (as detailed in [Authentication and Authorization](/docs/Authentication.md)).
2.  **Authorization (AuthZ):** Determining what an authenticated user is permitted to do, managed by OpenFaith's own Role-Based Access Control (RBAC) system, which includes contextual scoping (initially by campus).

This document focuses on OpenFaith's **Authorization (AuthZ)** mechanisms.

### Core Authorization Principles

- **Role-Based Access Control (RBAC):** Users are assigned roles, and roles are granted permissions. This simplifies management by grouping permissions logically.
- **Principle of Least Privilege:** Users are only granted the minimum permissions necessary to perform their duties.
- **Contextual Scoping (Campus-Based V1):** For many roles, permissions can be scoped to specific campuses, allowing for decentralized administration and data segregation within a multi-campus organization.
- **Default Deny:** Access to any resource or action is denied unless explicitly granted through an assigned role and its permissions.
- **Centralized Evaluation:** A dedicated `PermissionService` within OpenFaith is responsible for evaluating all access requests.

### Key Entities in the Permission Model

1.  **`User` (Management Module):**

    - Represents an individual authenticated by the AuthN system (e.g., Better Auth).
    - The `User.id` and `User.orgId` are critical inputs for permission checks.

2.  **`Role` (Management Module):**

    - **Purpose:** Defines a named set of permissions.
    - **Key Attributes:**
      - `id` (PK)
      - `orgId` (FK to Organization)
      - `name` (String, e.g., "Global Admin," "Campus Pastor," "Group Leader," "Finance Clerk," "Member")
      - `description` (Text)
      - `permissions` (JSONB array of permission strings, e.g., `["person:create", "person:read_campus", "group:update_own"]`)

3.  **`UserRoleAssignment` (System Module - potentially an `Edge`):**

    - **Purpose:** Links a `User` to one or more `Role`s within an `Organization`.
    - **Key Attributes:**
      - `userId` (FK to User)
      - `roleId` (FK to Role)
      - `orgId` (FK to Organization)
      - `campusId` (FK to `Campus` entity, **NULLABLE**): This is the primary mechanism for V1 contextual scoping.
        - If `campusId` IS NULL, the assigned role's permissions apply globally for that user within the `orgId`.
        - If `campusId` IS NOT NULL, the assigned role's permissions are generally restricted to resources associated with that specific `Campus`.

4.  **Permission Strings (Conceptual):**
    - These are granular definitions of actions that can be performed on resources. They typically follow a `resource:action_scope` pattern.
    - **Examples:**
      - `person:create` (Can create new person records)
      - `person:read_all` (Can read all person records in the org)
      - `person:read_campus` (Can read person records associated with their assigned campus(es))
      - `person:update_any` (Can update any person record they can read)
      - `person:update_own_profile` (Can update their own person record)
      - `group:create_campus` (Can create groups within their assigned campus)
      - `group:lead` (Implies permissions to manage groups they are an `Edge`-defined leader of)
      - `finance:view_donations_all`
      - `settings:manage_users`
      - `system:manage_custom_fields`
    - The specific set of permission strings will evolve with the platform's features.

### The `PermissionService`: Central Adjudicator

All authorization checks within OpenFaith are funneled through a central `PermissionService`. This service typically exposes a core method:

`can(userContext: UserContext, action: string, resourceDetails?: ResourceDetails): Promise<boolean>`

- `userContext`: Contains `userId`, `orgId`, and potentially pre-fetched roles and campus scopes for the authenticated user.
- `action`: The permission string being checked (e.g., "person:read_campus").
- `resourceDetails?`: Optional object providing context about the resource being accessed or acted upon. This is crucial for scope checks.
  - For example, if `action` is "person:read_campus", `resourceDetails` might include the `personId` being accessed, allowing the service to determine which campus that person belongs to.
  - If creating a new entity, `resourceDetails` might include the `campusId` under which the new entity will be created.

**Evaluation Logic (Simplified V1):**

1.  The `PermissionService` retrieves all `UserRoleAssignment`s for the given `userContext.userId` and `userContext.orgId`.
2.  It iterates through each assigned role:
    a. Fetches the `permissions` array for the current `Role`.
    b. Checks if the requested `action` string is present in the `Role.permissions`.
    c. If the permission string is found:
    i. **Global Role Check:** If the `UserRoleAssignment.campusId` for this role is `NULL`, the permission is granted (access allowed for the org).
    ii. **Campus-Scoped Role Check:** If `UserRoleAssignment.campusId` is NOT `NULL`: 1. The `action` itself might imply a campus scope (e.g., `person:read_campus` vs. `person:read_all`). 2. The `resourceDetails` are consulted. If the resource being accessed (or the context of creation) belongs to the `UserRoleAssignment.campusId`, permission is granted. 3. For list operations (e.g., "list all people"), a campus-scoped role means the underlying data query _must_ be filtered to only include records from the user's assigned campus(es). The `can()` check might inform this filtering, or the filtering might be inherent in how data access methods are implemented for scoped roles. 4. If the campuses don't align or `resourceDetails` are insufficient to confirm campus scope, permission for this specific resource/action via this role assignment is denied.
3.  If any role assignment grants the permission with the correct scope, the `can()` method returns `true`.
4.  If all role assignments are checked and none grant the permission, it returns `false`.

### Integration with OpenFaith Components

- **API Endpoints:** Middleware will protect API routes by calling `PermissionService.can()` before allowing controller logic to execute.
- **Service/Business Logic Layers:** Internal services will use `PermissionService.can()` to authorize operations.
- **AI Interaction Layer:** As detailed in the [AI-First Architecture](/docs/AIArch.md), AI-initiated tool calls or SQL fallbacks are executed under the security context of the authenticated user, with `PermissionService.can()` checks applied.
- **Client Sync (Zero):** Data synchronized to clients via Zero must respect read permissions. ZQL queries generated or executed by `zero-cache` will need to be filtered or validated based on the user's permissions, often by translating OpenFaith permission scopes into ZQL conditions.
- **Frontend SDK:** UI components generated or provided by the [Frontend SDK](/docs/FESdk.md) will conditionally render actions (e.g., "Edit" buttons) based on permissions checks, often by fetching permission states or relying on backend API responses that are already permission-filtered.

### Managing Permissions (Administrative UI)

OpenFaith will require administrative interfaces for:

- Creating and managing `Role` definitions and their associated permission strings.
- Assigning `Role`s to `User`s, including specifying `campusId` for scoped roles.
- (Potentially) Defining new `Permission` strings as the platform evolves.

### Future Enhancements

While the initial V1 focuses on RBAC with campus scoping, the OpenFaith permission model is designed to be extensible:

- **Finer-Grained Scoping:** Beyond campus, scoping could extend to `Folder`s, specific `Circle`s (e.g., "can only edit groups they lead," determined via `Edge` relationships), or other CDM entities.
- **Attribute-Based Access Control (ABAC):** Introducing policies that consider attributes of the user, resource, and action for more dynamic and complex authorization rules.
- **Permission Inheritance:** For hierarchical structures like `Folder`s or `Organization` hierarchies (in a denominational context).
- **Delegated Administration:** Allowing users with specific roles to manage permissions for a subset of users or resources.

### Conclusion

OpenFaith's authorization system, starting with Role-Based Access Control and campus scoping, provides a solid foundation for securing data and functionality. By centralizing permission checks in a `PermissionService` and ensuring this service is consulted by all data access points (APIs, AI Layer, Client Sync), OpenFaith aims to deliver a secure platform that can adapt to the varied access control needs of diverse ministry organizations. The close integration with the authentication layer (e.g., Better Auth) ensures that only verified users are subjected to these authorization rules.
