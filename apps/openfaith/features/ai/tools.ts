import { anthropic } from '@ai-sdk/anthropic'
import { dbConnection } from '@openfaith/server'
import { generateObject, tool } from 'ai'
import { z } from 'zod'

export const explanationSchema = z.object({
  explanation: z.string(),
  section: z.string(),
})
export const explanationsSchema = z.array(explanationSchema)

// Define the schema for chart configuration
export const configSchema = z
  .object({
    colors: z
      .record(
        z.string().describe('Any of the yKeys'),
        z.string().describe('Color value in CSS format (e.g., hex, rgb, hsl)'),
      )
      .describe('Mapping of data keys to color values for chart elements')
      .optional(),
    description: z
      .string()
      .describe(
        'Describe the chart. What is it showing? What is interesting about the way the data is displayed?',
      ),
    legend: z.boolean().describe('Whether to show legend'),
    lineCategories: z
      .array(z.string())
      .describe(
        'For line charts only: Categories used to compare different lines or data series. Each category represents a distinct line in the chart.',
      )
      .optional(),
    measurementColumn: z
      .string()
      .describe(
        'For line charts only: key for quantitative y-axis column to measure against (eg. values, counts etc.)',
      )
      .optional(),
    multipleLines: z
      .boolean()
      .describe('For line charts only: whether the chart is comparing groups of data.')
      .optional(),
    takeaway: z.string().describe('What is the main takeaway from the chart?'),
    title: z.string(),
    type: z.enum(['bar', 'line', 'area', 'pie']).describe('Type of chart'),
    xKey: z.string().describe('Key for x-axis or category'),
    yKeys: z
      .array(z.string())
      .describe('Key(s) for y-axis values this is typically the quantitative column'),
  })
  .describe('Chart configuration object')

export const Result = z.record(z.string(), z.union([z.string(), z.number()]))
export type Result = z.infer<typeof Result>

export type Config = z.infer<typeof configSchema>

