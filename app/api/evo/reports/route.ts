import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq, desc } from "drizzle-orm";
import { uploadBufferToR2 } from "@/lib/r2-storage";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { tenantId } = await ensureTenantForUser(session.session.userId);

    const reports = await db
      .select()
      .from(report)
      .where(eq(report.tenantId, tenantId))
      .orderBy(desc(report.createdAt));

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("[evo/reports] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { tenantId, role } = await ensureTenantForUser(session.session.userId);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const type = form.get("type")?.toString();
    const title = form.get("title")?.toString();
    const periodStart = form.get("periodStart")?.toString();
    const periodEnd = form.get("periodEnd")?.toString();

    if (!(file instanceof File) || !type || !title || !periodStart || !periodEnd) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const key = `reports/${tenantId}/${Date.now()}-${file.name}`;
    const fileUrl = await uploadBufferToR2(key, buffer, file.type || "application/pdf");

    const [inserted] = await db
      .insert(report)
      .values({
        tenantId,
        type,
        title,
        periodStart,
        periodEnd,
        fileUrl,
        createdBy: session.session.userId,
      })
      .returning();

    return NextResponse.json({ report: inserted });
  } catch (error) {
    console.error("[evo/reports] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
