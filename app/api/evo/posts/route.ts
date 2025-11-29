import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentSchedule, tenant } from "@/lib/db/schema";
import { ensureTenantForUser, listTenantsForUser } from "@/lib/db/tenant";
import { and, asc, eq, gte, inArray, lte, getTableColumns } from "drizzle-orm";

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
    const tenantIdParam = url.searchParams.get("tenantId") || undefined;
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
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month");
    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");

    let startDate: string;
    let endDate: string;

    if (startParam && endParam) {
      startDate = startParam;
      endDate = endParam;
    } else {
      const parsedYear = year ? Number.parseInt(year, 10) : undefined;
      const parsedMonth = month ? Number.parseInt(month, 10) : undefined;
      const { start, end } = getMonthDateRange(parsedYear, parsedMonth);
      startDate = start;
      endDate = end;
    }

    const rows = await db
      .select({
        ...getTableColumns(contentSchedule),
        tenantName: tenant.name,
        tenantSiteUrl: tenant.siteUrl,
      })
      .from(contentSchedule)
      .leftJoin(tenant, eq(contentSchedule.tenantId, tenant.id))
      .where(
        and(
          inArray(contentSchedule.tenantId, tenantIds),
          gte(contentSchedule.publishDate, startDate),
          lte(contentSchedule.publishDate, endDate)
        )
      )
      .orderBy(asc(contentSchedule.publishDate));

    return NextResponse.json({ posts: rows });
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
      contentUrl,
      publishDate,
      status = "scheduled",
      platform = "wordpress",
      tenantId: tenantIdFromBody,
    } = body;
    const { tenantId } = await ensureTenantForUser(session.session.userId, tenantIdFromBody);

    if (!title || !contentUrl || !publishDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(contentSchedule)
      .values({
        tenantId,
        title,
        summary,
        contentUrl,
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
