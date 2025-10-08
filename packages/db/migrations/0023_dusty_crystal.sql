CREATE TABLE "openfaith_emails" (
	"_tag" char(5) DEFAULT 'email' NOT NULL,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp with time zone,
	"deletedBy" text,
	"inactivatedAt" timestamp with time zone,
	"inactivatedBy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp with time zone,
	"updatedBy" text,
	"address" text NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"location" text,
	"primary" boolean DEFAULT false NOT NULL,
	"type" text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "emailOrgIdIdx" ON "openfaith_emails" USING btree ("orgId");