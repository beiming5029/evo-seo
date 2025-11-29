import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brandConfig, company, tenant, wpIntegration } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId } = await ensureTenantForUser(session.session.userId);

    const [tenantRow, wpRow] = await Promise.all([
      db
        .select({
          tenantId: tenant.id,
          tenantName: tenant.name,
          siteUrl: tenant.siteUrl,
          companyId: company.id,
          companyName: company.name,
          contactEmail: company.contactEmail,
          validUntil: company.validUntil,
          cooperationStartDate: company.cooperationStartDate,
        })
        .from(tenant)
        .leftJoin(company, eq(tenant.companyId, company.id))
        .where(eq(tenant.id, tenantId))
        .limit(1),
      db.select().from(wpIntegration).where(eq(wpIntegration.tenantId, tenantId)).limit(1),
    ]);

    const tenantData = tenantRow[0] || null;

    // 品牌按公司 ID 查询
    const brandRow = tenantData?.companyId
      ? await db.select().from(brandConfig).where(eq(brandConfig.companyId, tenantData.companyId)).limit(1)
      : [];

    return NextResponse.json({
      account: tenantData
        ? {
            companyName: tenantData.companyName || tenantData.tenantName,
            contactEmail: tenantData.contactEmail,
            siteUrl: tenantData.siteUrl,
            validUntil: tenantData.validUntil,
            cooperationStartDate: tenantData.cooperationStartDate,
          }
        : null,
      brand: brandRow[0] || null,
      wp: wpRow[0] || null,
    });
  } catch (error) {
    console.error("[evo/settings] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
