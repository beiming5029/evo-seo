CREATE TABLE "blog_posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text,
	"category" text,
	"tags" jsonb,
	"status" text DEFAULT 'draft',
	"featured_image" text,
	"all_images" jsonb,
	"tenant_id" text
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_email" text,
	"valid_until" date,
	"cooperation_start_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content_url" text NOT NULL,
	"publish_date" date NOT NULL,
	"status" varchar(16) DEFAULT 'ready' NOT NULL,
	"platform" varchar(32) DEFAULT 'wordpress' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "post" CASCADE;--> statement-breakpoint
ALTER TABLE "brand_config" DROP CONSTRAINT "brand_config_tenant_id_tenant_id_fk";
--> statement-breakpoint
ALTER TABLE "post_publish_log" DROP CONSTRAINT "post_publish_log_post_id_post_id_fk";
--> statement-breakpoint
ALTER TABLE "post_upload" DROP CONSTRAINT "post_upload_post_id_post_id_fk";
--> statement-breakpoint
DROP INDEX "brand_config_tenant_unique_idx";--> statement-breakpoint
ALTER TABLE "brand_config" ADD COLUMN "company_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "company_id" text;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "site_url" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "company_id" text;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_schedule" ADD CONSTRAINT "content_schedule_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_schedule" ADD CONSTRAINT "content_schedule_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_unique_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "content_schedule_tenant_publish_date_idx" ON "content_schedule" USING btree ("tenant_id","publish_date");--> statement-breakpoint
ALTER TABLE "brand_config" ADD CONSTRAINT "brand_config_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_publish_log" ADD CONSTRAINT "post_publish_log_post_id_content_schedule_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."content_schedule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_upload" ADD CONSTRAINT "post_upload_post_id_content_schedule_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."content_schedule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brand_config_company_unique_idx" ON "brand_config" USING btree ("company_id");--> statement-breakpoint
ALTER TABLE "brand_config" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN "plan";