# AI Analytics

## Overview

AI-powered analytics for OpenFaith using LLM-generated SQL queries with PostgreSQL Row-Level Security (RLS) for org isolation.

## Row-Level Security for Org Isolation

OpenFaith uses PostgreSQL Row-Level Security (RLS) to enforce strict org-level data isolation. This ensures that queries automatically filter data by `orgId` without requiring application-level filtering logic.

### Implementation

### Enable RLS on All Tables

Every table with an `orgId` column must have RLS enabled:

```sql
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacraments ENABLE ROW LEVEL SECURITY;
-- Repeat for all org-scoped tables
```

### Create Org Isolation Policies

Each table needs a SELECT policy that filters by the session's `orgId`:

```sql
CREATE POLICY "org_isolation" ON people
  FOR SELECT
  TO authenticated
  USING (orgId = current_setting('app.current_org_id', true)::text);

CREATE POLICY "org_isolation" ON edges
  FOR SELECT
  TO authenticated
  USING (orgId = current_setting('app.current_org_id', true)::text);

CREATE POLICY "org_isolation" ON folders
  FOR SELECT
  TO authenticated
  USING (orgId = current_setting('app.current_org_id', true)::text);

-- Repeat for all org-scoped tables
```

**Key Points:**

- Policy applies to `authenticated` role only
- Uses `current_setting('app.current_org_id', true)` to read the session variable
- The `true` parameter prevents errors if the setting is not defined

### Setting the Org Context

Before executing any query, set the `orgId` for the database session:

```typescript
// Set org context for the current transaction
await db.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);

// Now all queries in this transaction are automatically filtered
const people = await db.select().from(peopleTable);
// Only returns people WHERE orgId = ${orgId}
```

**Important:** Use `SET LOCAL` (not `SET`) to ensure the setting is transaction-scoped and automatically cleared after the transaction completes.

## Usage Patterns

### Effect-Based Handler Example

```typescript
const executeOrgQuery = Effect.fn("executeOrgQuery")(function* (
  query: string,
  orgId: string
) {
  // Set org context
  yield* db.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);

  // Execute query - RLS automatically filters
  const results = yield* db.execute(sql.raw(query));

  return results;
});
```

### AI-Generated SQL Queries

RLS is particularly useful for AI-generated queries where you cannot trust the LLM to correctly filter by `orgId`:

```typescript
const executeAIQuery = Effect.fn("executeAIQuery")(function* (
  userQuestion: string,
  orgId: string
) {
  // 1. Set org scope
  yield* db.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);

  // 2. Generate SQL with LLM (no orgId filtering needed)
  const aiSQL = yield* generateSQL(userQuestion);

  // 3. Validate (SELECT only)
  if (!aiSQL.trim().toLowerCase().startsWith("select")) {
    return yield* Effect.fail(
      new ValidationError({
        message: "Only SELECT queries allowed",
      })
    );
  }

  // 4. Execute - Postgres enforces org isolation
  const results = yield* db.execute(sql.raw(aiSQL));

  return results;
});
```

## Bypassing RLS for Admin Operations

Backend services that need cross-org access should use a role with `bypassrls` privilege:

```sql
-- Create service role with RLS bypass
CREATE ROLE service_role WITH LOGIN BYPASSRLS;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
```

Then use a separate database connection with this role for admin operations:

```typescript
// Regular connection - RLS enforced
const userDB = drizzle(normalConnectionString);

// Admin connection - RLS bypassed
const adminDB = drizzle(adminConnectionString, {
  role: "service_role",
});
```

## Security Considerations

1. **Never trust application-level filtering** - RLS is enforced at the database layer even if application code is compromised
2. **Always use `SET LOCAL`** - Transaction-scoped settings prevent session pollution
3. **Validate query types** - Even with RLS, only allow SELECT queries for untrusted input (like AI-generated SQL)
4. **Limit service role usage** - Only use `bypassrls` roles for internal backend services, never expose credentials

## Testing RLS Policies

Verify policies work correctly:

```sql
-- Set org context
SET LOCAL app.current_org_id = 'org_123';

-- Should only return rows for org_123
SELECT * FROM people;

-- Switch org context
SET LOCAL app.current_org_id = 'org_456';

-- Should only return rows for org_456
SELECT * FROM people;
```

## Performance Optimization

RLS policies can impact query performance. See [RLS Performance Recommendations](https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations) for optimization strategies:

1. Add indexes on `orgId` columns
2. Use `(SELECT current_setting(...))` pattern for better query planning
3. Combine RLS with application-level filters for optimal performance

## Migration Checklist

When adding a new org-scoped table:

