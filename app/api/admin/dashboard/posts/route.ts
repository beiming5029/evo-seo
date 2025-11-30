import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { blogPosts, contentSchedule, user as userTable } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { and, eq, inArray } from "drizzle-orm";

function parseMonth(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthNum = Number(monthStr);
  if (!Number.isFinite(year) || !Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) return null;
  const days = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  return { year, month: monthNum, days };
}

const formatDate = (month: string, day: number) => `${month}-${String(day).padStart(2, "0")}`;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const articleIdParam = url.searchParams.get("articleId");
    if (!articleIdParam) {
      return NextResponse.json({ error: "缺少 articleId" }, { status: 400 });
    }
    const articleId = Number(articleIdParam);
    if (!Number.isFinite(articleId)) {
      return NextResponse.json({ error: "articleId 必须为数字" }, { status: 400 });
    }

    const [article] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        status: blogPosts.status,
        tenantId: blogPosts.tenantId,
      })
      .from(blogPosts)
      .where(eq(blogPosts.id, articleId))
      .limit(1);

    if (!article) {
      return NextResponse.json({ error: "未找到对应文章" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("[admin/posts] GET error", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 批量按月上传文章 ID
    if (typeof body?.month === "string" && Array.isArray(body?.articles)) {
      const { month, articles, tenantId, userEmail, userId } = body as {
        month: string;
        articles: { day?: number; articleId?: number | string }[];
        tenantId?: string;
        userEmail?: string;
        userId?: string;
      };

      const parsedMonth = parseMonth(month);
      if (!parsedMonth) {
        return NextResponse.json({ error: "月份格式需为 YYYY-MM" }, { status: 400 });
      }

      let targetUserId = userId as string | undefined;
      if (!targetUserId && userEmail) {
        const target = await db.select().from(userTable).where(eq(userTable.email, userEmail)).limit(1);
        targetUserId = target[0]?.id;
      }
      const { tenantId: resolvedTenantId } = await ensureTenantForUser(
        targetUserId || session.session.userId,
        tenantId
      );

      const normalizedItems = (articles || [])
        .map((item) => ({
          day: Number(item.day),
          articleId: Number(item.articleId),
        }))
        .filter((item) => Number.isFinite(item.day) && Number.isFinite(item.articleId) && item.day >= 1);

      const validItems = normalizedItems.filter((i) => i.day <= parsedMonth.days);
      if (!validItems.length) {
        return NextResponse.json({ error: "请至少填写一条有效的文章 ID" }, { status: 400 });
      }

      const articleIds = Array.from(new Set(validItems.map((i) => i.articleId)));
      const articlesInDb = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          status: blogPosts.status,
        })
        .from(blogPosts)
        .where(inArray(blogPosts.id, articleIds));

      const articleMap = new Map(articlesInDb.map((a) => [a.id, a]));
      const missing = articleIds.filter((id) => !articleMap.has(id));
      if (missing.length) {
        return NextResponse.json(
          { error: `以下文章 ID 不存在：${missing.join(", ")}` },
          { status: 400 }
        );
      }

      const inserted: any[] = [];
      for (const item of validItems) {
        const publishDate = formatDate(month, item.day);
        const meta = articleMap.get(item.articleId)!;
        await db
          .delete(contentSchedule)
          .where(and(eq(contentSchedule.tenantId, resolvedTenantId), eq(contentSchedule.publishDate, publishDate)));
        const [row] = await db
          .insert(contentSchedule)
          .values({
            tenantId: resolvedTenantId,
            articleId: meta.id,
            title: meta.title,
            summary: meta.excerpt,
            contentUrl: meta.slug || String(meta.id),
            publishDate,
            status:
              meta.status === "published"
                ? "published"
                : meta.status === "draft"
                ? "draft"
                : "ready",
            platform: "wordpress",
            createdBy: session.session.userId,
          })
          .returning();
        inserted.push(row);
      }

      return NextResponse.json({
        posts: inserted,
        month,
        daysHandled: inserted.length,
      });
    }

    // 单条创建（兼容旧流程）
    const {
      tenantId,
      userEmail,
      userId,
      title,
      summary,
      contentUrl,
      publishDate,
      status = "ready",
    } = body as {
      tenantId?: string;
      userEmail?: string;
      userId?: string;
      title: string;
      summary?: string;
      contentUrl: string;
      publishDate: string;
      status?: "ready" | "published" | "draft";
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
