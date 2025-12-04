ALTER TABLE "brand_config" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "kpi_snapshot" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "post_upload" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "brand_config" CASCADE;--> statement-breakpoint
DROP TABLE "kpi_snapshot" CASCADE;--> statement-breakpoint
DROP TABLE "post_upload" CASCADE;--> statement-breakpoint
DROP INDEX "inquiry_stat_tenant_period_idx";--> statement-breakpoint
DROP INDEX "traffic_stat_tenant_period_idx";--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "brand_voice" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "product_desc" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "target_audience" text;--> statement-breakpoint
ALTER TABLE "content_schedule" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "content_schedule" ADD COLUMN "file_url" text;--> statement-breakpoint
CREATE UNIQUE INDEX "inquiry_stat_tenant_period_unique" ON "inquiry_stat" USING btree ("tenant_id","period");--> statement-breakpoint
CREATE INDEX "keyword_ranking_tenant_captured_rank_idx" ON "keyword_ranking" USING btree ("tenant_id","captured_at","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "traffic_stat_tenant_period_unique" ON "traffic_stat" USING btree ("tenant_id","period");--> statement-breakpoint
ALTER TABLE "content_schedule" DROP COLUMN "content_url";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN "contact_email";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN "valid_until";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN "cooperation_start_date";