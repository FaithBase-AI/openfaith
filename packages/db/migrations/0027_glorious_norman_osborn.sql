CREATE TABLE "openfaith_circles" (
	"_tag" char(6) DEFAULT 'circle' NOT NULL,
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
	"avatar" text,
	"description" text,
	"name" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "circleOrgIdIdx" ON "openfaith_circles" USING btree ("orgId");