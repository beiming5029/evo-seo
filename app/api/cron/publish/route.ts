import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { db } from "@/lib/db";
import { blogPosts, contentSchedule, postPublishLog, wpIntegration, tenant } from "@/lib/db/schema";
import { and, eq, gte, lte, asc, sql, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

const CRON_SECRET = process.env.CRON_SECRET;
const CRON_JOBS_USERNAME = process.env.CRON_JOBS_USERNAME;
const CRON_JOBS_PASSWORD = process.env.CRON_JOBS_PASSWORD;
const CRON_MAX_POSTS_PER_RUN = Math.max(1, Number.parseInt(process.env.CRON_MAX_POSTS_PER_RUN || "50", 10));

async function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const hasBasicCreds = Boolean(CRON_JOBS_USERNAME && CRON_JOBS_PASSWORD);
  const hasBearer = Boolean(CRON_SECRET);

  const isBasicAuthorized = (() => {
    if (!hasBasicCreds) return false;
    if (!authHeader.startsWith("Basic ")) return false;
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
      const [username, password] = decoded.split(":");
      return username === CRON_JOBS_USERNAME && password === CRON_JOBS_PASSWORD;
    } catch (error) {
      console.error("[Cron publish] Failed to decode basic auth header", error);
      return false;
    }
  })();

  const isBearerAuthorized = hasBearer && authHeader === `Bearer ${CRON_SECRET}`;
  if (isBasicAuthorized || isBearerAuthorized) return true;

  // 开发环境放行，方便本地测试按钮触发；生产环境仍要求凭证
  if (process.env.NODE_ENV !== "production") return true;

  // 尝试使用登录态（如需限制可检查 role）
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.session?.userId) return true;
  } catch (err) {
    // ignore
  }

  return false;
}

function buildPublishDateTime(publishDate: string, publishTimeLocal: string, timezone?: string) {
  const time = publishTimeLocal || "12:00";
  // Only support UTC and Asia/Shanghai explicitly; otherwise fall back to Asia/Shanghai
  if (timezone === "UTC") {
    return new Date(`${publishDate}T${time}:00Z`);
  }
  // Asia/Shanghai UTC+8
  return new Date(`${publishDate}T${time}:00+08:00`);
}

