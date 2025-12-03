import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { brandConfig, company, tenant, tenantMembership, user, wpIntegration } from "@/lib/db/schema";
import { and, eq, ilike, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const email = searchParams.get("email") || undefined;

    const conditions = [];
    if (userId) conditions.push(eq(user.id, userId));
    if (email) conditions.push(ilike(user.email, `%${email}%`));

    const rows = await db
      .select({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        companyId: company.id,
        companyName: company.name,
        companyContactEmail: company.contactEmail,
        companyValidUntil: company.validUntil,
        companyCooperationStartDate: company.cooperationStartDate,
        tenantId: tenant.id,
        tenantCompanyId: tenant.companyId,
        tenantName: tenant.name,
        siteUrl: sql<string | null>`coalesce(${wpIntegration.siteUrl}, ${tenant.siteUrl})`,
        brandVoice: brandConfig.brandVoice,
        productDesc: brandConfig.productDesc,
        targetAudience: brandConfig.targetAudience,
        wpUsername: wpIntegration.wpUsername,
        wpAppPassword: wpIntegration.wpAppPassword,
        userImage: user.image,
      })
      .from(user)
      .leftJoin(company, eq(user.companyId, company.id))
      .leftJoin(tenantMembership, eq(tenantMembership.userId, user.id))
      // 只返回与用户公司匹配的租户，避免同一租户挂载到多个公司
      .leftJoin(tenant, and(eq(tenantMembership.tenantId, tenant.id), eq(tenant.companyId, company.id)))
      .leftJoin(brandConfig, eq(brandConfig.companyId, company.id))
      .leftJoin(wpIntegration, eq(wpIntegration.tenantId, tenant.id))
      .where(conditions.length ? and(...conditions) : undefined);

    const grouped = new Map<
      string,
      {
        id: string;
        name: string | null;
        email: string;
        image?: string | null;
        company: {
          id?: string | null;
          name?: string | null;
          contactEmail?: string | null;
          validUntil?: string | null;
          cooperationStartDate?: string | null;
          tenants: Array<{
            id: string;
            name: string;
            siteUrl?: string | null;
            wpUsername?: string | null;
            wpAppPassword?: string | null;
          }>;
        };
        // 兼容旧结构：保留扁平 tenants，后续可下线
        tenants: Array<{
          id: string;
          name: string;
          siteUrl?: string | null;
          wpUsername?: string | null;
          wpAppPassword?: string | null;
        }>;
      }
    >();

    rows.forEach((row) => {
      if (!grouped.has(row.userId)) {
        grouped.set(row.userId, {
          id: row.userId,
          name: row.userName,
          email: row.userEmail,
          image: row.userImage,
          company: {
            id: row.companyId,
            name: row.companyName,
            contactEmail: row.companyContactEmail,
            validUntil: row.companyValidUntil,
            cooperationStartDate: row.companyCooperationStartDate,
            tenants: [],
          },
          tenants: [],
        });
      }
      if (row.tenantId && row.tenantName) {
        const tenantItem = {
          id: row.tenantId,
          name: row.tenantName,
          siteUrl: row.siteUrl,
          wpUsername: row.wpUsername,
          wpAppPassword: row.wpAppPassword,
        };
        const userItem = grouped.get(row.userId);
        userItem?.tenants.push(tenantItem); // 兼容旧字段
        // 仅在租户归属于该公司时，才挂到 company.tenants，避免跨公司串租户
        if (row.tenantCompanyId && row.companyId && row.tenantCompanyId === row.companyId) {
          userItem?.company?.tenants.push(tenantItem);
        }

        // 品牌信息挂在公司层（取首个有值的品牌配置）
        if (row.brandVoice || row.productDesc || row.targetAudience) {
          const companyBrand = userItem?.company as any;
          if (companyBrand && !companyBrand.brand) {
            companyBrand.brand = {
              brandVoice: row.brandVoice,
              productDesc: row.productDesc,
              targetAudience: row.targetAudience,
            };
          }
        }
      }
    });

    return NextResponse.json({ users: Array.from(grouped.values()) });
  } catch (error) {
    console.error("[admin/users-with-tenants] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
