CREATE TABLE "openfaith_adapterWebhooks" (
	"_tag" char(14) DEFAULT 'adapterWebhook' NOT NULL,
	"adapter" text NOT NULL,
	"authenticitySecret" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"eventTypes" jsonb NOT NULL,
	"externalWebhookId" text,
	"id" text PRIMARY KEY NOT NULL,
	"lastProcessedAt" timestamp with time zone,
	"lastReceivedAt" timestamp with time zone,
	"orgId" text NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"verificationMethod" text NOT NULL,
	"webhookUrl" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "openfaith_adapterDetails" ALTER COLUMN "orgId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "openfaith_adapterTokens" ALTER COLUMN "orgId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "openfaith_adapterTokens" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "openfaith_orgSettings" ALTER COLUMN "orgId" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "webhook_org_adapter_idx" ON "openfaith_adapterWebhooks" USING btree ("orgId","adapter");