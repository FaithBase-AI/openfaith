CREATE TABLE "openfaith_campuses" (
	"_tag" char(6) DEFAULT 'campus' NOT NULL,
	"avatar" text,
	"city" text,
	"country" text,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"description" text,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"latitude" double precision,
	"longitude" double precision,
	"name" text NOT NULL,
	"orgId" text NOT NULL,
	"state" text,
	"status" text DEFAULT 'active' NOT NULL,
	"street" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"type" text DEFAULT 'default' NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"url" text,
	"zip" text
);
--> statement-breakpoint
CREATE TABLE "openfaith_folders" (
	"_tag" char(6) DEFAULT 'folder' NOT NULL,
	"color" text,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"description" text,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"folderType" text,
	"icon" text,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"orderingKey" text,
	"orgId" text NOT NULL,
	"parentFolderId" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text
);
--> statement-breakpoint
CREATE INDEX "campusOrgIdIdx" ON "openfaith_campuses" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "folderTypeIdx" ON "openfaith_folders" USING btree ("folderType");--> statement-breakpoint
CREATE INDEX "folderNameIdx" ON "openfaith_folders" USING btree ("name");--> statement-breakpoint
CREATE INDEX "folderOrgIdIdx" ON "openfaith_folders" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "folderParentFolderIdIdx" ON "openfaith_folders" USING btree ("parentFolderId");