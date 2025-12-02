import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { report, tenant } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq, desc, inArray } from "drizzle-orm";
import { uploadBufferToR2 } from "@/lib/r2-storage";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId } = await ensureTenantForUser(session.session.userId);
    const [currentTenant] = await db
      .select({ companyId: tenant.companyId })
      .from(tenant)
      .where(eq(tenant.id, tenantId))
      .limit(1);

    if (!currentTenant?.companyId) {
      return NextResponse.json({ reports: [] });
    }

    const tenantIds = await db
      .select({ id: tenant.id })
      .from(tenant)
      .where(eq(tenant.companyId, currentTenant.companyId));
    const tenantIdList = tenantIds.map((t) => t.id);

    if (!tenantIdList.length) {
      return NextResponse.json({ reports: [] });
    }

    const reports = await db
      .select()
      .from(report)
      .where(inArray(report.tenantId, tenantIdList))
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

    if (!(file instanceof File) || !type || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [currentTenant] = await db
      .select({ companyId: tenant.companyId })
      .from(tenant)
      .where(eq(tenant.id, tenantId))
      .limit(1);

    if (!currentTenant?.companyId) {
      return NextResponse.json({ error: "用户未绑定公司" }, { status: 400 });
    }

    const tenantIds = await db
      .select({ id: tenant.id })
      .from(tenant)
      .where(eq(tenant.companyId, currentTenant.companyId));
    const targetTenantId = tenantIds[0]?.id || tenantId;

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const key = `reports/company-${currentTenant.companyId}/${Date.now()}-${file.name}`;
    const fileUrl = await uploadBufferToR2(key, buffer, file.type || "application/pdf");
    const today = new Date().toISOString().slice(0, 10);

    const [inserted] = await db
      .insert(report)
      .values({
        tenantId: targetTenantId,
        type,
        title,
        periodStart: today,
        periodEnd: today,
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