- [ ] Add `orgId VARCHAR NOT NULL` column
- [ ] Add index on `orgId`: `CREATE INDEX idx_tablename_orgid ON tablename(orgId)`
- [ ] Enable RLS: `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY`
- [ ] Create policy: `CREATE POLICY "org_isolation" ON tablename FOR SELECT TO authenticated USING (orgId = current_setting('app.current_org_id', true)::text)`
- [ ] Test with different `orgId` values
- [ ] Add to RLS test suite

## Database Schema Reference

Core OpenFaith tables for AI analytics queries. All tables include `orgId` for multi-tenancy (automatically filtered via RLS).

### Core Entity Tables

```sql
-- People: Core contact/member records
CREATE TABLE openfaith_people (
  id TEXT PRIMARY KEY,              -- Format: person_xxx (typeid)
  orgId TEXT NOT NULL,              -- Organization ID (auto-filtered via RLS)
  _tag CHAR(6) DEFAULT 'person',    -- Entity discriminator

  -- Personal Info
  firstName TEXT,
  lastName TEXT,
  middleName TEXT,
  name TEXT,                        -- Full name
  gender TEXT,                      -- Values: 'male', 'female'
  birthdate TEXT,                   -- ISO date string
  anniversary TEXT,                 -- ISO date string
  avatar TEXT,                      -- Profile image URL
  membership TEXT,                  -- Membership status

  -- Metadata
  customFields JSONB DEFAULT '[]',  -- User-defined fields
  externalIds JSONB DEFAULT '[]',   -- External system IDs
  tags JSONB DEFAULT '[]',          -- User tags
  type TEXT DEFAULT 'default',      -- Sub-type for specialization
  status TEXT DEFAULT 'active',     -- 'active', 'inactive'

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,  -- Soft delete
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);

-- Edges: Flexible relationships between any entities
-- Used for memberships, relationships, connections
CREATE TABLE openfaith_edges (
  orgId TEXT NOT NULL,
  sourceEntityId TEXT NOT NULL,
  targetEntityId TEXT NOT NULL,
  relationshipType TEXT NOT NULL,
  _tag CHAR(4) DEFAULT 'edge',

  sourceEntityTypeTag TEXT NOT NULL,  -- e.g., 'person', 'group', 'folder'
  targetEntityTypeTag TEXT NOT NULL,

  metadata JSONB DEFAULT '{}',        -- Relationship properties
                                      -- e.g., {"role": "leader", "joinedAt": "2024-01-15"}

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,

  PRIMARY KEY (orgId, sourceEntityId, targetEntityId, relationshipType)
);

-- Folders: Hierarchical organization structure
-- Generic container for organizing any entity type
CREATE TABLE openfaith_folders (
  id TEXT PRIMARY KEY,              -- Format: folder_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(6) DEFAULT 'folder',

  name TEXT NOT NULL,
  description TEXT,
  folderType TEXT,                  -- Semantic type: 'group_category', 'document_library', etc.
  parentFolderId TEXT,              -- Self-referential hierarchy

  -- Display hints
  icon TEXT,
  color TEXT,
  orderingKey TEXT,

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);

-- Campuses: Physical church locations
CREATE TABLE openfaith_campuses (
  id TEXT PRIMARY KEY,              -- Format: campus_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(6) DEFAULT 'campus',

  name TEXT NOT NULL,
  description TEXT,

  -- Location
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  countryCode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  avatar TEXT,
  url TEXT,

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  type TEXT DEFAULT 'default',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);
```

### Contact Information Tables

```sql
-- Phone Numbers: Linked to people via edges
CREATE TABLE openfaith_phoneNumbers (
  id TEXT PRIMARY KEY,              -- Format: phonenumber_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(11) DEFAULT 'phoneNumber',

  number TEXT,
  countryCode TEXT,
  type TEXT DEFAULT 'default',      -- 'mobile', 'home', 'work'
  location TEXT,                    -- Geographic location
  primary BOOLEAN DEFAULT false,

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);

-- Emails: Linked to people via edges
CREATE TABLE openfaith_emails (
  id TEXT PRIMARY KEY,              -- Format: email_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(5) DEFAULT 'email',

  address TEXT NOT NULL,
  type TEXT DEFAULT 'default',      -- 'personal', 'work'
  location TEXT,
  primary BOOLEAN DEFAULT false,
  blocked BOOLEAN DEFAULT false,

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);

-- Addresses: Physical addresses linked to people via edges
CREATE TABLE openfaith_addresses (
  id TEXT PRIMARY KEY,              -- Format: address_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(7) DEFAULT 'address',

  streetLine1 TEXT,
  streetLine2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  countryCode TEXT,
  location TEXT,
  type TEXT DEFAULT 'default',      -- 'home', 'work', 'mailing'
  primary BOOLEAN DEFAULT false,

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);
```

