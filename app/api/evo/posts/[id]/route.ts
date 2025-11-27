import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { post, postUpload } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { and, asc, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId } = await ensureTenantForUser(session.session.userId);
    const [item] = await db
      .select()
      .from(post)
      .where(and(eq(post.id, params.id), eq(post.tenantId, tenantId)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const uploads = await db
      .select()
      .from(postUpload)
      .where(eq(postUpload.postId, item.id))
      .orderBy(asc(postUpload.uploadedAt));

    return NextResponse.json({ post: item, uploads });
  } catch (error) {
    console.error("[evo/posts/:id] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { tenantId } = await ensureTenantForUser(session.session.userId);
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(post)
      .where(and(eq(post.id, params.id), eq(post.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowedStatus = ["scheduled", "published", "paused"];
    const updatePayload: Record<string, any> = {};

    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.summary !== undefined) updatePayload.summary = body.summary;
    if (body.contentUrl !== undefined) updatePayload.contentUrl = body.contentUrl;
    if (body.publishDate !== undefined) updatePayload.publishDate = body.publishDate;
    if (body.status !== undefined) {
      if (!allowedStatus.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updatePayload.status = body.status;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No changes" }, { status: 400 });
    }

    const [updated] = await db
      .update(post)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(eq(post.id, params.id))
      .returning();

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error("[evo/posts/:id] PATCH error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
