ALTER TABLE "openfaith_invitations" ADD COLUMN "_tag" char(10) DEFAULT 'invitation' NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_orgSettings" ADD COLUMN "_tag" char(11) DEFAULT 'orgSettings' NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_orgUsers" ADD COLUMN "_tag" char(7) DEFAULT 'orgUser' NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_orgs" ADD COLUMN "_tag" char(3) DEFAULT 'org' NOT NULL;--> statement-breakpoint
ALTER TABLE "openfaith_users" ADD COLUMN "_tag" char(4) DEFAULT 'user' NOT NULL;