function getDayBoundsByTimezone(baseDate: Date, timezone = "Asia/Shanghai") {
  const tzDate = new Date(baseDate.toLocaleString("en-US", { timeZone: timezone }));
  const y = tzDate.getFullYear();
  const m = tzDate.getMonth(); // 0-based
  const d = tzDate.getDate();
  const start = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
  return { start, end, dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
}

async function publishToWordPress(post: any, integration: any) {
  const site = (integration.siteUrl || "").replace(/\/$/, "");
  const endpoint = `${site}/wp-json/wp/v2/posts`;
  const username = integration.wpUsername;
  const appPassword = integration.wpAppPassword;
  if (!username || !appPassword) throw new Error("Missing WP credentials");
  const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content || post.excerpt || "",
      status: "publish",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP publish failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data?.link || `${site}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const authHeader = req.headers.get("authorization") || "";
    const authType = authHeader.split(" ")[0] || null;
    console.info("[Cron publish] auth info", {
      sessionUserId: session?.session?.userId ?? null,
      authType,
    });
  } catch (err) {
    console.info("[Cron publish] auth info", { sessionUserId: null, authType: null, error: String(err) });
  }

  const now = new Date();
  const { start, end, dateStr } = getDayBoundsByTimezone(now, "Asia/Shanghai");
  console.info("[Cron publish] start", {
    now: now.toISOString(),
    dateStr,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
  });
  try {
    // Get tenants with WP integration
    const integrations = await db.select().from(wpIntegration);
    const statusCounts = await db
      .select({ status: contentSchedule.status, count: sql<number>`count(*)` })
      .from(contentSchedule)
      .groupBy(contentSchedule.status);
    const readySample = await db
      .select({
        id: contentSchedule.id,
        publishDate: contentSchedule.publishDate,
        status: contentSchedule.status,
        tenantId: contentSchedule.tenantId,
      })
      .from(contentSchedule)
      .where(inArray(contentSchedule.status, ["ready", "draft"]))
      .limit(5);
    const anySample = await db
      .select({
        id: contentSchedule.id,
        publishDate: contentSchedule.publishDate,
        status: contentSchedule.status,
        tenantId: contentSchedule.tenantId,
      })
      .from(contentSchedule)
      .orderBy(asc(contentSchedule.publishDate))
      .limit(5);
    const todayDraftReady = await db
      .select({
        id: contentSchedule.id,
        publishDate: contentSchedule.publishDate,
        status: contentSchedule.status,
        tenantId: contentSchedule.tenantId,
      })
      .from(contentSchedule)
      .where(
        and(
          inArray(contentSchedule.status, ["ready", "draft"]),
          gte(contentSchedule.publishDate, dateStr),
          lte(contentSchedule.publishDate, dateStr)
        )
      );
    console.info("[Cron publish] status counts", statusCounts);
    console.info("[Cron publish] ready sample", { count: readySample.length, items: readySample });
    console.info("[Cron publish] any sample", { count: anySample.length, items: anySample });
    console.info("[Cron publish] today draft/ready", { count: todayDraftReady.length, items: todayDraftReady });
    let processed = 0;
    const published: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    // 取今天需要发布的排期（状态 ready，对应 publishDate 当天）
    const postsToHandle = await db
      .select({
        id: contentSchedule.id,
        tenantId: contentSchedule.tenantId,
        title: contentSchedule.title,
        summary: contentSchedule.summary,
        publishDate: contentSchedule.publishDate,
        articleId: contentSchedule.articleId,
        contentUrl: contentSchedule.contentUrl,
        status: contentSchedule.status,
        tenantName: tenant.name,
        tenantSiteUrl: tenant.siteUrl,
        articleTitle: blogPosts.title,
        articleContent: blogPosts.content,
        articleExcerpt: blogPosts.excerpt,
      })
      .from(contentSchedule)
      .leftJoin(tenant, eq(contentSchedule.tenantId, tenant.id))
      .leftJoin(blogPosts, eq(contentSchedule.articleId, blogPosts.id))
      .where(
        and(
          inArray(contentSchedule.status, ["ready", "draft"]),
          gte(contentSchedule.publishDate, dateStr),
          lte(contentSchedule.publishDate, dateStr)
        )
      )
      .orderBy(asc(contentSchedule.publishDate))
      .limit(CRON_MAX_POSTS_PER_RUN);

    console.info("[Cron publish] posts fetched", { count: postsToHandle.length });

    for (const post of postsToHandle) {
      processed += 1;
      const integration = integrations.find((i) => i.tenantId === post.tenantId);
      const autoPublish = integration?.autoPublish && (integration.publishTimeLocal || "12:00");
      const scheduledAt = integration
        ? buildPublishDateTime(dateStr, integration.publishTimeLocal || "12:00", integration.timezone)
        : null;
      const isDue = autoPublish ? now >= (scheduledAt as Date) : false;
      console.info("[Cron publish] handling post", {
        id: post.id,
        tenantId: post.tenantId,
        publishDate: post.publishDate,
        status: post.status,
        autoPublish: Boolean(integration?.autoPublish),
        scheduledAt: scheduledAt?.toISOString?.() ?? null,
        isDue,
      });

      // 如果没有集成或 autoPublish 关闭，直接标记已发布（不推送）
      if (!integration || !integration.autoPublish) {
        await db
          .update(contentSchedule)
          .set({ status: "published", updatedAt: new Date() })
          .where(eq(contentSchedule.id, post.id));
        await db.insert(postPublishLog).values({
          tenantId: post.tenantId || "",
          postId: String(post.id),
          publishedAt: new Date(),
          targetUrl: integration?.siteUrl ?? null,
          status: "success",
          message: "Marked as published without WordPress auto-push",
        });
        published.push(String(post.id));
        console.info("[Cron publish] marked published without push", { id: post.id });
        continue;
      }

      // 有集成但还未到时间
      // if (!isDue) {
      //   skipped.push(String(post.id));
      //   continue;
      // }

      try {
        const link = await publishToWordPress(post, integration);
        await db
          .update(contentSchedule)
          .set({ status: "published", updatedAt: new Date() })
          .where(eq(contentSchedule.id, post.id));

        await db.insert(postPublishLog).values({
          tenantId: post.tenantId || "",
          postId: String(post.id),
          publishedAt: new Date(),
          targetUrl: link,
          status: "success",
          message: "Published via WordPress auto-push",
        });
        published.push(String(post.id));
        console.info("[Cron publish] publish success", { id: post.id, link });
      } catch (err: any) {
        console.error("[Cron publish] push error", err);
        failed.push(String(post.id));
        await db.insert(postPublishLog).values({
          tenantId: post.tenantId || "",
          postId: String(post.id),
          publishedAt: new Date(),
          targetUrl: null,
          status: "failed",
          message: err?.message || "Publish failed",
        });
      }
    }

    return NextResponse.json({
      processed,
      published,
      skipped,
      failed,
      now: now.toISOString(),
    });
  } catch (error) {
    console.error("[Cron publish] error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return await POST(req);
}
