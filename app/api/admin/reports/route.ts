import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";
import { uploadBufferToR2 } from "@/lib/r2-storage";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB (Vercel body limit friendly)

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const tenantId = form.get("tenantId")?.toString();
    const type = form.get("type")?.toString();
    const title = form.get("title")?.toString();
    const periodStart = form.get("periodStart")?.toString();
    const periodEnd = form.get("periodEnd")?.toString();

    if (!tenantId || !(file instanceof File) || !type || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const key = `reports/${tenantId}/${Date.now()}-${file.name}`;
    const fileUrl = await uploadBufferToR2(key, buffer, file.type || "application/pdf");

    const today = new Date().toISOString().slice(0, 10);
    const [inserted] = await db
      .insert(report)
      .values({
        tenantId,
        type,
        title,
        periodStart: periodStart || today,
        periodEnd: periodEnd || today,
        fileUrl,
        createdBy: session.session.userId,
      })
      .returning();

    return NextResponse.json({ report: inserted });
  } catch (error) {
    console.error("[admin/reports] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
