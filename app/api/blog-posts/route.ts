import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts, tenant } from "@/lib/db/schema";
import { ensureTenantForUser, listTenantsForUser } from "@/lib/db/tenant";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";

function getMonthDateRange(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1; // 1-based
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const tenantIdParam = url.searchParams.get("tenantId") || undefined;
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month");
    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");

    let tenantIds: string[] = [];
    if (tenantIdParam) {
      const { tenantId } = await ensureTenantForUser(session.session.userId, tenantIdParam);
      tenantIds = [tenantId];
    } else {
      const list = await listTenantsForUser(session.session.userId);
      tenantIds = list.map((t) => t.id);
    }
    if (!tenantIds.length) {
      return NextResponse.json({ posts: [] });
    }

    let startDate: Date;
    let endDate: Date;
    if (startParam && endParam) {
      startDate = new Date(startParam);
      endDate = new Date(endParam);
    } else {
      const parsedYear = year ? Number.parseInt(year, 10) : undefined;
      const parsedMonth = month ? Number.parseInt(month, 10) : undefined;
      const { start, end } = getMonthDateRange(parsedYear, parsedMonth);
      startDate = start;
      endDate = end;
    }

    const rows = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        status: blogPosts.status,
        createdAt: blogPosts.createdAt,
        tenantId: blogPosts.tenantId,
        tenantName: tenant.name,
        tenantSiteUrl: tenant.siteUrl,
      })
      .from(blogPosts)
      .leftJoin(tenant, eq(blogPosts.tenantId, tenant.id))
      .where(
        and(inArray(blogPosts.tenantId, tenantIds), gte(blogPosts.createdAt, startDate), lte(blogPosts.createdAt, endDate))
      )
      .orderBy(asc(blogPosts.createdAt));

    const posts = rows.map((row) => ({
      ...row,
      publishDate: row.createdAt ? new Date(row.createdAt as any).toISOString().slice(0, 10) : null,
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[blog-posts] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
