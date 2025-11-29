import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { keywordRanking, user as userTable } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq } from "drizzle-orm";

function trendToDelta(trend?: string | null, provided?: number | null) {
  if (provided !== undefined && provided !== null) return provided;
  if (!trend) return null;
  if (trend === "up") return 1;
  if (trend === "down") return -1;
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, userEmail, userId, keywords } = body as {
      tenantId?: string;
      userEmail?: string;
      userId?: string;
      keywords: Array<{
        keyword: string;
        targetUrl?: string;
        rank?: number | null;
        rankDelta?: number | null;
        trend?: string | null;
        capturedAt?: string;
      }>;
    };

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "缺少关键词数据" }, { status: 400 });
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

    const now = new Date();
    const inserted = [];
    for (const kw of keywords) {
      if (!kw.keyword) continue;
      const [row] = await db
        .insert(keywordRanking)
        .values({
          tenantId: targetTenantId,
          keyword: kw.keyword,
          targetUrl: kw.targetUrl,
          rank: kw.rank ?? null,
          rankDelta: trendToDelta(kw.trend, kw.rankDelta),
          capturedAt: kw.capturedAt ? new Date(kw.capturedAt) : now,
        })
        .returning();
      inserted.push(row);
    }

    return NextResponse.json({ keywords: inserted });
  } catch (error) {
    console.error("[admin/keywords] error", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
