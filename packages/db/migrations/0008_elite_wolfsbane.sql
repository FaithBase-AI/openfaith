CREATE TABLE "openfaith_external_links" (
	"_tag" char(12) DEFAULT 'externalLink' NOT NULL,
	"adapter" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"entityId" text NOT NULL,
	"entityType" text NOT NULL,
	"externalId" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"lastProcessedAt" timestamp NOT NULL,
	"orgId" text NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "uniqueExternalLink" UNIQUE("orgId","adapter","externalId")
);
--> statement-breakpoint
CREATE TABLE "openfaith_people" (
	"_tag" char(6) DEFAULT 'person' NOT NULL,
	"anniversary" text,
	"avatar" text,
	"birthdate" text,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"gender" text,
	"id" text PRIMARY KEY NOT NULL,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"lastName" text,
	"membership" text,
	"middleName" text,
	"name" text,
	"orgId" text NOT NULL,
	"status" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"type" text DEFAULT 'default' NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text
);
--> statement-breakpoint
CREATE INDEX "adapterExternalIdIdx" ON "openfaith_external_links" USING btree ("adapter","externalId");--> statement-breakpoint
CREATE INDEX "entityIdIdx" ON "openfaith_external_links" USING btree ("entityId");--> statement-breakpoint
CREATE INDEX "peopleOrgIdIdx" ON "openfaith_people" USING btree ("orgId");