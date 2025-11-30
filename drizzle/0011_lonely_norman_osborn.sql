ALTER TABLE "post_publish_log" DROP CONSTRAINT "post_publish_log_post_id_content_schedule_id_fk";
--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "status" SET DEFAULT 'ready';--> statement-breakpoint
ALTER TABLE "content_schedule" ADD COLUMN "article_id" bigint;--> statement-breakpoint
ALTER TABLE "content_schedule" ADD CONSTRAINT "content_schedule_article_id_blog_posts_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;