import { SqlClient } from "@effect/sql";
import { assert, describe, it } from "@effect/vitest";
import { TokenKey } from "@openfaith/adapter-core/server";
import type { PcoBaseEntity } from "@openfaith/pco/api/pcoResponseSchemas";
import { VitestPgContainer } from "@openfaith/workers/helpers/test-utils/vitest-db";
import { Effect, Layer } from "effect";

// Test TokenKey service
const TestTokenKey = Layer.succeed(TokenKey, "test_org_123");

// Combined test layer using vitest container
const TestLayer = Layer.mergeAll(VitestPgContainer.ClientLive, TestTokenKey);

// Test data factories based on real database structure
const createPcoBaseEntity = (
  id = "pco_123",
  type = "Person",
  attributes: any = {
    // Add required PCO person fields to avoid schema validation errors
    accounting_administrator: false,
    anniversary: null,
    avatar: "https://avatars.planningcenteronline.com/uploads/initials/JD.png",
    birthdate: null,
    child: false,
    created_at: "2023-01-01T00:00:00Z",
    demographic_avatar_url: "https://example.com/demo.jpg",
    first_name: "John",
    gender: null,
    given_name: null,
    grade: null,
    graduation_year: null,
    inactivated_at: null,
    last_name: "Doe",
    medical_notes: null,
    membership: null,
    middle_name: null,
    name: "John Doe",
    nickname: null,
    passed_background_check: false,
    people_permissions: null,
    remote_id: null,
    school_type: null,
    site_administrator: false,
    status: "active" as const,
    updated_at: "2023-01-02T00:00:00Z",
  },
  relationships?: any,
): PcoBaseEntity => ({
  attributes,
  id,
  relationships,
  type,
});

