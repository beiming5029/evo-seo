import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts, tenant } from "@/lib/db/schema";
import { listTenantsForUser } from "@/lib/db/tenant";
import { and, eq, inArray } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantIds = (await listTenantsForUser(session.session.userId)).map((t) => t.id);
    if (!tenantIds.length) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const [row] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        status: blogPosts.status,
        createdAt: blogPosts.createdAt,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        category: blogPosts.category,
        tags: blogPosts.tags,
        featuredImage: blogPosts.featuredImage,
        allImages: blogPosts.allImages,
        tenantId: blogPosts.tenantId,
        tenantName: tenant.name,
        tenantSiteUrl: tenant.siteUrl,
      })
      .from(blogPosts)
      .leftJoin(tenant, eq(blogPosts.tenantId, tenant.id))
      .where(and(eq(blogPosts.id, idNum), inArray(blogPosts.tenantId, tenantIds)))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...row,
      publishDate: row.createdAt ? new Date(row.createdAt as any).toISOString().slice(0, 10) : null,
    });
  } catch (error) {
    console.error("[blog-posts/:id] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
