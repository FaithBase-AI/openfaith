CREATE TABLE "openfaith_adapterDetails" (
	"_tag" char(14) DEFAULT 'adapterDetails' NOT NULL,
	"adapter" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"enabled" boolean NOT NULL,
	"orgId" varchar(128) NOT NULL,
	"syncStatus" jsonb NOT NULL,
	CONSTRAINT "adapterDetailsId" PRIMARY KEY("orgId","adapter")
);