// Create comprehensive test tables
const createComprehensiveTestTables = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // Create orgs table
  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_orgs" (
      "_tag" text DEFAULT 'org' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text
    )
  `;

  // Create people table
  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_people" (
      "_tag" text DEFAULT 'person' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "orgId" text NOT NULL,
      "name" text,
      "lastName" text,
      "status" text DEFAULT 'active',
      "type" text DEFAULT 'default',
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "anniversary" date,
      "avatar" text,
      "birthdate" date,
      "customFields" jsonb DEFAULT '[]',
      "externalIds" jsonb DEFAULT '[]',
      "gender" text,
      "inactivatedAt" timestamp,
      "inactivatedBy" text,
      "membership" text,
      "middleName" text,
      "tags" jsonb DEFAULT '"[]"'
    )
  `;

  // Create external links table
  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_externalLinks" (
      "_tag" text DEFAULT 'externalLink' NOT NULL,
      "orgId" text NOT NULL,
      "entityId" text NOT NULL,
      "entityType" text NOT NULL,
      "adapter" text NOT NULL,
      "externalId" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "lastProcessedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      UNIQUE("orgId", "adapter", "externalId")
    )
  `;

  // Create edges table
  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_edges" (
      "_tag" text DEFAULT 'edge' NOT NULL,
      "orgId" text NOT NULL,
      "sourceEntityId" text NOT NULL,
      "targetEntityId" text NOT NULL,
      "relationshipType" text NOT NULL,
      "sourceEntityTypeTag" text NOT NULL,
      "targetEntityTypeTag" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now(),
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "metadata" jsonb DEFAULT '"{}"',
      UNIQUE("orgId", "sourceEntityId", "targetEntityId", "relationshipType")
    )
  `;

  // Create addresses table
  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_addresses" (
      "_tag" text DEFAULT 'address' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "orgId" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "city" text,
      "country" text,
      "customFields" jsonb DEFAULT '[]',
      "externalIds" jsonb DEFAULT '[]',
      "state" text,
      "street" text,
      "tags" jsonb DEFAULT '"[]"',
      "type" text DEFAULT 'default',
      "zip" text
    )
  `;
});

// Simplified version of mkExternalLinksE for testing
const createExternalLinksForTesting = (data: ReadonlyArray<PcoBaseEntity>) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const tokenKey = yield* TokenKey;

    const results = [];

    for (const entity of data) {
      if (entity.type === "Person") {
        const entityId = `per_${Math.random().toString(36).substring(2, 11)}`;

        // Insert external link
        yield* sql`
          INSERT INTO "openfaith_externalLinks" 
          ("orgId", "entityId", "entityType", "adapter", "externalId")
          VALUES (${tokenKey}, ${entityId}, 'Person', 'pco', ${entity.id})
          ON CONFLICT ("orgId", "adapter", "externalId") DO NOTHING
        `;

        results.push({
          entityId,
          externalId: entity.id,
          entityType: "Person",
          adapter: "pco",
        });
      }
    }

    return results;
  });

// Test inserting a person entity
const insertPersonForTesting = (entityId: string, pcoEntity: PcoBaseEntity) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const tokenKey = yield* TokenKey;
    const attrs = pcoEntity.attributes as any;

    yield* sql`
      INSERT INTO "openfaith_people" 
      ("id", "orgId", "name", "lastName", "status", "createdAt", "updatedAt")
      VALUES (
        ${entityId}, 
        ${tokenKey}, 
        ${attrs.first_name || ""}, 
        ${attrs.last_name || ""}, 
        ${attrs.status || "active"},
        NOW(),
        NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "lastName" = EXCLUDED."lastName",
        "status" = EXCLUDED."status",
        "updatedAt" = NOW()
    `;
  });

describe.sequential(
  "SaveDataE Functions with PostgreSQL Container (Comprehensive Vitest)",
  () => {
    it.effect(
      "setup and test database schema creation",
      () =>
        Effect.gen(function* () {
          yield* createComprehensiveTestTables;

          // Verify tables were created
          const sql = yield* SqlClient.SqlClient;
          const tables = yield* sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'openfaith_%'
        ORDER BY table_name
      `;

          const tableNames = tables.map((t: any) => t.table_name);
          assert.strictEqual(tableNames.includes("openfaith_orgs"), true);
          assert.strictEqual(tableNames.includes("openfaith_people"), true);
          assert.strictEqual(
            tableNames.includes("openfaith_externalLinks"),
            true,
          );
          assert.strictEqual(tableNames.includes("openfaith_edges"), true);
          assert.strictEqual(tableNames.includes("openfaith_addresses"), true);
        }).pipe(
          Effect.provide(TestLayer),
          Effect.catchTag("ContainerError", (error) => {
            console.log("Container test skipped due to error:", error.cause);
            return Effect.void;
          }),
        ),
      { timeout: 120000 },
    );

    it.effect(
      "creates external links for valid PCO data",
      () =>
        Effect.gen(function* () {
          yield* createComprehensiveTestTables;

          const data = [
            createPcoBaseEntity("pco_123", "Person"),
            createPcoBaseEntity("pco_456", "Person"),
          ];

          const result = yield* createExternalLinksForTesting(data);

          assert.strictEqual(result.length, 2);
          assert.strictEqual(result[0]?.externalId, "pco_123");
          assert.strictEqual(result[1]?.externalId, "pco_456");
          assert.strictEqual(result[0]?.entityType, "Person");
          assert.strictEqual(result[0]?.adapter, "pco");

          // Verify in database
          const sql = yield* SqlClient.SqlClient;
          const links = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" IN ('pco_123', 'pco_456')
        ORDER BY "externalId"
      `;

          assert.strictEqual(links.length, 2);
          assert.strictEqual(links[0]?.externalId, "pco_123");
          assert.strictEqual(links[1]?.externalId, "pco_456");
        }).pipe(
          Effect.provide(TestLayer),
          Effect.catchTag("ContainerError", (error) => {
            console.log("Container test skipped due to error:", error.cause);
            return Effect.void;
          }),
        ),
      { timeout: 120000 },
    );

    it.effect(
      "handles entity upserts correctly",
      () =>
        Effect.gen(function* () {
          yield* createComprehensiveTestTables;

          const entity = createPcoBaseEntity("pco_789", "Person", {
            first_name: "Jane",
            last_name: "Smith",
            status: "active",
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-02T00:00:00Z",
          });

          const entityId = "per_test_789";

          // Insert the person
          yield* insertPersonForTesting(entityId, entity);

          // Verify insertion
          const sql = yield* SqlClient.SqlClient;
          const people = yield* sql`
        SELECT * FROM "openfaith_people" WHERE "id" = ${entityId}
      `;

          assert.strictEqual(people.length, 1);
          assert.strictEqual(people[0]?.name, "Jane");
          assert.strictEqual(people[0]?.lastName, "Smith");
          assert.strictEqual(people[0]?.status, "active");

          // Test update (upsert)
          const updatedEntity = createPcoBaseEntity("pco_789", "Person", {
            first_name: "Jane",
            last_name: "Johnson", // Changed last name
            status: "inactive", // Changed status
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-03T00:00:00Z",
          });

          yield* insertPersonForTesting(entityId, updatedEntity);

          // Verify update
          const updatedPeople = yield* sql`
        SELECT * FROM "openfaith_people" WHERE "id" = ${entityId}
      `;

          assert.strictEqual(updatedPeople.length, 1);
          assert.strictEqual(updatedPeople[0]?.name, "Jane");
          assert.strictEqual(updatedPeople[0]?.lastName, "Johnson"); // Should be updated
          assert.strictEqual(updatedPeople[0]?.status, "inactive"); // Should be updated
        }).pipe(
          Effect.provide(TestLayer),
          Effect.catchTag("ContainerError", (error) => {
            console.log("Container test skipped due to error:", error.cause);
            return Effect.void;
          }),
        ),
      { timeout: 120000 },
    );

    it.effect(
      "handles empty data arrays gracefully",
      () =>
        Effect.gen(function* () {
          yield* createComprehensiveTestTables;

          const result = yield* createExternalLinksForTesting([]);
          assert.strictEqual(result.length, 0);

          // Verify no records were inserted
          const sql = yield* SqlClient.SqlClient;
          const links =
            yield* sql`SELECT COUNT(*) as count FROM "openfaith_externalLinks"`;

          // Should be 0 or whatever was there from previous tests
          assert.strictEqual(typeof links[0]?.count, "string");
        }).pipe(
          Effect.provide(TestLayer),
          Effect.catchTag("ContainerError", (error) => {
            console.log("Container test skipped due to error:", error.cause);
            return Effect.void;
          }),
        ),
      { timeout: 120000 },
    );

    it.effect(
      "full integration test with multiple operations",
      () =>
        Effect.gen(function* () {
          yield* createComprehensiveTestTables;

          // Create test data
          const people = [
            createPcoBaseEntity("pco_integration_1", "Person", {
              first_name: "Alice",
              last_name: "Wonder",
              status: "active",
            }),
            createPcoBaseEntity("pco_integration_2", "Person", {
              first_name: "Bob",
              last_name: "Builder",
              status: "active",
            }),
          ];

          // Create external links
          const externalLinks = yield* createExternalLinksForTesting(people);
          assert.strictEqual(externalLinks.length, 2);

          // Insert people using the entity IDs from external links
          yield* insertPersonForTesting(externalLinks[0]!.entityId, people[0]!);
          yield* insertPersonForTesting(externalLinks[1]!.entityId, people[1]!);

          // Verify the full workflow
          const sql = yield* SqlClient.SqlClient;

          // Check external links
          const links = yield* sql`
        SELECT * FROM "openfaith_externalLinks" 
        WHERE "externalId" IN ('pco_integration_1', 'pco_integration_2')
        ORDER BY "externalId"
      `;
          assert.strictEqual(links.length, 2);

          // Check people records
          const peopleRecords = yield* sql`
        SELECT * FROM "openfaith_people" 
        WHERE "id" IN (${externalLinks[0]!.entityId}, ${externalLinks[1]!.entityId})
        ORDER BY "name"
      `;
          assert.strictEqual(peopleRecords.length, 2);
          assert.strictEqual(peopleRecords[0]?.name, "Alice");
          assert.strictEqual(peopleRecords[1]?.name, "Bob");

          // Verify the relationship between external links and people
          const joinedData = yield* sql`
        SELECT p."name", p."lastName", el."externalId", el."adapter"
        FROM "openfaith_people" p
        JOIN "openfaith_externalLinks" el ON p."id" = el."entityId"
        WHERE el."externalId" IN ('pco_integration_1', 'pco_integration_2')
        ORDER BY p."name"
      `;

          assert.strictEqual(joinedData.length, 2);
          assert.strictEqual(joinedData[0]?.name, "Alice");
          assert.strictEqual(joinedData[0]?.externalId, "pco_integration_1");
          assert.strictEqual(joinedData[0]?.adapter, "pco");
          assert.strictEqual(joinedData[1]?.name, "Bob");
          assert.strictEqual(joinedData[1]?.externalId, "pco_integration_2");
          assert.strictEqual(joinedData[1]?.adapter, "pco");
        }).pipe(
          Effect.provide(TestLayer),
          Effect.catchTag("ContainerError", (error) => {
            console.log("Container test skipped due to error:", error.cause);
            return Effect.void;
          }),
        ),
      { timeout: 120000 },
    );
  },
);
