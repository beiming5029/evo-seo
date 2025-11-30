import { randomUUID } from "crypto";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  index,
  jsonb,
  date,
  numeric,
  uniqueIndex,
  bigserial,
  bigint
} from "drizzle-orm/pg-core";

// 公司/客户表：用户只绑定一家，公司下可有多个站点
export const company = pgTable("company", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  contactEmail: text("contact_email"),
  validUntil: date("valid_until"),
  cooperationStartDate: date("cooperation_start_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 用户基础表：包含角色、订阅、封禁等信息（Better Auth 主表）
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // total available credits for the user
  credits: integer("credits").default(0).notNull(),
  // user role: 'admin' | 'user'
  role: text("role").default("user").notNull(),
  // current subscription plan
  planKey: text("plan_key").default("free"),
  // ban status
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  // 所属公司，一对一绑定
  companyId: text("company_id").references(() => company.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 会话表：Better Auth session
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// 第三方账号表：OAuth/凭证账号绑定
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

// 验证码/验证链接表
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


// 重置密码 token
export const passwordResetToken = pgTable("password_reset_token", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter 订阅
export const newsletterSubscription = pgTable("newsletter_subscription", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active, unsubscribed
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// 多租户主体（站点），归属公司
export const tenant = pgTable("tenant", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  companyId: text("company_id").references(() => company.id, { onDelete: "cascade" }),
  siteUrl: text("site_url"),
  // 兼容旧数据：站点级的联系邮箱/合作期（推荐使用 company 表字段）
  contactEmail: text("contact_email"),
  validUntil: date("valid_until"),
  cooperationStartDate: date("cooperation_start_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 多租户成员表：用户-租户关联与租户内角色
export const tenantMembership = pgTable(
  "tenant_membership",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 16 }).default("member").notNull(), // member | admin
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantUserUnique: uniqueIndex("tenant_membership_tenant_user_unique").on(
      table.tenantId,
      table.userId
    ),
  }),
);

// 品牌知识库：品牌语调/产品描述/客户画像
export const brandConfig = pgTable(
  "brand_config",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    brandVoice: text("brand_voice"),
    productDesc: text("product_desc"),
    targetAudience: text("target_audience"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    companyUniqueIdx: uniqueIndex("brand_config_company_unique_idx").on(table.companyId),
  }),
);

// 博客文章（n8n -> supabase 的正文记录）
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: text("content"),
    category: text("category"),
    tags: jsonb("tags"),
    status: text("status").default("ready"), // ready | published | draft
    featuredImage: text("featured_image"),
    allImages: jsonb("all_images"),
    tenantId: text("tenant_id").references(() => tenant.id, { onDelete: "set null" }),
  },
  (table) => ({
    slugUniqueIdx: uniqueIndex("blog_posts_slug_unique_idx").on(table.slug),
  })
);

// WordPress 集成：应用密码/时区/定时发布配置
export const wpIntegration = pgTable(
  "wp_integration",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    siteUrl: text("site_url").notNull(),
    wpUsername: text("wp_username").notNull(),
    wpAppPassword: text("wp_app_password").notNull(), // encrypted at rest
    status: varchar("status", { length: 32 }).default("disconnected").notNull(), // connected | error | disconnected
    timezone: varchar("timezone", { length: 64 }).default("Asia/Shanghai").notNull(),
    publishTimeLocal: varchar("publish_time_local", { length: 8 }).default("12:00").notNull(), // HH:mm
    autoPublish: boolean("auto_publish").default(false).notNull(),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    tenantUniqueIdx: uniqueIndex("wp_integration_tenant_unique_idx").on(table.tenantId),
  }),
);

