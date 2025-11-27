import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { post, postUpload } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq } from "drizzle-orm";
import { uploadBufferToR2 } from "@/lib/r2-storage";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { tenantId } = await ensureTenantForUser(session.session.userId);

    const form = await req.formData();
    const postId = form.get("postId")?.toString();
    const file = form.get("file");

    if (!postId || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing postId or file" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(post)
      .where(eq(post.id, postId))
      .limit(1);

    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const key = `posts/${tenantId}/${postId}/${Date.now()}-${file.name}`;
    const storageUrl = await uploadBufferToR2(key, buffer, file.type || "application/octet-stream");

    const [uploaded] = await db
      .insert(postUpload)
      .values({
        tenantId,
        postId,
        storageUrl,
        previewUrl: storageUrl,
        sizeBytes: buffer.byteLength,
        uploadedBy: session.session.userId,
      })
      .returning();

    return NextResponse.json({ upload: uploaded });
  } catch (error) {
    console.error("[evo/posts/upload] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
