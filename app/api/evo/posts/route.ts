import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts, contentSchedule, tenant } from "@/lib/db/schema";
import { ensureTenantForUser, listTenantsForUser } from "@/lib/db/tenant";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";

function getMonthDateRange(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1; // 1-based
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const format = (d: Date) => d.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");
    const normalizeDateParam = (v: string | null) => (v ? v.slice(0, 10) : null);

    // 聚合当前用户所有可访问站点（先确保有 tenant/company）
    await ensureTenantForUser(session.session.userId);
    const list = await listTenantsForUser(session.session.userId);
    const tenantIds = list.map((t) => t.id);
    if (!tenantIds.length) {
      return NextResponse.json({ posts: [] });
    }
    // 默认当前月份，可被 start/end 覆盖
    const { start: defaultStart, end: defaultEnd } = getMonthDateRange();
    const startDate = normalizeDateParam(startParam) || defaultStart;
    const endDate = normalizeDateParam(endParam) || defaultEnd;

    const rows = await db
      .select({
        id: contentSchedule.id,
        tenantId: contentSchedule.tenantId,
        title: contentSchedule.title,
        summary: contentSchedule.summary,
        slug: contentSchedule.slug,
        publishDate: contentSchedule.publishDate,
        status: contentSchedule.status,
        tenantName: tenant.name,
        tenantSiteUrl: tenant.siteUrl,
        articleTitle: blogPosts.title,
        articleSlug: blogPosts.slug,
        articleStatus: blogPosts.status,
        articleExcerpt: blogPosts.excerpt,
      })
      .from(contentSchedule)
      .leftJoin(tenant, eq(contentSchedule.tenantId, tenant.id))
      .leftJoin(blogPosts, eq(contentSchedule.articleId, blogPosts.id))
      .where(
        and(
          inArray(contentSchedule.tenantId, tenantIds),
          inArray(contentSchedule.status, ["ready", "published", "draft"]),
          gte(contentSchedule.publishDate, startDate),
          lte(contentSchedule.publishDate, endDate)
        )
      )
      .orderBy(asc(contentSchedule.publishDate));

    const normalized = rows.map((row) => ({
      ...row,
      status: row.status === "draft" ? "ready" : row.status,
    }));

    return NextResponse.json({ posts: normalized });
  } catch (error) {
    console.error("[evo/posts] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const {
      title,
      summary,
      slug,
      publishDate,
      status = "ready",
      platform = "wordpress",
      tenantId: tenantIdFromBody,
    } = body;
    const { tenantId } = await ensureTenantForUser(session.session.userId, tenantIdFromBody);

    if (!title || !slug || !publishDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(contentSchedule)
      .values({
        tenantId,
        title,
        summary,
        slug,
        publishDate,
        status,
        platform,
        createdBy: session.session.userId,
      })
      .returning();

    return NextResponse.json({ post: inserted });
  } catch (error) {
    console.error("[evo/posts] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
