ALTER TABLE "openfaith_invitations" DROP CONSTRAINT "openfaith_invitations_orgId_openfaith_orgs_id_fk";
--> statement-breakpoint
ALTER TABLE "openfaith_invitations" DROP CONSTRAINT "openfaith_invitations_inviterId_openfaith_users_id_fk";
--> statement-breakpoint
ALTER TABLE "openfaith_orgUsers" DROP CONSTRAINT "openfaith_orgUsers_orgId_openfaith_orgs_id_fk";
--> statement-breakpoint
ALTER TABLE "openfaith_orgUsers" DROP CONSTRAINT "openfaith_orgUsers_userId_openfaith_users_id_fk";
