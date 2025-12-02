import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { company, report, tenant, user } from "@/lib/db/schema";
import { uploadBufferToR2 } from "@/lib/r2-storage";
import { eq } from "drizzle-orm";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const targetUserId = form.get("userId")?.toString();
    const type = form.get("type")?.toString();
    const title = form.get("title")?.toString();

    if (!targetUserId || !(file instanceof File) || !type || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [targetUser] = await db
      .select({
        companyId: user.companyId,
        companyName: company.name,
      })
      .from(user)
      .leftJoin(company, eq(company.id, user.companyId))
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (!targetUser?.companyId) {
      return NextResponse.json({ error: "目标用户未绑定公司，无法上传报告" }, { status: 400 });
    }

    const [tenantRow] = await db
      .select({ id: tenant.id })
      .from(tenant)
      .where(eq(tenant.companyId, targetUser.companyId))
      .limit(1);

    let tenantId = tenantRow?.id;
    if (!tenantId) {
      const [createdTenant] = await db
        .insert(tenant)
        .values({
          companyId: targetUser.companyId,
          name: targetUser.companyName || "默认站点",
        })
        .returning({ id: tenant.id });
      tenantId = createdTenant.id;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const key = `reports/company-${targetUser.companyId}/${Date.now()}-${file.name}`;
    const fileUrl = await uploadBufferToR2(key, buffer, file.type || "application/pdf");

    const today = new Date().toISOString().slice(0, 10);
    const [inserted] = await db
      .insert(report)
      .values({
        tenantId,
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
    console.error("[admin/reports] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