// 文章排期/日历（客户端展示/定时发布源）
export const contentSchedule = pgTable(
  "content_schedule",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    articleId: bigint("article_id", { mode: "number" }).references(() => blogPosts.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    summary: text("summary"),
    contentUrl: text("content_url").notNull(),
    publishDate: date("publish_date").notNull(),
    status: varchar("status", { length: 16 }).default("ready").notNull(), // ready | published | draft
    platform: varchar("platform", { length: 32 }).default("wordpress").notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    tenantPublishDateIdx: index("content_schedule_tenant_publish_date_idx").on(
      table.tenantId,
      table.publishDate
    ),
  }),
);

// 文章上传内容记录（存储 URL/预览）
export const postUpload = pgTable(
  "post_upload",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => contentSchedule.id, { onDelete: "cascade" }),
    storageUrl: text("storage_url").notNull(),
    previewUrl: text("preview_url"),
    sizeBytes: integer("size_bytes"),
    uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (table) => ({
    postIdx: index("post_upload_post_idx").on(table.postId),
  }),
);

// 发文日志：定时/手动发布状态记录
export const postPublishLog = pgTable(
  "post_publish_log",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    // 记录对应的文章 ID（博客/排期均使用，同步 ID 为字符串存储，避免 FK 限制）
    postId: text("post_id").notNull(),
    publishedAt: timestamp("published_at"),
    targetUrl: text("target_url"),
    status: varchar("status", { length: 24 }).notNull(), // success | failed | skipped_paused
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantPostIdx: index("post_publish_log_tenant_post_idx").on(table.tenantId, table.postId),
  }),
);

// KPI 快照（询盘/流量等汇总）
export const kpiSnapshot = pgTable(
  "kpi_snapshot",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    type: varchar("type", { length: 32 }).notNull(), // inquiries | traffic | keywords | tasks
    valueNumeric: numeric("value_numeric", { precision: 20, scale: 4 }).default("0").notNull(),
    deltaNumeric: numeric("delta_numeric", { precision: 20, scale: 4 }).default("0").notNull(),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantTypePeriodIdx: index("kpi_snapshot_tenant_type_period_idx").on(
      table.tenantId,
      table.type,
      table.periodStart
    ),
  }),
);

// 询盘月度统计
export const inquiryStat = pgTable(
  "inquiry_stat",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    period: date("period").notNull(), // month bucket (use first day of month)
    count: integer("count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantPeriodIdx: index("inquiry_stat_tenant_period_idx").on(table.tenantId, table.period),
  }),
);

// 自然流量统计（点击/展现/CTR/排名）
export const trafficStat = pgTable(
  "traffic_stat",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    period: date("period").notNull(), // date or month bucket
    clicks: integer("clicks").default(0).notNull(),
    impressions: integer("impressions").default(0).notNull(),
    ctr: numeric("ctr", { precision: 8, scale: 4 }).default("0").notNull(),
    position: numeric("position", { precision: 8, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantPeriodIdx: index("traffic_stat_tenant_period_idx").on(table.tenantId, table.period),
  }),
);

// 关键词排名记录（Top10 列表）
export const keywordRanking = pgTable(
  "keyword_ranking",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    targetUrl: text("target_url"),
    rank: integer("rank"),
    rankDelta: integer("rank_delta"),
    capturedAt: timestamp("captured_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantCapturedIdx: index("keyword_ranking_tenant_captured_idx").on(
      table.tenantId,
      table.capturedAt
    ),
  }),
);

// 服务报告（诊断/复盘）
export const report = pgTable(
  "report",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(), // diagnosis | review
    title: text("title").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    fileUrl: text("file_url").notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantCreatedIdx: index("report_tenant_created_idx").on(table.tenantId, table.createdAt),
  }),
);

// 数据导入任务队列（导入 CSV/JSON）
export const dataImportJob = pgTable(
  "data_import_job",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(), // inquiries | traffic | keywords | kpi
    sourceFileUrl: text("source_file_url").notNull(),
    status: varchar("status", { length: 32 }).default("pending").notNull(), // pending | processing | failed | completed
    summary: text("summary"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    tenantCreatedIdx: index("data_import_job_tenant_created_idx").on(table.tenantId, table.createdAt),
  }),
);
