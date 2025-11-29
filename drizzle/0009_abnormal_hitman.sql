CREATE TABLE "brand_config" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"brand_voice" text,
	"product_desc" text,
	"target_audience" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_import_job" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"type" varchar(32) NOT NULL,
	"source_file_url" text NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"summary" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inquiry_stat" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"period" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword_ranking" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"keyword" text NOT NULL,
	"target_url" text,
	"rank" integer,
	"rank_delta" integer,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"type" varchar(32) NOT NULL,
	"value_numeric" numeric(20, 4) DEFAULT '0' NOT NULL,
	"delta_numeric" numeric(20, 4) DEFAULT '0' NOT NULL,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content_url" text NOT NULL,
	"publish_date" date NOT NULL,
	"status" varchar(16) DEFAULT 'scheduled' NOT NULL,
	"platform" varchar(32) DEFAULT 'wordpress' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_publish_log" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"post_id" text NOT NULL,
	"published_at" timestamp,
	"target_url" text,
	"status" varchar(24) NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_upload" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"post_id" text NOT NULL,
	"storage_url" text NOT NULL,
	"preview_url" text,
	"size_bytes" integer,
	"uploaded_by" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"type" varchar(32) NOT NULL,
	"title" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"file_url" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_email" text,
	"plan" text,
	"valid_until" date,
	"cooperation_start_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(16) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traffic_stat" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"period" date NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"ctr" numeric(8, 4) DEFAULT '0' NOT NULL,
	"position" numeric(8, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wp_integration" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"site_url" text NOT NULL,
	"wp_username" text NOT NULL,
	"wp_app_password" text NOT NULL,
	"status" varchar(32) DEFAULT 'disconnected' NOT NULL,
	"timezone" varchar(64) DEFAULT 'Asia/Shanghai' NOT NULL,
	"publish_time_local" varchar(8) DEFAULT '12:00' NOT NULL,
	"auto_publish" boolean DEFAULT false NOT NULL,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "chat_message" CASCADE;--> statement-breakpoint
DROP TABLE "chat_session" CASCADE;--> statement-breakpoint
DROP TABLE "credit_ledger" CASCADE;--> statement-breakpoint
DROP TABLE "generation_history" CASCADE;--> statement-breakpoint
DROP TABLE "payment" CASCADE;--> statement-breakpoint
DROP TABLE "subscription" CASCADE;--> statement-breakpoint
DROP TABLE "subscription_credit_schedule" CASCADE;--> statement-breakpoint
ALTER TABLE "brand_config" ADD CONSTRAINT "brand_config_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_import_job" ADD CONSTRAINT "data_import_job_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_import_job" ADD CONSTRAINT "data_import_job_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_stat" ADD CONSTRAINT "inquiry_stat_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_ranking" ADD CONSTRAINT "keyword_ranking_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_snapshot" ADD CONSTRAINT "kpi_snapshot_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_publish_log" ADD CONSTRAINT "post_publish_log_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_publish_log" ADD CONSTRAINT "post_publish_log_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_upload" ADD CONSTRAINT "post_upload_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_upload" ADD CONSTRAINT "post_upload_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_upload" ADD CONSTRAINT "post_upload_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_membership" ADD CONSTRAINT "tenant_membership_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_membership" ADD CONSTRAINT "tenant_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_stat" ADD CONSTRAINT "traffic_stat_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wp_integration" ADD CONSTRAINT "wp_integration_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brand_config_tenant_unique_idx" ON "brand_config" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "data_import_job_tenant_created_idx" ON "data_import_job" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "inquiry_stat_tenant_period_idx" ON "inquiry_stat" USING btree ("tenant_id","period");--> statement-breakpoint
CREATE INDEX "keyword_ranking_tenant_captured_idx" ON "keyword_ranking" USING btree ("tenant_id","captured_at");--> statement-breakpoint
CREATE INDEX "kpi_snapshot_tenant_type_period_idx" ON "kpi_snapshot" USING btree ("tenant_id","type","period_start");--> statement-breakpoint
CREATE INDEX "post_tenant_publish_date_idx" ON "post" USING btree ("tenant_id","publish_date");--> statement-breakpoint
CREATE INDEX "post_publish_log_tenant_post_idx" ON "post_publish_log" USING btree ("tenant_id","post_id");--> statement-breakpoint
CREATE INDEX "post_upload_post_idx" ON "post_upload" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "report_tenant_created_idx" ON "report" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_membership_tenant_user_unique" ON "tenant_membership" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "traffic_stat_tenant_period_idx" ON "traffic_stat" USING btree ("tenant_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "wp_integration_tenant_unique_idx" ON "wp_integration" USING btree ("tenant_id");