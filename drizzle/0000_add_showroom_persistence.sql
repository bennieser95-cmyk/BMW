CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"model_slug" text,
	"dealer_id" text,
	"user_id" text,
	"contact" jsonb NOT NULL,
	"requested_date" text,
	"consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_leads_type" CHECK ("leads"."type" in ('contact', 'test-drive'))
);
--> statement-breakpoint
CREATE TABLE "saved_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"model_slug" text NOT NULL,
	"configuration_code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_deletions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"digest" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_leads_user_id" ON "leads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_leads_created_at" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_saved_configurations_user_id" ON "saved_configurations" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_account_deletions_user_id" ON "account_deletions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_rate_limits_key" ON "rate_limits" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_rate_limits_expires_at" ON "rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_webhook_receipts_digest" ON "webhook_receipts" USING btree ("digest");--> statement-breakpoint
CREATE INDEX "idx_webhook_receipts_expires_at" ON "webhook_receipts" USING btree ("expires_at");