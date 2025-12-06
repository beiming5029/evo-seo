import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { company, tenant, tenantMembership, user, wpIntegration } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      userId,
      tenantId,
      siteName,
      contactEmail,
      validUntil,
      cooperationStartDate,
      siteUrl,
      wpUsername,
      wpAppPassword,
      companyName,
    } = body as {
      userId?: string;
      tenantId?: string;
      siteName?: string;
      contactEmail?: string;
      validUntil?: string;
      cooperationStartDate?: string;
      siteUrl?: string;
      wpUsername?: string;
      wpAppPassword?: string;
      companyName?: string;
    };

    if (!userId || !siteName) {
      return NextResponse.json({ error: "缺少 userId 或 siteName" }, { status: 400 });
    }

    // 确认用户及公司
    const [targetUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const companyPayload = {
      name: companyName || siteName || "未命名公司",
      contactEmail,
      validUntil: validUntil || null,
      cooperationStartDate: cooperationStartDate || null,
    };

    let companyId = targetUser.companyId;
    // 如果已有 companyId 但记录缺失，视为无公司
    if (companyId) {
      const existingCompany = await db
        .select({ id: company.id })
        .from(company)
        .where(eq(company.id, companyId))
        .limit(1);
      if (!existingCompany[0]) {
        companyId = null;
      }
    }

    // 创建或更新公司
    if (!companyId) {
      const [createdCompany] = await db.insert(company).values(companyPayload).returning();
      companyId = createdCompany.id;
      await db.update(user).set({ companyId }).where(eq(user.id, userId));
    } else if (contactEmail || validUntil || cooperationStartDate || companyName) {
      await db.update(company).set(companyPayload).where(eq(company.id, companyId));
    }

    // 更新已有站点
    if (tenantId) {
      const [updatedTenant] = await db
        .update(tenant)
        .set({
          name: siteName,
          siteUrl,
          companyId,
        })
        .where(eq(tenant.id, tenantId))
        .returning();

      const existingWp = await db
        .select()
        .from(wpIntegration)
        .where(eq(wpIntegration.tenantId, tenantId))
        .limit(1);

      if (siteUrl && wpUsername && wpAppPassword) {
        if (existingWp[0]) {
          await db
            .update(wpIntegration)
            .set({
              siteUrl,
              wpUsername,
              wpAppPassword,
              autoPublish: true,
              status: "connected",
              updatedAt: new Date(),
            })
            .where(eq(wpIntegration.id, existingWp[0].id));
        } else {
          await db.insert(wpIntegration).values({
            tenantId,
            siteUrl,
            wpUsername,
            wpAppPassword,
            autoPublish: true,
            status: "connected",
          });
        }
      } else if (existingWp[0]) {
        // 没有提供 WP 凭据时，关闭自动发布
        await db
          .update(wpIntegration)
          .set({
            siteUrl: siteUrl || existingWp[0].siteUrl,
            autoPublish: false,
            status: "disconnected",
            updatedAt: new Date(),
          })
          .where(eq(wpIntegration.id, existingWp[0].id));
      }

      return NextResponse.json({ tenant: updatedTenant });
    }

    // 新建站点并绑定
    const newTenantId = randomUUID();
    const membershipId = randomUUID();

    const [createdTenant] = await db
      .insert(tenant)
      .values({
        id: newTenantId,
        name: siteName,
        companyId,
        siteUrl,
      })
      .returning();

    await db.insert(tenantMembership).values({
      id: membershipId,
      tenantId: newTenantId,
      userId,
      role: "admin",
    });

    if (siteUrl && wpUsername && wpAppPassword) {
      await db.insert(wpIntegration).values({
        tenantId: newTenantId,
        siteUrl,
        wpUsername,
        wpAppPassword,
        autoPublish: true,
        status: "connected",
      });
    }

    return NextResponse.json({ tenant: createdTenant });
  } catch (error) {
    console.error("[admin/bind-tenant] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
