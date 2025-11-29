import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { inquiryStat, kpiSnapshot, user as userTable } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, userEmail, userId, periodStart, periodEnd, value, delta, data } = body as {
      tenantId?: string;
      userEmail?: string;
      userId?: string;
      periodStart?: string;
      periodEnd?: string;
      value?: number;
      delta?: number;
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
      tenantId
    );

    if (Array.isArray(data) && data.length) {
      const inserted = [];
      for (const item of data) {
        const period = item.date || item.period;
        if (!period) continue;
        const count = item.count ?? 0;
        await db
          .delete(inquiryStat)
          .where(and(eq(inquiryStat.tenantId, resolvedTenantId), eq(inquiryStat.period, period)));
        const [row] = await db
          .insert(inquiryStat)
          .values({
            tenantId: resolvedTenantId,
            period,
            count,
          })
          .returning();
        inserted.push(row);
      }
      return NextResponse.json({ inquiries: inserted });
    }

    if (!periodStart || !periodEnd || value === undefined || value === null) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    await db
      .delete(kpiSnapshot)
      .where(
        and(
          eq(kpiSnapshot.tenantId, resolvedTenantId),
          eq(kpiSnapshot.type, "inquiries"),
          eq(kpiSnapshot.periodStart, periodStart),
          eq(kpiSnapshot.periodEnd, periodEnd)
        )
      );

    const [inserted] = await db
      .insert(kpiSnapshot)
      .values({
        tenantId: resolvedTenantId,
        type: "inquiries",
        periodStart,
        periodEnd,
        valueNumeric: value,
        deltaNumeric: delta ?? 0,
        meta: null,
      })
      .returning();

    return NextResponse.json({ kpi: inserted });
  } catch (error) {
    console.error("[admin/inquiries] error", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
