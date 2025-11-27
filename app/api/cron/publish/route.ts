import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { db } from "@/lib/db";
import { post, postPublishLog, wpIntegration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const CRON_SECRET = process.env.CRON_SECRET;
const CRON_JOBS_USERNAME = process.env.CRON_JOBS_USERNAME;
const CRON_JOBS_PASSWORD = process.env.CRON_JOBS_PASSWORD;

function isAuthorized(req: NextRequest) {
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
  return isBasicAuthorized || isBearerAuthorized;
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

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  try {
    // Get tenants with WP integration
    const integrations = await db.select().from(wpIntegration);
    let processed = 0;
    const published: string[] = [];
    const skipped: string[] = [];

    for (const integration of integrations) {
      const scheduledAt = buildPublishDateTime(
        now.toISOString().slice(0, 10),
        integration.publishTimeLocal || "12:00",
        integration.timezone
      );
      const isDueToday = now >= scheduledAt;

      const postsToPublish = await db
        .select()
        .from(post)
        .where(
          and(
            eq(post.tenantId, integration.tenantId),
            eq(post.publishDate, now.toISOString().slice(0, 10)),
            eq(post.status, "scheduled")
          )
        );

      for (const p of postsToPublish) {
        processed += 1;
        if (!isDueToday) {
          skipped.push(p.id);
          continue;
        }

        const targetUrl = integration.siteUrl || "";
        await db
          .update(post)
          .set({ status: "published", updatedAt: new Date() })
          .where(eq(post.id, p.id));

        await db.insert(postPublishLog).values({
          tenantId: p.tenantId,
          postId: p.id,
          publishedAt: new Date(),
          targetUrl,
          status: "success",
          message: "Published via cron (WordPress push not implemented, marked as published)",
        });

        published.push(p.id);
      }
    }

    return NextResponse.json({
      processed,
      published,
      skipped,
      now: now.toISOString(),
    });
  } catch (error) {
    console.error("[Cron publish] error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
