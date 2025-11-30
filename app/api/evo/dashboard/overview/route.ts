import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentSchedule, inquiryStat, report, tenantMembership } from "@/lib/db/schema";
import { ensureTenantForUser, listTenantsForUser } from "@/lib/db/tenant";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 确保至少有一个站点
    await ensureTenantForUser(session.session.userId);
    const tenantIds = (await listTenantsForUser(session.session.userId)).map((t) => t.id);
    if (!tenantIds.length) {
      return NextResponse.json({
        siteCount: 0,
        currentMonthInquiries: 0,
        currentMonthArticles: 0,
        latestReport: null,
      });
    }

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const [inquiries, articles, latestReport, siteCountRow] = await Promise.all([
      db
        .select({
          period: inquiryStat.period,
          count: inquiryStat.count,
        })
        .from(inquiryStat)
        .where(
          and(inArray(inquiryStat.tenantId, tenantIds), gte(inquiryStat.period, startStr), lte(inquiryStat.period, endStr))
        ),
      db
        .select({ id: contentSchedule.id })
        .from(contentSchedule)
        .where(
          and(
            inArray(contentSchedule.tenantId, tenantIds),
            gte(contentSchedule.publishDate, startStr),
            lte(contentSchedule.publishDate, endStr)
          )
        ),
      db
        .select({
          id: report.id,
          title: report.title,
          periodEnd: report.periodEnd,
          createdAt: report.createdAt,
          fileUrl: report.fileUrl,
        })
        .from(report)
        .where(inArray(report.tenantId, tenantIds))
        .orderBy(desc(report.createdAt))
        .limit(1),
      db
        .select({ value: tenantMembership.tenantId })
        .from(tenantMembership)
        .where(eq(tenantMembership.userId, session.session.userId)),
    ]);

    const latest = latestReport[0];
    const currentMonthInquiries = inquiries.reduce((sum, row) => sum + (row.count ?? 0), 0);
    const currentMonthArticles = articles.length;

    return NextResponse.json({
      siteCount: siteCountRow.length || tenantIds.length,
      currentMonthInquiries,
      currentMonthArticles,
      latestReport: latest
        ? {
            id: latest.id,
            title: latest.title,
            date: latest.periodEnd || latest.createdAt,
            fileUrl: latest.fileUrl,
          }
        : null,
    });
  } catch (error) {
    console.error("[evo/dashboard/overview] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
