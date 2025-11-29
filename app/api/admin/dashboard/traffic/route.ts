import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { trafficStat, user as userTable } from "@/lib/db/schema";
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
    const { tenantId, userEmail, userId, data } = body as {
      tenantId?: string;
      userEmail?: string;
      userId?: string;
      data: Array<{
        date?: string;
        period?: string;
        clicks?: number;
        impressions?: number;
        ctr?: number;
        position?: number;
        count?: number;
      }>;
    };

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "缺少数据" }, { status: 400 });
    }

    let targetTenantId = tenantId;
    let targetUserId = userId;

    if (!targetTenantId && !targetUserId && userEmail) {
      const target = await db.select().from(userTable).where(eq(userTable.email, userEmail)).limit(1);
      targetUserId = target[0]?.id;
    }

    if (!targetTenantId) {
      if (targetUserId) {
        const ctx = await ensureTenantForUser(targetUserId);
        targetTenantId = ctx.tenantId;
      } else {
        const ctx = await ensureTenantForUser(session.session.userId);
        targetTenantId = ctx.tenantId;
      }
    }

    const inserted = [];
    for (const item of data) {
      const period = item.date || item.period;
      if (!period) continue;
      await db
        .delete(trafficStat)
        .where(and(eq(trafficStat.tenantId, targetTenantId), eq(trafficStat.period, period)));

      const payload: typeof trafficStat.$inferInsert = {
        tenantId: targetTenantId,
        period,
        clicks: item.clicks ?? item.count ?? 0,
        impressions: item.impressions ?? 0,
        ctr: (item.ctr ?? 0).toString(),
        position: item.position !== undefined && item.position !== null ? item.position.toString() : null,
      };

      const [row] = await db.insert(trafficStat).values(payload).returning();
      inserted.push(row);
    }

    return NextResponse.json({ items: inserted });
  } catch (error) {
    console.error("[admin/traffic] error", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
