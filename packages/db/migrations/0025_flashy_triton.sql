UPDATE "openfaith_campuses" SET "city" = '' WHERE "city" IS NULL;--> statement-breakpoint
UPDATE "openfaith_campuses" SET "state" = '' WHERE "state" IS NULL;--> statement-breakpoint
UPDATE "openfaith_campuses" SET "street" = '' WHERE "street" IS NULL;--> statement-breakpoint
UPDATE "openfaith_campuses" SET "zip" = '' WHERE "zip" IS NULL;--> statement-breakpoint
ALTER TABLE "openfaith_campuses" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_campuses" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_campuses" ALTER COLUMN "street" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_campuses" ALTER COLUMN "zip" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_addresses" DROP COLUMN "countryName";