## Authentication and Authorization in OpenFaith

OpenFaith provides robust and flexible mechanisms for both **Authentication (AuthN)** – verifying who a user is – and **Authorization (AuthZ)** – determining what an authenticated user is allowed to do. The platform leverages [**Better Auth**](https://better-auth.com) (or your chosen auth library, this doc assumes Better Auth based on provided context) as its foundational authentication framework, while implementing its own role-based access control (RBAC) system for authorization, tailored to the needs of diverse ministry organizations.

### I. Authentication (AuthN) - Powered by Better Auth

OpenFaith utilizes Better Auth to handle the complexities of user authentication, offering a variety of common and secure sign-in methods.

**1. Core Authentication Instance (`auth.ts`):**
A central Better Auth instance will be configured within the OpenFaith backend. This instance will be responsible for:
_ Connecting to the OpenFaith database (PostgreSQL via Drizzle, as supported by Better Auth) to store user, account, session, and verification data.
_ Defining enabled authentication methods. \* Managing security settings (secret keys, cookie configurations, rate limits).

**2. Supported Authentication Methods:**
OpenFaith will, through Better Auth, support:
_ **Email & Password:** Standard credential-based login, with features like secure password hashing (e.g., scrypt), email verification, and password reset flows.
_ _(Ref: Better Auth - Email & Password)_
_ **Social Sign-On (OAuth 2.0 / OIDC):** Integration with common providers like Google, GitHub, Apple, Facebook, etc. OpenFaith will store the necessary `clientId` and `clientSecret` for these providers.
_ _(Ref: Better Auth - Social Sign-On, specific provider docs)_
_ **Plugin-Based Extensions:** OpenFaith can leverage Better Auth's plugin system to easily add other authentication methods as needed in the future, such as:
_ Magic Links
_ Passkeys (WebAuthn)
_ Email OTP / Phone Number OTP
_ Single Sign-On (SSO) via generic OIDC providers.
_ _(Ref: Better Auth - Using Plugins, specific plugin docs)_

**3. Client-Side Interaction (`authClient.ts`):**
_ The OpenFaith frontend (and its SDK) will use a Better Auth client instance (`authClient`) to interact with the authentication backend.
_ This client will handle:
_ Invoking sign-up and sign-in flows (e.g., `authClient.signUp.email()`, `authClient.signIn.social({ provider: 'google' })`).
_ Managing user sessions on the client-side (e.g., using `authClient.useSession()` for reactive session state).
_ Initiating sign-out (`authClient.signOut()`).
_ _(Ref: Better Auth - Client, Basic Usage)_

**4. Session Management:**
_ Better Auth will manage user sessions using secure, HTTP-only cookies. Session data (including expiration, refresh mechanisms, and links to the user ID) will be stored in the OpenFaith database.
_ Features like session revocation and listing active sessions will be available. \* _(Ref: Better Auth - Session Management, Cookies)_

**5. Security Features from Better Auth:**
_ OpenFaith will inherit security best practices from Better Auth, including:
_ CSRF protection (via origin checking).
_ Secure password hashing.
_ Rate limiting on authentication endpoints.
_ OAuth state and PKCE handling.
_ _(Ref: Better Auth - Security)_

**OpenFaith User Mapping:**

- The `User` entity created by Better Auth (stored in tables like `user`, `account`, `session`) will directly map to OpenFaith's core `User` entity within the "Management" module of the CDM.
- OpenFaith may extend Better Auth's `user` table with `additionalFields` to store OpenFaith-specific user attributes not covered by Better Auth's default schema, or use its `Edge` system to link OpenFaith `User` entities to other CDM entities.

### II. Authorization (AuthZ) - OpenFaith's Role-Based Access Control

Once a user is authenticated by Better Auth, OpenFaith's own authorization system determines what actions they can perform and what data they can access. For V1, OpenFaith will implement a Role-Based Access Control (RBAC) system with campus scoping.

**(This is where the content from your `Permissions.md` document, detailing OpenFaith's RBAC model, `Role` entity, `UserRoleAssignment`, `campusId` scoping, and the `PermissionService.can()` logic, would be integrated or extensively referenced.)**

**Key Aspects of OpenFaith Authorization:**

1.  **`User` Entity:** The authenticated user (from Better Auth) is the **Subject** performing an action.
2.  **`Role` Entity (OpenFaith CDM):** Defines a set of permissions. Examples: "Global Admin," "Campus Admin," "Campus Staff," "Member."
3.  **`UserRoleAssignment` (OpenFaith CDM):** Links a `User` to one or more `Role`s, potentially scoped to a specific `Campus.id`.
    - If `campusId` on the assignment is NULL, the role's permissions apply globally within the organization.
    - If `campusId` is set, the role's permissions are restricted to that campus context.
4.  **`Permission` Strings:** Granular actions defined within OpenFaith (e.g., "person:create", "event:read_all_campus", "group:update_own"). Roles are granted collections of these permission strings.
5.  **`PermissionService.can(user, action, resourceDetails)`:** A central service in the OpenFaith backend that evaluates if the authenticated `user` can perform the requested `action`, considering their roles, role scopes (campus), and potentially attributes of the `resourceDetails` (like the campus an entity belongs to).
6.  **Default Deny:** Access is denied unless explicitly granted by a role and its associated permissions.

**Interaction with AI and Client Sync:**

- **AI Layer:** When the AI/LLM layer receives a natural language request that translates into a data operation (tool call or SQL fallback), the `PermissionService.can()` check is performed _before_ execution, using the authenticated user's context. The AI does not bypass permissions.
- **Client Sync (Zero):** The data replicated to the client via Zero must also respect read permissions. This means server-side ZQL queries executed by `zero-cache` will need to be augmented or filtered based on the `PermissionService`'s evaluation for the connected user. (This integration between OpenFaith's permission model and Zero's ZQL-based permissions will be a critical design point).

### Bridging Better Auth Session with OpenFaith Permissions

1.  **Session to User Context:** When a request comes into the OpenFaith API (or an internal service like the AI Orchestrator or Sync Engine needs to act on behalf of a user):
    a. Better Auth's server-side `auth.api.getSession({ headers })` is used to validate the session cookie/token and retrieve the authenticated `User` object (which is an OpenFaith `User`).
    b. This `User` object, along with their `orgId`, becomes the input for the `PermissionService`.
2.  **Enforcement:**
    a. API Endpoints: Middleware will use `PermissionService.can()` to protect routes.
    b. Service Layers: Business logic will invoke `PermissionService.can()` before performing sensitive operations.

### Future Considerations

- **More Granular Permissions:** Evolving beyond campus scoping to include permissions based on `Folder` access, `Edge` relationships (e.g., "can edit `Group`s they lead"), or even Attribute-Based Access Control (ABAC).
- **Delegated Administration:** Allowing certain users to manage roles or permissions for specific subsets of users or resources.

### Conclusion

OpenFaith combines the strengths of a dedicated authentication framework like Better Auth for robust user sign-in and session management, with its own flexible, ministry-aware RBAC system for fine-grained authorization. This layered approach ensures secure access to the platform while providing the adaptability needed for diverse organizational structures and future growth in permission complexity. The authenticated user context derived from Better Auth is the critical input into OpenFaith's permission evaluation, ensuring all data access and operations are properly authorized.
