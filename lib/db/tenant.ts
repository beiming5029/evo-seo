import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { company, tenant, tenantMembership, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export type TenantContext = {
  tenantId: string;
  role: "admin" | "member";
};

/**
 * Ensure the current user has a tenant/membership.
 * If none exists (fresh user), create a personal tenant and set them as admin.
 */
export async function ensureTenantForUser(
  userId: string,
  preferredTenantId?: string
): Promise<TenantContext> {
  let membership: TenantContext | null = null;

  if (preferredTenantId) {
    const preferred = await db
      .select({
        tenantId: tenantMembership.tenantId,
        role: tenantMembership.role,
      })
      .from(tenantMembership)
      .where(
        and(
          eq(tenantMembership.userId, userId),
          eq(tenantMembership.tenantId, preferredTenantId)
        )
      )
      .limit(1);

    membership = (preferred[0] as TenantContext | undefined) ?? null;
  }

  if (!membership) {
    if (preferredTenantId) {
      const targetTenant = await db
        .select({ id: tenant.id })
        .from(tenant)
        .where(eq(tenant.id, preferredTenantId))
        .limit(1);

      if (targetTenant[0]) {
        const membershipId = randomUUID();
        await db.insert(tenantMembership).values({
          id: membershipId,
          tenantId: preferredTenantId,
          userId,
          role: "admin",
        });
        membership = { tenantId: preferredTenantId, role: "admin" };
      }
    }
  }

  if (!membership) {
    const existing = await db
      .select({
        tenantId: tenantMembership.tenantId,
        role: tenantMembership.role,
      })
      .from(tenantMembership)
      .where(eq(tenantMembership.userId, userId))
      .limit(1);

    if (existing[0]) {
      membership = existing[0] as TenantContext;
    }
  }

  if (membership) {
    return membership;
  }

  const userRecord = await db
    .select({
      name: user.name,
      email: user.email,
      companyId: user.companyId,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const tenantId = randomUUID();
  const membershipId = randomUUID();
  const tenantName = userRecord[0]?.name || userRecord[0]?.email || "My Workspace";

  // 优先复用已有公司，缺失则创建公司并绑定用户
  let companyId = userRecord[0]?.companyId || null;
  if (companyId) {
    const existingCompany = await db
      .select({ id: company.id })
      .from(company)
      .where(eq(company.id, companyId))
      .limit(1);
    if (!existingCompany[0]) {
      companyId = null; // 记录丢失时重新创建
    }
  }

  if (!companyId) {
    const [newCompany] = await db
      .insert(company)
      .values({
        name: tenantName,
        contactEmail: userRecord[0]?.email,
      })
      .returning();
    companyId = newCompany.id;
    await db.update(user).set({ companyId }).where(eq(user.id, userId));
  }

  await db.insert(tenant).values({
    id: tenantId,
    name: tenantName,
    companyId,
  });

  await db.insert(tenantMembership).values({
    id: membershipId,
    tenantId,
    userId,
    role: "admin",
  });

  return { tenantId, role: "admin" };
}

export async function getTenantForUser(userId: string): Promise<TenantContext | null> {
  const existing = await db
    .select({
      tenantId: tenantMembership.tenantId,
      role: tenantMembership.role,
    })
    .from(tenantMembership)
    .where(eq(tenantMembership.userId, userId))
    .limit(1);

  return existing[0] ? (existing[0] as TenantContext) : null;
}

export async function listTenantsForUser(userId: string) {
  const memberships = await db
    .select({
      id: tenantMembership.tenantId,
      name: tenant.name,
      siteUrl: tenant.siteUrl,
      role: tenantMembership.role,
    })
    .from(tenantMembership)
    .leftJoin(tenant, eq(tenantMembership.tenantId, tenant.id))
    .where(eq(tenantMembership.userId, userId));

  return memberships;
}