const tableSchema = `
### Core Entity Tables

\`\`\`sql
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
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);
\`\`\`

### Contact Information Tables

\`\`\`sql
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
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);
\`\`\`

### Sacraments & Custom Data

\`\`\`sql
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
  inactivatedAt TIMESTAMP WITH TIME ZONE,
  inactivatedBy TEXT
);
\`\`\`

### Integration Tables (Reference Only)

\`\`\`sql
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
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,

  PRIMARY KEY (orgId, adapter, externalId)
);
\`\`\`

### Key Schema Concepts

**Edge Relationships:**

Edges connect ANY two entities. The system uses **deterministic source/target assignment** based on ID alphabetical ordering to ensure consistency:

1. **Alpha Range Rule**: Compare first character of each ID
   - A-M range vs N-Z range: A-M becomes source, N-Z becomes target
   - Same range: Lexicographically smaller ID becomes source
   - Identical IDs: Allows self-linking (source = target)

3. **Querying Edges**: Always account for bidirectional logic since edge direction is determined by ID, not semantic meaning


**Example Queries:**

\`\`\`sql
-- Count people by gender (note: ALL column names must be quoted)
SELECT "gender", COUNT(*) as count
FROM openfaith_people
WHERE "status" = 'active'
GROUP BY "gender";

-- Find people in a specific group (handles bidirectional edges)
-- IMPORTANT: Edges may be stored in either direction based on ID ordering
SELECT DISTINCT p.*
FROM openfaith_people p
JOIN openfaith_edges e ON (
  -- Person could be source or target depending on ID ordering
  (e."sourceEntityId" = p."id" AND e."targetEntityId" = 'group_xyz' AND e."sourceEntityTypeTag" = 'person') OR
  (e."targetEntityId" = p."id" AND e."sourceEntityId" = 'group_xyz' AND e."targetEntityTypeTag" = 'person')
);

-- Simplified: People with phone numbers (person ID < phonenumber ID usually)
SELECT p."firstName", p."lastName", ph."number", ph."type"
FROM openfaith_people p
JOIN openfaith_edges e ON (
  (e."sourceEntityId" = p."id" AND e."targetEntityId" = ph."id") OR
  (e."targetEntityId" = p."id" AND e."sourceEntityId" = ph."id")
)
JOIN openfaith_phoneNumbers ph ON (
  ph."id" = e."targetEntityId" OR ph."id" = e."sourceEntityId"
)
WHERE ph."id" != p."id";  -- Exclude the person from phone results;

-- People with their primary email
SELECT p."firstName", p."lastName", em."address"
FROM openfaith_people p
JOIN openfaith_edges e ON (
  (e."sourceEntityId" = p."id" AND e."sourceEntityTypeTag" = 'person') OR
  (e."targetEntityId" = p."id" AND e."targetEntityTypeTag" = 'person')
)
JOIN openfaith_emails em ON (
  (em."id" = e."targetEntityId" AND e."targetEntityTypeTag" = 'email') OR
  (em."id" = e."sourceEntityId" AND e."sourceEntityTypeTag" = 'email')
)
WHERE em."primary" = true;

-- Groups with member counts (includes groups with no members using LEFT JOIN)
SELECT
  g."id",
  g."name",
  COALESCE(COUNT(DISTINCT CASE 
    WHEN e."sourceEntityTypeTag" = 'person' THEN e."sourceEntityId"
    WHEN e."targetEntityTypeTag" = 'person' THEN e."targetEntityId"
  END), 0) as member_count
FROM openfaith_folders g
LEFT JOIN openfaith_edges e ON (
  ((e."sourceEntityId" = g."id" AND e."sourceEntityTypeTag" = 'folder') OR
   (e."targetEntityId" = g."id" AND e."targetEntityTypeTag" = 'folder'))
)
WHERE g."folderType" = 'group'
  AND g."status" = 'active'
GROUP BY g."id", g."name"
ORDER BY member_count DESC;

-- Campuses with people counts (includes campuses with no people using LEFT JOIN)
SELECT 
  c."id",
  c."name" as campus_name,
  COALESCE(COUNT(DISTINCT p."id"), 0) as people_count
FROM openfaith_campuses c
LEFT JOIN openfaith_edges e ON (
  (e."sourceEntityId" = c."id" AND e."sourceEntityTypeTag" = 'campus') OR
  (e."targetEntityId" = c."id" AND e."targetEntityTypeTag" = 'campus')
)
LEFT JOIN openfaith_people p ON (
  ((p."id" = e."targetEntityId" AND e."targetEntityTypeTag" = 'person') OR
   (p."id" = e."sourceEntityId" AND e."sourceEntityTypeTag" = 'person')) AND
  p."status" = 'active'
)
WHERE c."status" = 'active'
GROUP BY c."id", c."name"
ORDER BY people_count DESC;

-- People at a specific campus (via edges)
SELECT DISTINCT p.*
FROM openfaith_people p
JOIN openfaith_edges e ON (
  (e."sourceEntityId" = p."id" AND e."sourceEntityTypeTag" = 'person') OR
  (e."targetEntityId" = p."id" AND e."targetEntityTypeTag" = 'person')
)
JOIN openfaith_campuses c ON (
  (c."id" = e."targetEntityId" AND e."targetEntityTypeTag" = 'campus') OR
  (c."id" = e."sourceEntityId" AND e."sourceEntityTypeTag" = 'campus')
)
WHERE c."name" = 'Downtown Campus'
  AND p."status" = 'active';
\`\`\`

**Helper Function for Edge Queries:**

When querying edges, you often need to check both directions. Use this pattern:

\`\`\`sql
-- Generic pattern for finding entities related via edges
-- Replace {entityA}, {entityB}, {typeA}, {typeB}, {relationship} with actual values
-- REMEMBER: Quote all column names!

SELECT DISTINCT entity.*
FROM openfaith_{entityB} entity
JOIN openfaith_edges e ON (
  -- Check both possible directions
  (e."sourceEntityId" = entity."id" AND e."sourceEntityTypeTag" = '{typeB}' AND
   e."targetEntityId" = '{entityA_id}' AND e."targetEntityTypeTag" = '{typeA}') OR
  (e."targetEntityId" = entity."id" AND e."targetEntityTypeTag" = '{typeB}' AND
   e."sourceEntityId" = '{entityA_id}' AND e."sourceEntityTypeTag" = '{typeA}')
);
\`\`\`

**JSONB Fields:**

- \`customFields\`: Array of custom field values
- \`externalIds\`: Array of {adapter, id} pairs
- \`tags\`: Array of string tags
- \`metadata\` (on edges): Object with relationship-specific properties

**Soft Deletes:**

- Records are never hard-deleted
- \`status = 'active'\` is additional active/inactive flag`

export const generateQuery = async (params: { query: string }): Promise<{ query: string }> => {
  'use server'
  try {
    const { query } = params
    console.log('generateQuery query', query)

    const result = await generateObject({
      model: anthropic('claude-haiku-4-5'),
      prompt: `Generate the query necessary to retrieve the data the user wants: ${query}`,
      schema: z.object({
        query: z.string(),
      }),
      system: `You are a SQL (postgres) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. The table schema is as follows:

      ${tableSchema}

    Only retrieval queries are allowed.

    CRITICAL: PostgreSQL is case-sensitive. ALL column names MUST be wrapped in double quotes. For example:
    - CORRECT: SELECT "firstName", "lastName" FROM openfaith_people
    - WRONG: SELECT firstName, lastName FROM openfaith_people
    - CORRECT: WHERE e."sourceEntityId" = p."id"
    - WRONG: WHERE e.sourceEntityId = p.id
    
    This applies to ALL column references including in WHERE, JOIN, ORDER BY, GROUP BY, and SELECT clauses.

    CRITICAL: When counting relationships via edges, ALWAYS use LEFT JOIN to include entities with zero relationships.
    - CORRECT: FROM openfaith_campuses c LEFT JOIN openfaith_edges e ON (...)
    - WRONG: FROM openfaith_campuses c JOIN openfaith_edges e ON (...)
    - Use COALESCE(COUNT(DISTINCT related_entity."id"), 0) to ensure zero counts are shown
    - This ensures entities without relationships are included in results (e.g., campuses with no people)

    If the user asks for 'over time' data, return by month.

    EVERY QUERY SHOULD RETURN QUANTITATIVE DATA THAT CAN BE PLOTTED ON A CHART! There should always be at least two columns. If the user asks for a single column, return the column and the count of the column. If the user asks for a rate, return the rate as a decimal. For example, 0.1 would be 10%.
    `,
    })

    console.log('generateQuery result', result.object)
    return result.object
  } catch (e) {
    console.error(e)
    throw new Error('Failed to generate query')
  }
}

