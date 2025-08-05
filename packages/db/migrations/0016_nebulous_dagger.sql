CREATE TABLE "openfaith_entityRelationships" (
	"_tag" char(19) DEFAULT 'entityRelationships' NOT NULL,
	"orgId" text NOT NULL,
	"sourceEntityType" text NOT NULL,
	"targetEntityTypes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entityRelationshipsPk" PRIMARY KEY("orgId","sourceEntityType")
);
--> statement-breakpoint
CREATE INDEX "entityRelationshipsOrgIdx" ON "openfaith_entityRelationships" USING btree ("orgId");