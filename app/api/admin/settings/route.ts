import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { brandConfig, company, tenant } from "@/lib/db/schema";
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

    // 确定 tenantId（优先使用传入 tenantId，否则为 user 创建/获取默认租户）
    const tenantContext = incomingTenantId
      ? { tenantId: incomingTenantId }
      : await ensureTenantForUser(userId!);
    const tenantId = tenantContext.tenantId;

    // 获取站点与公司
    const [currentTenant] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);
    if (!currentTenant) {
      return NextResponse.json({ error: "站点不存在" }, { status: 404 });
    }

    let companyId = currentTenant.companyId;
    // 若站点未挂公司，先创建公司并挂到站点
    if (!companyId) {
      const [newCompany] = await db
        .insert(company)
        .values({
          name: companyName || currentTenant.name,
          contactEmail,
          validUntil: validUntil || null,
          cooperationStartDate: cooperationStartDate || null,
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
      if (Object.keys(companyUpdate).length) {
        await db.update(company).set(companyUpdate).where(eq(company.id, companyId));
      }
    }

    // 站点层仅更新站点 URL（有传才更新）
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

    // 品牌信息更新（仅当传入字段时 set）
    const brandUpdate: Record<string, string | Date | undefined | null> = {};
    if (brandVoice !== undefined) brandUpdate.brandVoice = brandVoice;
    if (productDesc !== undefined) brandUpdate.productDesc = productDesc;
    if (targetAudience !== undefined) brandUpdate.targetAudience = targetAudience;

    let brand = null;
    const existingBrand = await db
      .select()
      .from(brandConfig)
      .where(eq(brandConfig.companyId, companyId))
      .limit(1);

    if (existingBrand[0]) {
      if (Object.keys(brandUpdate).length) {
        brandUpdate.updatedAt = new Date();
        [brand] = await db
          .update(brandConfig)
          .set(brandUpdate)
          .where(eq(brandConfig.id, existingBrand[0].id))
          .returning();
      } else {
        brand = existingBrand[0];
      }
    } else {
      [brand] = await db
        .insert(brandConfig)
        .values({
          companyId,
          ...brandUpdate,
        })
        .returning();
    }

    const [updatedCompany] = await db.select().from(company).where(eq(company.id, companyId)).limit(1);

    return NextResponse.json({ tenant: updatedTenant, company: updatedCompany, brand });
  } catch (error) {
    console.error("[admin/settings] PUT error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
