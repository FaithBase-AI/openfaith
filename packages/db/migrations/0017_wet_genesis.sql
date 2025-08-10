CREATE TABLE "openfaith_fieldOptions" (
	"_tag" char(11) DEFAULT 'fieldOption' NOT NULL,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"active" boolean DEFAULT true NOT NULL,
	"fieldId" text NOT NULL,
	"label" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"pathwayConfig" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_fields" (
	"_tag" char(5) DEFAULT 'field' NOT NULL,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"description" text,
	"entityTag" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"source" text,
	"type" text DEFAULT 'singleSelect' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_journeys" (
	"_tag" char(7) DEFAULT 'journey' NOT NULL,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"assimilationComplete" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"currentStage" text,
	"lastActivityAt" timestamp,
	"pathwayId" text NOT NULL,
	"state" text DEFAULT 'active' NOT NULL,
	"subjectId" text NOT NULL,
	"subjectTag" text NOT NULL,
	"type" text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_pathways" (
	"_tag" char(7) DEFAULT 'pathway' NOT NULL,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"active" boolean DEFAULT true NOT NULL,
	"completionRule" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text,
	"enrollmentConfig" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"linkedFieldId" text NOT NULL,
	"name" text NOT NULL,
	"stepsConfig" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"type" text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_qualifications" (
	"_tag" char(13) DEFAULT 'qualification' NOT NULL,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"description" text,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'default' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_sacraments" (
	"_tag" char(9) DEFAULT 'sacrament' NOT NULL,
	"externalIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"createdBy" text,
	"customFields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"deletedAt" timestamp,
	"deletedBy" text,
	"inactivatedAt" timestamp,
	"inactivatedBy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp,
	"updatedBy" text,
	"administeredBy" text,
	"occurredAt" text,
	"receivedBy" text,
	"type" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "openfaith_folders" ADD COLUMN "inactivatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "openfaith_folders" ADD COLUMN "inactivatedBy" text;--> statement-breakpoint
ALTER TABLE "openfaith_folders" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE INDEX "fieldOptionFieldIdIdx" ON "openfaith_fieldOptions" USING btree ("fieldId");--> statement-breakpoint
CREATE INDEX "fieldOptionOrgIdIdx" ON "openfaith_fieldOptions" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "fieldOptionValueIdx" ON "openfaith_fieldOptions" USING btree ("orgId","fieldId","value");--> statement-breakpoint
CREATE INDEX "fieldEntityIdx" ON "openfaith_fields" USING btree ("entityTag");--> statement-breakpoint
CREATE INDEX "fieldKeyIdx" ON "openfaith_fields" USING btree ("orgId","key");--> statement-breakpoint
CREATE INDEX "fieldOrgIdIdx" ON "openfaith_fields" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "journeyOrgIdIdx" ON "openfaith_journeys" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "journeyPathwayIdIdx" ON "openfaith_journeys" USING btree ("pathwayId");--> statement-breakpoint
CREATE INDEX "journeyStateIdx" ON "openfaith_journeys" USING btree ("state");--> statement-breakpoint
CREATE INDEX "journeySubjectIdx" ON "openfaith_journeys" USING btree ("subjectTag","subjectId");--> statement-breakpoint
CREATE INDEX "pathwayNameIdx" ON "openfaith_pathways" USING btree ("name");--> statement-breakpoint
CREATE INDEX "pathwayOrgIdIdx" ON "openfaith_pathways" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "qualificationKeyIdx" ON "openfaith_qualifications" USING btree ("orgId","key");--> statement-breakpoint
CREATE INDEX "qualificationNameIdx" ON "openfaith_qualifications" USING btree ("name");--> statement-breakpoint
CREATE INDEX "qualificationOrgIdIdx" ON "openfaith_qualifications" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "sacramentsAdministeredByIdx" ON "openfaith_sacraments" USING btree ("administeredBy");--> statement-breakpoint
CREATE INDEX "sacramentsOrgIdIdx" ON "openfaith_sacraments" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "sacramentsReceivedByIdx" ON "openfaith_sacraments" USING btree ("receivedBy");