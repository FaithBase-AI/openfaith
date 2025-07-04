# 04: Defining Endpoints (Current Implementation)

**⚠️ Note: This document describes the current implementation using `pcoApiAdapter()`. The original design with `defineEndpoint()` is planned for the future.**

Endpoints are the building blocks of your API adapter. Each endpoint is described by a single configuration object passed to the `pcoApiAdapter()` helper function. This approach ensures that all endpoint definitions are type-safe and consistent with PCO's JSON:API format.

These definitions are pure data—they contain no live connections or runtime logic. They serve as a blueprint that the HttpApiClient setup later uses to construct the live, executable client.

## The `pcoApiAdapter` Function (Current)

This is the current utility function you import from the PCO adapter library. It takes a single configuration object and automatically generates the appropriate response schemas for PCO's JSON:API structure.

### Core Properties

These are the mandatory fields that every endpoint definition must have.

*   **`module: string`**
    The top-level API module this endpoint belongs to (e.g., `'people'`, `'groups'`). This corresponds to the HttpApiGroup name in the generated client.

*   **`entity: string`**
    The entity name this endpoint operates on (e.g., `'Person'`, `'Group'`). Used for type safety and documentation.

*   **`name: string`**
    The endpoint operation name (e.g., `'list'`, `'getById'`, `'create'`). This becomes the method name in the final API client.

*   **`method: 'GET' | 'POST' | 'PATCH' | 'DELETE'`**
    The HTTP method for the endpoint.

*   **`path: string`**
    The URL path for the endpoint. Path parameters should be specified using the `:paramName` syntax (e.g., `/people/v2/people/:personId`).

*   **`apiSchema: Schema.Schema`**
    The `effect/Schema` for the raw PCO API resource. This should match the structure of individual items as returned by PCO's API.

### Collection vs. Single Resource Endpoints

*   **`isCollection: boolean`**
    Whether this endpoint returns a collection of resources (true) or a single resource (false). This affects the generated response schema:
    - **Collection endpoints** get wrapped in PCO's paginated collection format with `data`, `included`, `links`, and `meta` properties
    - **Single resource endpoints** get wrapped in PCO's single resource format with `data` and `included` properties

### Collection-Specific Properties

For endpoints where `isCollection: true`, you can specify additional query capabilities:

*   **`includes: ReadonlyArray<string>`**
    Available relationships that can be included via the `?include=` query parameter.

*   **`orderableBy: ReadonlyArray<string>`**
    Fields that can be used for ordering responses via the `?order=` query parameter.

*   **`queryableBy: { fields: ReadonlyArray<string>, special: ReadonlyArray<string> }`**
    - **`fields`**: Fields that can be queried with standard where clauses (e.g., `?where[first_name]=John`)
    - **`special`**: Special query parameters specific to this endpoint (e.g., `?search_name=John`)

### Mutation-Specific Properties

For POST endpoints:
*   **`creatableFields: ReadonlyArray<string>`**
    Fields that can be set when creating a new resource.

For PATCH endpoints:
*   **`updatableFields: ReadonlyArray<string>`**
    Fields that can be updated when modifying an existing resource.

### Complete Examples

**1. Collection Endpoint:** Fetching all people

