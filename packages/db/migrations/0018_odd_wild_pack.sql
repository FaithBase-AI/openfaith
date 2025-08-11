CREATE TABLE "openfaith_cluster_locks" (
	"acquired_at" timestamp NOT NULL,
	"address" varchar(255) NOT NULL,
	"shard_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_cluster_messages" (
	"deliver_at" varchar(255),
	"entity_id" varchar(255) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"headers" text,
	"id" text PRIMARY KEY NOT NULL,
	"kind" integer NOT NULL,
	"last_read" timestamp,
	"last_reply_id" varchar(255),
	"message_id" varchar(255),
	"payload" text,
	"processed" boolean DEFAULT false NOT NULL,
	"reply_id" varchar(255),
	"request_id" varchar(255) NOT NULL,
	"rowid" integer GENERATED ALWAYS AS IDENTITY (sequence name "openfaith_cluster_messages_rowid_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sampled" boolean,
	"shard_id" varchar(50) NOT NULL,
	"span_id" varchar(16),
	"tag" varchar(50),
	"trace_id" varchar(32),
	CONSTRAINT "cluster_messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "openfaith_cluster_replies" (
	"acked" boolean DEFAULT false NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"kind" integer,
	"payload" text NOT NULL,
	"request_id" varchar(255) NOT NULL,
	"rowid" integer GENERATED ALWAYS AS IDENTITY (sequence name "openfaith_cluster_replies_rowid_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sequence" integer,
	CONSTRAINT "cluster_replies_request_kind_unique" UNIQUE("request_id","kind"),
	CONSTRAINT "cluster_replies_request_sequence_unique" UNIQUE("request_id","sequence")
);
--> statement-breakpoint
CREATE TABLE "openfaith_cluster_runners" (
	"address" varchar(255) PRIMARY KEY NOT NULL,
	"runner" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "openfaith_cluster_shards" (
	"address" varchar(255),
	"shard_id" varchar(50) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "openfaith_cluster_messages" ADD CONSTRAINT "cluster_messages_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."openfaith_cluster_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "openfaith_cluster_replies" ADD CONSTRAINT "cluster_replies_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."openfaith_cluster_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cluster_messages_shard_idx" ON "openfaith_cluster_messages" USING btree ("shard_id","processed","last_read","deliver_at");--> statement-breakpoint
CREATE INDEX "cluster_messages_request_id_idx" ON "openfaith_cluster_messages" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "cluster_replies_request_lookup_idx" ON "openfaith_cluster_replies" USING btree ("request_id","kind","acked");