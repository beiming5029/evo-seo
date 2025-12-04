import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { inquiryStat, user as userTable } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, userEmail, userId, periodStart, value, data } = body as {
      tenantId?: string;
      userEmail?: string;
      userId?: string;
      periodStart?: string;
      value?: number;
      data?: Array<{ date?: string; period?: string; count?: number }>;
    };

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const target = await db.select().from(userTable).where(eq(userTable.email, userEmail)).limit(1);
      targetUserId = target[0]?.id;
    }

    if (!tenantId && !targetUserId) {
      return NextResponse.json({ error: "缺少目标租户或用户" }, { status: 400 });
    }

    const { tenantId: resolvedTenantId } = await ensureTenantForUser(
      targetUserId || session.session.userId,
      tenantId,
      { allowCrossCompany: true }
    );

    const records = (() => {
      if (Array.isArray(data) && data.length) {
        return data
          .map((item) => ({
            period: item.date || item.period,
            count: item.count ?? 0,
          }))
          .filter((item) => Boolean(item.period)) as Array<{ period: string; count: number }>;
      }
      if (periodStart && value !== undefined && value !== null) {
        return [{ period: periodStart, count: value }];
      }
      return [];
    })();

    if (!records.length) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const values = records.map((item) => ({
      tenantId: resolvedTenantId,
      period: item.period,
      count: item.count ?? 0,
    }));

    const inserted = await db
      .insert(inquiryStat)
      .values(values)
      .onConflictDoUpdate({
        target: [inquiryStat.tenantId, inquiryStat.period],
        set: {
          count: sql`excluded.count`,
        },
      })
      .returning();

    return NextResponse.json({ inquiries: inserted });
  } catch (error) {
    console.error("[admin/inquiries] error", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
