import { SqlClient } from '@effect/sql'
import { Effect } from 'effect'

// Helper to create all necessary tables for testing based on real schema
export const createTestTables = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  // Create tables in dependency order based on real database structure
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
  `

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
      "firstName" text,
      "gender" text,
      "inactivatedAt" timestamp,
      "inactivatedBy" text,
      "membership" text,
      "middleName" text,
      "tags" jsonb DEFAULT '"[]"'
    )
  `

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
      "syncing" boolean DEFAULT false NOT NULL,
      UNIQUE("orgId", "adapter", "externalId")
    )
  `

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
  `

  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_folders" (
      "_tag" text DEFAULT 'folder' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "orgId" text NOT NULL,
      "name" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "customFields" jsonb DEFAULT '[]',
      "externalIds" jsonb DEFAULT '[]',
      "tags" jsonb DEFAULT '"[]"',
      "type" text DEFAULT 'default'
    )
  `

  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_addresses" (
      "_tag" text DEFAULT 'address' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "orgId" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now(),
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "inactivatedAt" timestamp,
      "inactivatedBy" text,
      "city" text,
      "countryCode" text,
      "countryName" text,
      "location" text,
      "primary" boolean DEFAULT false NOT NULL,
      "state" text,
      "status" text DEFAULT 'active' NOT NULL,
      "streetLine1" text,
      "streetLine2" text,
      "customFields" jsonb DEFAULT '[]',
      "externalIds" jsonb DEFAULT '[]',
      "tags" jsonb DEFAULT '[]',
      "type" text DEFAULT 'default' NOT NULL,
      "zip" text
    )
  `

  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_phoneNumbers" (
      "_tag" text DEFAULT 'phoneNumber' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "orgId" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "inactivatedAt" timestamp,
      "inactivatedBy" text,
      "customFields" jsonb DEFAULT '[]',
      "externalIds" jsonb DEFAULT '[]',
      "countryCode" text,
      "location" text,
      "number" text,
      "primary" boolean DEFAULT false NOT NULL,
      "status" text DEFAULT 'active' NOT NULL,
      "tags" jsonb DEFAULT '[]',
      "type" text DEFAULT 'default'
    )
  `

  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_emails" (
      "_tag" text DEFAULT 'email' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "orgId" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "inactivatedAt" timestamp,
      "inactivatedBy" text,
      "address" text,
      "blocked" boolean DEFAULT false NOT NULL,
      "customFields" jsonb DEFAULT '[]',
      "externalIds" jsonb DEFAULT '[]',
      "location" text,
      "primary" boolean DEFAULT false NOT NULL,
      "status" text DEFAULT 'active' NOT NULL,
      "tags" jsonb DEFAULT '[]',
      "type" text DEFAULT 'default'
    )
  `

  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_campuses" (
      "_tag" text DEFAULT 'campus' NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "orgId" text NOT NULL,
      "name" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      "deletedAt" timestamp,
      "deletedBy" text,
      "createdBy" text,
      "updatedBy" text,
      "customFields" jsonb DEFAULT '[]',
      "externalIds" jsonb DEFAULT '[]',
      "tags" jsonb DEFAULT '"[]"',
      "type" text DEFAULT 'default'
    )
  `

  yield* sql`
    CREATE TABLE IF NOT EXISTS "openfaith_entityRelationships" (
      "_tag" text DEFAULT 'entityRelationships' NOT NULL,
      "orgId" text NOT NULL,
      "entityTypeTag" text NOT NULL,
      "relatedEntityTypeTags" jsonb DEFAULT '[]' NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      UNIQUE("orgId", "entityTypeTag")
    )
  `
})
