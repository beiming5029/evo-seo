import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dataImportJob } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { uploadBufferToR2 } from "@/lib/r2-storage";
import { eq, desc } from "drizzle-orm";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const tenantIdParam = url.searchParams.get("tenantId") || undefined;
    const { tenantId } = await ensureTenantForUser(session.session.userId, tenantIdParam);

    const jobs = await db
      .select()
      .from(dataImportJob)
      .where(eq(dataImportJob.tenantId, tenantId))
      .orderBy(desc(dataImportJob.createdAt))
      .limit(20);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("[evo/import] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const tenantIdParam = url.searchParams.get("tenantId") || undefined;
    const { tenantId, role } = await ensureTenantForUser(session.session.userId, tenantIdParam);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const type = form.get("type")?.toString();

    if (!(file instanceof File) || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const key = `imports/${tenantId}/${Date.now()}-${file.name}`;
    const sourceFileUrl = await uploadBufferToR2(key, buffer, file.type || "text/plain");

    const [job] = await db
      .insert(dataImportJob)
      .values({
        tenantId,
        type,
        sourceFileUrl,
        status: "pending",
        createdBy: session.session.userId,
      })
      .returning();

    return NextResponse.json({ job });
  } catch (error) {
    console.error("[evo/import] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