```typescript
import { pcoApiAdapter } from '@openfaith/pco/api/pcoApiAdapter'
import { PcoPerson } from '@openfaith/pco/modules/people/pcoPersonSchema'

export const getAllPeopleDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  method: 'GET',
  module: 'people',
  name: 'list',
  path: '/people/v2/people',
  isCollection: true,
  
  includes: [
    'addresses',
    'emails',
    'primary_campus',
    'field_data',
    'households',
    'inactive_reason',
    'marital_status',
    'name_prefix',
    'name_suffix',
    'organization',
    'person_apps',
    'phone_numbers',
    'platform_notifications',
    'school',
    'social_profiles',
  ],
  
  orderableBy: [
    'accounting_administrator',
    'anniversary',
    'birthdate',
    'child',
    'created_at',
    'first_name',
    'gender',
    'given_name',
    'grade',
    'graduation_year',
    'inactivated_at',
    'membership',
    'middle_name',
    'nickname',
    'people_permissions',
    'remote_id',
    'site_administrator',
    'status',
    'updated_at',
  ],
  
  queryableBy: {
    fields: [
      'accounting_administrator',
      'anniversary',
      'birthdate',
      'child',
      'created_at',
      'first_name',
      'gender',
      'given_name',
      'grade',
      'graduation_year',
      'inactivated_at',
      'last_name',
      'medical_notes',
      'membership',
      'middle_name',
      'nickname',
      'people_permissions',
      'remote_id',
      'site_administrator',
      'status',
      'updated_at',
    ],
    special: [
      'id',
      'date_time',
      'mfa_configured',
      'primary_campus_id',
      'search_name',
      'search_name_or_email',
      'search_name_or_email_or_phone_number',
      'search_phone_number',
      'search_phone_number_e164',
    ],
  },
} as const)
```

**2. Single Resource Endpoint:** Fetching a person by ID

```typescript
export const getPersonByIdDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  method: 'GET',
  module: 'people',
  name: 'getById',
  path: '/people/v2/people/:personId',
  isCollection: false,
  
  includes: getAllPeopleDefinition.includes, // Reuse the same includes
} as const)
```

**3. Creation Endpoint:** Creating a new person

```typescript
export const createPersonDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  method: 'POST',
  module: 'people',
  name: 'create',
  path: '/people/v2/people',
  
  creatableFields: [
    'first_name',
    'last_name',
    'anniversary',
    'birthdate',
    'gender',
    'grade',
    'graduation_year',
    'child',
    'status',
    'inactivated_at',
    'remote_id',
    'medical_notes',
    'membership',
    'middle_name',
    'nickname',
    'people_permissions',
    'accounting_administrator',
    'site_administrator',
    'avatar',
  ],
} as const)
```

**4. Update Endpoint:** Updating an existing person

```typescript
export const updatePersonDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  method: 'PATCH',
  module: 'people',
  name: 'update',
  path: '/people/v2/people/:personId',
  
  updatableFields: createPersonDefinition.creatableFields, // Same fields as creation
} as const)
```

**5. Deletion Endpoint:** Deleting a person

```typescript
export const deletePersonDefinition = pcoApiAdapter({
  apiSchema: PcoPerson,
  entity: 'Person',
  method: 'DELETE',
  module: 'people',
  name: 'delete',
  path: '/people/v2/people/:personId',
} as const)
```

## Response Schema Generation

The `pcoApiAdapter()` function automatically generates the appropriate response schemas based on the method and collection type:

- **GET Collection**: Wraps the `apiSchema` in PCO's collection format with pagination metadata
- **GET Single**: Wraps the `apiSchema` in PCO's single resource format
- **POST/PATCH**: Returns the created/updated resource in single resource format  
- **DELETE**: Returns void with 204 status

## Current vs. Planned Implementation

### What Works Today:
- ✅ Type-safe endpoint definitions with `pcoApiAdapter()`
- ✅ Automatic response schema generation for PCO's JSON:API format
- ✅ Support for all HTTP methods (GET, POST, PATCH, DELETE)
- ✅ Collection vs. single resource distinction
- ✅ Query capability metadata (includes, orderable, queryable fields)

### What's Planned (Future):
- 🚧 **Generic `defineEndpoint()` function**: API-agnostic endpoint definition
- 🚧 **Canonical schema support**: Transformation to internal data models
- 🚧 **Sync engine metadata**: webhook support, delta sync fields, etc.
- 🚧 **Cross-API compatibility**: Support for different API formats beyond PCO

The current implementation provides a solid foundation that focuses specifically on PCO's API structure while maintaining the flexibility to expand to the more generic approach in the future.