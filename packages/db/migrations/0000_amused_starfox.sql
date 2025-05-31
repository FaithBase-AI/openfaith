CREATE TABLE "openfaith_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"inviterId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_orgSettings" (
	"orgId" varchar(128) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_orgUsers" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_orgs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"createdAt" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "openfaith_orgs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "openfaith_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"isAnonymous" boolean,
	"stripeCustomerId" text,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp,
	CONSTRAINT "openfaith_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "openfaith_invitations" ADD CONSTRAINT "openfaith_invitations_orgId_openfaith_orgs_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."openfaith_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openfaith_invitations" ADD CONSTRAINT "openfaith_invitations_inviterId_openfaith_users_id_fk" FOREIGN KEY ("inviterId") REFERENCES "public"."openfaith_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openfaith_orgUsers" ADD CONSTRAINT "openfaith_orgUsers_orgId_openfaith_orgs_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."openfaith_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openfaith_orgUsers" ADD CONSTRAINT "openfaith_orgUsers_userId_openfaith_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."openfaith_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitationUserIdx" ON "openfaith_invitations" USING btree ("inviterId");--> statement-breakpoint
CREATE INDEX "invitationOrgIdx" ON "openfaith_invitations" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "orgUserUserIdx" ON "openfaith_orgUsers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "orgUserOrgIdx" ON "openfaith_orgUsers" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "orgSlugIdx" ON "openfaith_orgs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "userEmailIdx" ON "openfaith_users" USING btree ("email");