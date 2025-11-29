import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { contentSchedule, user as userTable } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      tenantId,
      userEmail,
      userId,
      title,
      summary,
      contentUrl,
      publishDate,
      status = "scheduled",
    } = body as {
      tenantId?: string;
      userEmail?: string;
      userId?: string;
      title: string;
      summary?: string;
      contentUrl: string;
      publishDate: string;
      status?: "scheduled" | "published" | "paused";
    };

    if (!title || !contentUrl || !publishDate) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const target = await db.select().from(userTable).where(eq(userTable.email, userEmail)).limit(1);
      targetUserId = target[0]?.id;
    }

    const { tenantId: resolvedTenantId } = await ensureTenantForUser(
      targetUserId || session.session.userId,
      tenantId
    );

    const [created] = await db
      .insert(contentSchedule)
      .values({
        tenantId: resolvedTenantId,
        title,
        summary,
        contentUrl,
        publishDate,
        status,
        platform: "wordpress",
        createdBy: session.session.userId,
      })
      .returning();

    return NextResponse.json({ post: created });
  } catch (error) {
    console.error("[admin/posts] error", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
