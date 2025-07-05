CREATE TABLE "openfaith_addresses" (
	"_tag" char(7) DEFAULT 'address' NOT NULL,
	"city" text,
	"countryCode" text,
	"countryName" text,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"location" text,
	"orgId" text NOT NULL,
	"primary" boolean DEFAULT false NOT NULL,
	"state" text,
	"status" text DEFAULT 'active' NOT NULL,
	"streetLine1" text,
	"streetLine2" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"type" text DEFAULT 'default' NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"zip" text
);
--> statement-breakpoint
CREATE TABLE "openfaith_edges" (
	"_tag" char(4) DEFAULT 'edge' NOT NULL,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"deletedAt" timestamp,
	"deletedBy" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"orgId" text NOT NULL,
	"relationshipType" text NOT NULL,
	"sourceEntityId" text NOT NULL,
	"sourceEntityTypeTag" text NOT NULL,
	"targetEntityId" text NOT NULL,
	"targetEntityTypeTag" text NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	CONSTRAINT "edgePk" PRIMARY KEY("orgId","sourceEntityId","targetEntityId","relationshipType")
);
--> statement-breakpoint
ALTER TABLE "openfaith_external_links" DROP CONSTRAINT "openfaith_external_links_pkey";--> statement-breakpoint
ALTER TABLE "openfaith_people" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "openfaith_external_links" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "openfaith_external_links" ADD CONSTRAINT "externalLinkPk" PRIMARY KEY("orgId","adapter","externalId");--> statement-breakpoint
ALTER TABLE "openfaith_external_links" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "openfaith_external_links" ADD COLUMN "deletedBy" text;--> statement-breakpoint
CREATE INDEX "addressOrgIdIdx" ON "openfaith_addresses" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "edgeRelationshipTypeIdx" ON "openfaith_edges" USING btree ("relationshipType");--> statement-breakpoint
CREATE INDEX "edgeSourceEntityIdx" ON "openfaith_edges" USING btree ("sourceEntityId");--> statement-breakpoint
CREATE INDEX "edgeTargetEntityIdx" ON "openfaith_edges" USING btree ("targetEntityId");--> statement-breakpoint