export const generateQueryTool = tool({
  description: 'Generate a SQL query to retrieve the data the user wants.',
  execute: generateQuery,
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    query: z.string(),
  }),
})

export const runGenerateSQLQuery = async (params: { query: string }) => {
  const { query } = params

  console.log('runGenerateSQLQuery query', query)
  if (
    !query.trim().toLowerCase().startsWith('select') ||
    query.trim().toLowerCase().includes('drop') ||
    query.trim().toLowerCase().includes('delete') ||
    query.trim().toLowerCase().includes('insert') ||
    query.trim().toLowerCase().includes('update') ||
    query.trim().toLowerCase().includes('alter') ||
    query.trim().toLowerCase().includes('truncate') ||
    query.trim().toLowerCase().includes('create') ||
    query.trim().toLowerCase().includes('grant') ||
    query.trim().toLowerCase().includes('revoke')
  ) {
    throw new Error('Only SELECT queries are allowed')
  }

  let data: any
  try {
    data = await dbConnection.unsafe(query)
  } catch (e: any) {
    console.error('runGenerateSQLQuery error', e)

    if (e.message.includes('relation "unicorns" does not exist')) {
      console.log('Table does not exist, creating and seeding it with dummy data now...')
      // throw error
      throw Error('Table does not exist')
    }
    throw e
  }

  console.log('runGenerateSQLQuery data', data)

  return data as Array<Result>
}

export const runQueryTool = tool({
  description: 'Run a SQL query and return the results.',
  execute: runGenerateSQLQuery,
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.array(Result),
})
export const explainQuery = async (input: string, sqlQuery: string) => {
  'use server'
  try {
    const result = await generateObject({
      model: anthropic('claude-haiku-4-5'),
      prompt: `Explain the SQL query you generated to retrieve the data the user wanted. Assume the user is not an expert in SQL. Break down the query into steps. Be concise.

      User Query:
      ${input}

      Generated SQL Query:
      ${sqlQuery}`,
      schema: z.object({
        explanations: explanationsSchema,
      }),
      system: `You are a SQL (postgres) expert. Your job is to explain to the user write a SQL query you wrote to retrieve the data they asked for. The table schema is as follows:
   
      ${tableSchema}

    When you explain you must take a section of the query, and then explain it. Each "section" should be unique. So in a query like: "SELECT * FROM openfaith_people limit 20", the sections could be "SELECT *", "FROM openfaith_people", "LIMIT 20".
    If a section doesn't have any explanation, include it, but leave the explanation empty.
    
    Note: All column names are wrapped in double quotes because PostgreSQL is case-sensitive.

    `,
    })
    return result.object
  } catch (e) {
    console.error(e)
    throw new Error('Failed to generate query')
  }
}

export const generateChartConfig = async (params: {
  results: Array<Result>
  userQuery: string
}) => {
  const { results, userQuery } = params
  console.log('generateChartConfig results', results)
  console.log('generateChartConfig userQuery', userQuery)
  ;('use server')
  const system = `You are a data visualization expert. `

  try {
    const { object: config } = await generateObject({
      model: anthropic('claude-haiku-4-5'),
      prompt: `Given the following data from a SQL query result, generate the chart config that best visualizes the data and answers the users query.
      For multiple groups use multi-lines.

      Here is an example complete config:
      export const chartConfig = {
        type: "pie",
        xKey: "month",
        yKeys: ["sales", "profit", "expenses"],
        colors: {
          sales: "#4CAF50",    // Green for sales
          profit: "#2196F3",   // Blue for profit
          expenses: "#F44336"  // Red for expenses
        },
        legend: true
      }

      User Query:
      ${userQuery}

      Data:
      ${JSON.stringify(results, null, 2)}`,
      schema: configSchema,
      system,
    })

    const colors: Record<string, string> = {}
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`
    })

    const updatedConfig: Config = { ...config, colors }
    console.log('generateChartConfig updatedConfig', updatedConfig)
    return { config: updatedConfig }
  } catch (e) {
    // @ts-expect-error
    console.error(e.message)
    throw new Error('Failed to generate chart suggestion')
  }
}

export const generateChartConfigTool = tool({
  description: 'Generate a chart config based on the data and user query.',
  execute: generateChartConfig,
  inputSchema: z.object({
    results: z.array(Result),
    userQuery: z.string(),
  }),
  outputSchema: z.object({
    config: configSchema,
  }),
})
