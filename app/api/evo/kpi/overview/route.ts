import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inquiryStat, trafficStat, keywordRanking } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const tenantIdParam = url.searchParams.get("tenantId") || undefined;
    const { tenantId } = await ensureTenantForUser(session.session.userId, tenantIdParam);

    const [inquiries, traffic, keywords] = await Promise.all([
      db
        .select()
        .from(inquiryStat)
        .where(eq(inquiryStat.tenantId, tenantId))
        .orderBy(asc(inquiryStat.period))
        .limit(12),
      db
        .select()
        .from(trafficStat)
        .where(eq(trafficStat.tenantId, tenantId))
        .orderBy(asc(trafficStat.period))
        .limit(12),
      db
        .select()
        .from(keywordRanking)
        .where(eq(keywordRanking.tenantId, tenantId))
        .orderBy(asc(keywordRanking.rank))
        .limit(10),
    ]);

    return NextResponse.json({
      inquiries,
      traffic,
      keywords,
    });
  } catch (error) {
    console.error("[evo/kpi/overview] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