### Sacraments & Custom Data

```sql
-- Sacraments: Religious ceremonies/events
CREATE TABLE openfaith_sacraments (
  id TEXT PRIMARY KEY,              -- Format: sacrament_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(9) DEFAULT 'sacrament',

  type TEXT NOT NULL,               -- 'baptism', 'communion', 'wedding', etc.
  occurredAt TEXT,                  -- ISO date string
  receivedBy TEXT,                  -- Person ID
  administeredBy TEXT,              -- Person ID (clergy)

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);

-- Fields: Custom field definitions
CREATE TABLE openfaith_fields (
  id TEXT PRIMARY KEY,              -- Format: field_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(5) DEFAULT 'field',

  key TEXT NOT NULL,                -- Unique field key
  label TEXT NOT NULL,              -- Display label
  description TEXT,
  entityTag TEXT NOT NULL,          -- Which entity type this field applies to
  type TEXT DEFAULT 'singleSelect', -- 'singleSelect', 'multiSelect', 'text', etc.
  source TEXT,                      -- Data source if applicable

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);

-- Field Options: Options for select-type custom fields
CREATE TABLE openfaith_fieldOptions (
  id TEXT PRIMARY KEY,              -- Format: fieldoption_xxx
  orgId TEXT NOT NULL,
  _tag CHAR(11) DEFAULT 'fieldOption',

  fieldId TEXT NOT NULL,            -- References openfaith_fields.id
  value TEXT NOT NULL,              -- Option value
  label TEXT NOT NULL,              -- Display label
  order INTEGER DEFAULT 0,          -- Display order
  active BOOLEAN DEFAULT true,
  pathwayConfig JSONB DEFAULT '{}', -- Pathway-specific config

  -- Metadata
  customFields JSONB DEFAULT '[]',
  externalIds JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',

  -- Audit fields
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdBy TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE,
  updatedBy TEXT,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);
```

### Integration Tables (Reference Only)

```sql
-- External Links: Maps OpenFaith entities to external system IDs
-- Used by sync engine - generally not needed for analytics queries
CREATE TABLE openfaith_externalLinks (
  orgId TEXT NOT NULL,
  adapter TEXT NOT NULL,            -- 'pco', 'ccb', 'breeze', etc.
  externalId TEXT NOT NULL,         -- ID in external system
  entityId TEXT NOT NULL,           -- OpenFaith entity ID
  entityType TEXT NOT NULL,         -- OpenFaith entity type tag
  _tag CHAR(12) DEFAULT 'externalLink',

  lastProcessedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  syncing BOOLEAN DEFAULT false,
  updatedAt TIMESTAMP WITH TIME ZONE,
  deletedAt TIMESTAMP WITH TIME ZONE,
  deletedBy TEXT,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,

  PRIMARY KEY (orgId, adapter, externalId)
);
```

### Key Schema Concepts

**Edge Relationships:**

Edges connect ANY two entities with a `relationshipType`. The system uses **deterministic source/target assignment** based on ID alphabetical ordering to ensure consistency:

1. **Alpha Range Rule**: Compare first character of each ID
   - A-M range vs N-Z range: A-M becomes source, N-Z becomes target
   - Same range: Lexicographically smaller ID becomes source
   - Identical IDs: Allows self-linking (source = target)

2. **Relationship Type Naming**:
   - Format: `{sourceEntityType}_{relationship}_{targetEntityType}`
   - Examples: `person_member_of_group`, `person_has_email`, `folder_contains_document`
   - Simple has relationships: `person_has_phonenumber`

3. **Querying Edges**: Always account for bidirectional logic since edge direction is determined by ID, not semantic meaning

**Common Relationship Types:**

- `person_member_of_group` - Group membership
- `person_has_email` - Email ownership
- `person_has_phonenumber` - Phone ownership
- `person_lives_at_address` - Address association
- `person_leads_group` - Leadership relationship
- `folder_contains_{entity}` - Folder organization

**Example Queries:**

