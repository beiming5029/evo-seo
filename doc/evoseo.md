# evoSEO 实施说明（Supabase + Better Auth + Drizzle）

面向当前仓库新增的多租户与 evoSEO 功能的技术说明。默认使用 Supabase Postgres 托管数据库，保持 Better Auth 登录流不变，存储使用 Cloudflare R2（S3 兼容）。

## 数据库表结构（Drizzle）
- tenant：id (uuid PK), name, created_at
- tenant_membership：id (uuid PK), tenant_id FK -> tenant, user_id FK -> user, role ('member'|'admin'), 唯一索引 (tenant_id, user_id)
- wp_integration：id (uuid PK), tenant_id FK, site_url, wp_username, wp_app_password, status ('connected'|'error'|'disconnected'), timezone (默认 Asia/Shanghai), publish_time_local (默认 12:00), last_sync_at
- post：id (uuid PK), tenant_id FK, title, summary, content_url, publish_date (date), status ('scheduled'|'published'|'paused'), platform ('wordpress'), created_by, created_at, updated_at，索引 (tenant_id, publish_date)
- post_upload：id (uuid PK), tenant_id FK, post_id FK, storage_url, preview_url, size_bytes, uploaded_by, uploaded_at，索引 (post_id)
- post_publish_log：id (uuid PK), tenant_id FK, post_id FK, published_at, target_url, status ('success'|'failed'|'skipped_paused'), message
- kpi_snapshot：id (uuid PK), tenant_id FK, period_start (date), period_end (date), type ('inquiries'|'traffic'|'keywords'|'tasks'), value_numeric, delta_numeric, meta jsonb，索引 (tenant_id, type, period_start)
- inquiry_stat：id (uuid PK), tenant_id FK, period (date 月初), count，索引 (tenant_id, period)
- traffic_stat：id (uuid PK), tenant_id FK, period (date 可日或月), clicks, impressions, ctr, position，索引 (tenant_id, period)
- keyword_ranking：id (uuid PK), tenant_id FK, keyword, target_url, rank, rank_delta, captured_at，索引 (tenant_id, captured_at)
- report：id (uuid PK), tenant_id FK, type ('diagnosis'|'review'), title, period_start, period_end, file_url, created_by, created_at，索引 (tenant_id, created_at)
- data_import_job：id (uuid PK), tenant_id FK, type ('inquiries'|'traffic'|'keywords'|'kpi'), source_file_url, status ('pending'|'processing'|'failed'|'completed'), summary, created_by, created_at, completed_at，索引 (tenant_id, created_at)

保留原 Better Auth 表：user、session、account、verification、payment、subscription 等。

## API 概览（/api/evo/*）
- GET/POST `/api/evo/posts`：按月/起止日期拉取排期；创建排期。
- GET `/api/evo/posts/:id`：详情+上传列表；PATCH 更新状态/内容。
- POST `/api/evo/posts/upload`：上传内容文件（≤10MB，R2），form-data: postId, file。
- GET `/api/evo/kpi/overview`：汇总 KPI、询盘、流量、关键词 Top10。
- GET/POST `/api/evo/reports`：报告列表；管理员上传 PDF（≤10MB）。
- GET/POST `/api/evo/wp`：WordPress 应用密码配置（管理员）。
- GET/POST `/api/evo/import`：导入任务列表；管理员上传 CSV/JSON（≤10MB）。
- CRON `/api/cron/publish`：每日发布 stub（仅标记 published 并记录 log，需 CRON_SECRET 或 Basic Auth）。

鉴权：Better Auth session；`ensureTenantForUser` 无租户时自动为用户创建个人租户并设为 admin。

## 前端页面（App Router）
- `/[locale]/dashboard`：概览（询盘/流量/关键词摘要，快捷入口）。
- `/[locale]/dashboard/calendar`：内容日历，日视图，支持查看详情、暂停当日推送、标记已发布、预览上传。
- `/[locale]/dashboard/analytics`：效果看板，询盘/流量趋势，关键词 Top10。
- `/[locale]/dashboard/reports`：报告列表，管理员上传 PDF。
- `/[locale]/dashboard/settings`：WP 集成配置，时区/时间可调，展示 24/7 微信。
- `/[locale]/dashboard/import`：管理员导入 CSV/JSON，查看导入任务。

## 环境变量与存储
- 数据库：`DATABASE_URL` 指向 Supabase Postgres（保持 Better Auth+Drizzle）。
- R2：`STORAGE_ACCESS_KEY_ID` / `STORAGE_SECRET_ACCESS_KEY` / `STORAGE_PUBLIC_URL` / `STORAGE_ENDPOINT` / `STORAGE_BUCKET_NAME`（默认 starter）。上传限制 10MB（接口侧校验）。
- Cron Auth：`CRON_SECRET` 或 `CRON_JOBS_USERNAME` / `CRON_JOBS_PASSWORD`。
- WordPress：使用应用密码（用户名+应用密码）走 REST，暂未实现实际推送。

## 建表与迁移
- 开发快速建表（空库）：`pnpm db:push`（使用 `.env.local` 中的 DATABASE_URL 指向 Supabase）。
- 如需审阅 SQL：`pnpm db:generate` -> 查看 `drizzle/*.sql` -> `pnpm db:push` 或 `pnpm db:migrate`。
- 已更新的 Drizzle schema 位于 `lib/db/schema.ts`。

## 使用说明（最简路径）
1) 配置 `.env.local`：
   - `DATABASE_URL=`（Supabase Postgres）
   - R2 相关 `STORAGE_*`
   - `CRON_SECRET=`（用于 `/api/cron/publish`）
2) 执行建表：`pnpm db:push`
3) 启动：`pnpm dev`，登录后访问 `/zh/dashboard`（或 `/en/dashboard`）。
4) 管理员上传/配置：
   - 报告上传：`/dashboard/reports`
   - 数据导入：`/dashboard/import`
   - WP 配置：`/dashboard/settings`（设置站点、用户名、应用密码、时区、每日发布时间）
5) 排期与发布：
   - 在日历页查看/暂停/标记发布。
   - 定时发布：配置外部定时器按日调用 `/api/cron/publish`（建议每日 12:05 Asia/Shanghai），当前仅标记已发布；如需推送到 WP，扩展路由中与 WP REST 对接。

## 数据导入建议（手工导入）
- 询盘 CSV：`period,count`（period 用月初 YYYY-MM-01）。
- 流量 CSV：`period,clicks,impressions,ctr,position`。
- 关键词 CSV：`keyword,target_url,rank,rank_delta,captured_at`。
- KPI CSV：`type,value_numeric,delta_numeric,period_start,period_end,meta(json 可选)`。
导入文件走 `/api/evo/import`，生成 data_import_job（状态 pending/processing/...），当前未附带后台处理逻辑，可按需要添加 worker/cron 解析文件入库。

## 发布任务（WP 集成）扩展点
`app/api/cron/publish/route.ts` 现仅将当日、已到时的 scheduled 文章置为 published 并记录 log。接入 WP REST 的推荐步骤：
1) 读取 wp_integration（site_url/wp_username/wp_app_password）。
2) 使用 Basic Auth（用户名:应用密码）调用 `POST {site_url}/wp-json/wp/v2/posts`，传递 title/content/status=publish。
3) 成功后写入 post_publish_log.target_url 为 WP 返回的 link。

## 租户与权限
- `ensureTenantForUser(userId)`：首次访问自动创建 tenant + membership(admin)。
- 现仅实现全局管理员视角：tenant_membership.role=admin 才能上传报告、导入数据、配置 WP。
- 所有查询均按 tenantId 过滤，保证多租户隔离。***
