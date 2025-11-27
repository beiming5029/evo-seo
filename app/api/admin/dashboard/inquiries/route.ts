import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { kpiSnapshot, user as userTable } from "@/lib/db/schema";
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
    const { userEmail, userId, periodStart, periodEnd, value, delta } = body as {
      userEmail?: string;
      userId?: string;
      periodStart: string;
      periodEnd: string;
      value: number;
      delta?: number;
    };

    if (!periodStart || !periodEnd || value === undefined || value === null) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const target = await db.select().from(userTable).where(eq(userTable.email, userEmail)).limit(1);
      targetUserId = target[0]?.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "未找到目标用户" }, { status: 404 });
    }

    const { tenantId } = await ensureTenantForUser(targetUserId);

    // 先删除同周期的 inquiries 记录再插入
    await db
      .delete(kpiSnapshot)
      .where(
        and(
          eq(kpiSnapshot.tenantId, tenantId),
          eq(kpiSnapshot.type, "inquiries"),
          eq(kpiSnapshot.periodStart, periodStart),
          eq(kpiSnapshot.periodEnd, periodEnd)
        )
      );

    const [inserted] = await db
      .insert(kpiSnapshot)
      .values({
        tenantId,
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