```sql
-- Count people by gender
SELECT gender, COUNT(*) as count
FROM openfaith_people
WHERE status = 'active'
  AND deletedAt IS NULL
GROUP BY gender;

-- Find people in a specific group (handles bidirectional edges)
-- IMPORTANT: Edges may be stored in either direction based on ID ordering
SELECT DISTINCT p.*
FROM openfaith_people p
JOIN openfaith_edges e ON (
  -- Person could be source or target depending on ID ordering
  (e.sourceEntityId = p.id AND e.targetEntityId = 'group_xyz' AND e.sourceEntityTypeTag = 'person') OR
  (e.targetEntityId = p.id AND e.sourceEntityId = 'group_xyz' AND e.targetEntityTypeTag = 'person')
)
WHERE e.relationshipType LIKE '%member_of%'
  AND p.deletedAt IS NULL
  AND e.deletedAt IS NULL;

-- Simplified: People with phone numbers (person ID < phonenumber ID usually)
SELECT p.firstName, p.lastName, ph.number, ph.type
FROM openfaith_people p
JOIN openfaith_edges e ON (
  (e.sourceEntityId = p.id AND e.targetEntityId = ph.id) OR
  (e.targetEntityId = p.id AND e.sourceEntityId = ph.id)
)
JOIN openfaith_phoneNumbers ph ON (
  ph.id = e.targetEntityId OR ph.id = e.sourceEntityId
)
WHERE e.relationshipType LIKE '%has_phonenumber%'
  AND ph.id != p.id  -- Exclude the person from phone results
  AND p.deletedAt IS NULL
  AND ph.deletedAt IS NULL
  AND e.deletedAt IS NULL;

-- People with their primary email
SELECT p.firstName, p.lastName, em.address
FROM openfaith_people p
JOIN openfaith_edges e ON (
  (e.sourceEntityId = p.id AND e.sourceEntityTypeTag = 'person') OR
  (e.targetEntityId = p.id AND e.targetEntityTypeTag = 'person')
)
JOIN openfaith_emails em ON (
  (em.id = e.targetEntityId AND e.targetEntityTypeTag = 'email') OR
  (em.id = e.sourceEntityId AND e.sourceEntityTypeTag = 'email')
)
WHERE e.relationshipType LIKE '%has_email%'
  AND em.primary = true
  AND p.deletedAt IS NULL
  AND em.deletedAt IS NULL
  AND e.deletedAt IS NULL;

-- Groups with member counts
SELECT
  CASE
    WHEN e.sourceEntityTypeTag = 'group' THEN e.sourceEntityId
    ELSE e.targetEntityId
  END as group_id,
  COUNT(*) as member_count
FROM openfaith_edges e
WHERE e.relationshipType LIKE '%member_of%'
  AND e.deletedAt IS NULL
  AND (e.sourceEntityTypeTag = 'group' OR e.targetEntityTypeTag = 'group')
  AND (e.sourceEntityTypeTag = 'person' OR e.targetEntityTypeTag = 'person')
GROUP BY group_id;

-- People at a specific campus (via edges)
SELECT DISTINCT p.*
FROM openfaith_people p
JOIN openfaith_edges e ON (
  (e.sourceEntityId = p.id AND e.sourceEntityTypeTag = 'person') OR
  (e.targetEntityId = p.id AND e.targetEntityTypeTag = 'person')
)
JOIN openfaith_campuses c ON (
  (c.id = e.targetEntityId AND e.targetEntityTypeTag = 'campus') OR
  (c.id = e.sourceEntityId AND e.sourceEntityTypeTag = 'campus')
)
WHERE e.relationshipType LIKE '%attends%'
  AND c.name = 'Downtown Campus'
  AND p.deletedAt IS NULL
  AND c.deletedAt IS NULL
  AND e.deletedAt IS NULL;
```

**Helper Function for Edge Queries:**

When querying edges, you often need to check both directions. Use this pattern:

```sql
-- Generic pattern for finding entities related via edges
-- Replace {entityA}, {entityB}, {typeA}, {typeB}, {relationship} with actual values

SELECT DISTINCT entity.*
FROM openfaith_{entityB} entity
JOIN openfaith_edges e ON (
  -- Check both possible directions
  (e.sourceEntityId = entity.id AND e.sourceEntityTypeTag = '{typeB}' AND
   e.targetEntityId = '{entityA_id}' AND e.targetEntityTypeTag = '{typeA}') OR
  (e.targetEntityId = entity.id AND e.targetEntityTypeTag = '{typeB}' AND
   e.sourceEntityId = '{entityA_id}' AND e.sourceEntityTypeTag = '{typeA}')
)
WHERE e.relationshipType LIKE '%{relationship}%'
  AND entity.deletedAt IS NULL
  AND e.deletedAt IS NULL;
```

**JSONB Fields:**

- `customFields`: Array of custom field values
- `externalIds`: Array of {adapter, id} pairs
- `tags`: Array of string tags
- `metadata` (on edges): Object with relationship-specific properties

**Soft Deletes:**

- Records are never hard-deleted
- Check `deletedAt IS NULL` to filter active records
- `status = 'active'` is additional active/inactive flag
