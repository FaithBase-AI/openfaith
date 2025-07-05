CREATE TABLE "openfaith_phoneNumbers" (
	"_tag" char(11) DEFAULT 'phoneNumber' NOT NULL,
	"countryCode" text,
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
	"number" text,
	"orgId" text NOT NULL,
	"primary" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"type" text DEFAULT 'default' NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text
);
--> statement-breakpoint
CREATE INDEX "phoneNumberOrgIdIdx" ON "openfaith_phoneNumbers" USING btree ("orgId");