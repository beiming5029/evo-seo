import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { company, tenant } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ensureTenantForUser } from "@/lib/db/tenant";

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      tenantId: incomingTenantId,
      userId,
      companyName,
      contactEmail,
      validUntil,
      cooperationStartDate,
      siteUrl,
      brandVoice,
      productDesc,
      targetAudience,
    } = body as {
      tenantId?: string;
      userId?: string;
      companyName?: string;
      contactEmail?: string;
      validUntil?: string;
      cooperationStartDate?: string;
      siteUrl?: string;
      brandVoice?: string;
      productDesc?: string;
      targetAudience?: string;
    };

    if (!incomingTenantId && !userId) {
      return NextResponse.json({ error: "缺少 tenantId 或 userId" }, { status: 400 });
    }

    const tenantContext = incomingTenantId
      ? { tenantId: incomingTenantId }
      : await ensureTenantForUser(userId!);
    const tenantId = tenantContext.tenantId;

    const [currentTenant] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);
    if (!currentTenant) {
      return NextResponse.json({ error: "站点不存在" }, { status: 404 });
    }

    let companyId = currentTenant.companyId;
    if (!companyId) {
      const [newCompany] = await db
        .insert(company)
        .values({
          name: companyName || currentTenant.name,
          contactEmail,
          validUntil: validUntil || null,
          cooperationStartDate: cooperationStartDate || null,
          brandVoice: brandVoice ?? null,
          productDesc: productDesc ?? null,
          targetAudience: targetAudience ?? null,
        })
        .returning();
      companyId = newCompany.id;
      await db.update(tenant).set({ companyId }).where(eq(tenant.id, tenantId));
    } else {
      const companyUpdate: Record<string, string | null | undefined> = {};
      if (companyName !== undefined) companyUpdate.name = companyName;
      if (contactEmail !== undefined) companyUpdate.contactEmail = contactEmail;
      if (validUntil !== undefined) companyUpdate.validUntil = validUntil || null;
      if (cooperationStartDate !== undefined) companyUpdate.cooperationStartDate = cooperationStartDate || null;
      if (brandVoice !== undefined) companyUpdate.brandVoice = brandVoice ?? null;
      if (productDesc !== undefined) companyUpdate.productDesc = productDesc ?? null;
      if (targetAudience !== undefined) companyUpdate.targetAudience = targetAudience ?? null;
      if (Object.keys(companyUpdate).length) {
        await db.update(company).set(companyUpdate).where(eq(company.id, companyId));
      }
    }

    let updatedTenant = currentTenant;
    if (siteUrl !== undefined) {
      [updatedTenant] = await db
        .update(tenant)
        .set({
          siteUrl,
        })
        .where(eq(tenant.id, tenantId))
        .returning();
    }

    const [updatedCompany] = await db.select().from(company).where(eq(company.id, companyId)).limit(1);

    return NextResponse.json({ tenant: updatedTenant, company: updatedCompany });
  } catch (error) {
    console.error("[admin/settings] PUT error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
