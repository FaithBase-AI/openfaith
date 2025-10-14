ALTER TABLE "openfaith_campuses" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_campuses" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_campuses" ALTER COLUMN "street" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_campuses" ALTER COLUMN "zip" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_addresses" DROP COLUMN "countryName";