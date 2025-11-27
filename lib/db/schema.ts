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
  uniqueIndex
} from "drizzle-orm/pg-core";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

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


// Password reset tokens
export const passwordResetToken = pgTable("password_reset_token", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter subscriptions
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

// Multi-tenant support
export const tenant = pgTable("tenant", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// WordPress integration settings per tenant
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
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    tenantUniqueIdx: uniqueIndex("wp_integration_tenant_unique_idx").on(table.tenantId),
  }),
);

// Content calendar posts
export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary"),
    contentUrl: text("content_url").notNull(),
    publishDate: date("publish_date").notNull(),
    status: varchar("status", { length: 16 }).default("scheduled").notNull(), // scheduled | published | paused
    platform: varchar("platform", { length: 32 }).default("wordpress").notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    tenantPublishDateIdx: index("post_tenant_publish_date_idx").on(table.tenantId, table.publishDate),
  }),
);

export const postUpload = pgTable(
  "post_upload",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
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

export const postPublishLog = pgTable(
  "post_publish_log",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
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

// KPI and metrics
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
