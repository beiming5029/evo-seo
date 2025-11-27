import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { post } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { and, asc, eq, gte, lte } from "drizzle-orm";

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

    const { tenantId } = await ensureTenantForUser(session.session.userId);
    const url = new URL(req.url);
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
      .select()
      .from(post)
      .where(
        and(
          eq(post.tenantId, tenantId),
          gte(post.publishDate, startDate),
          lte(post.publishDate, endDate)
        )
      )
      .orderBy(asc(post.publishDate));

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
    const { tenantId } = await ensureTenantForUser(session.session.userId);
    const body = await req.json();
    const { title, summary, contentUrl, publishDate, status = "scheduled", platform = "wordpress" } = body;

    if (!title || !contentUrl || !publishDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(post)
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
