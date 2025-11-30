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
  preferredTenantId?: string,
  options?: { allowCrossCompany?: boolean }
): Promise<TenantContext> {
  // 获取用户公司信息
  const [userRecord] = await db
    .select({
      name: user.name,
      email: user.email,
      companyId: user.companyId,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  let companyId = userRecord?.companyId || null;

  // 补齐缺失的公司
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

  if (!companyId) {
    const tenantName = userRecord?.name || userRecord?.email || "My Workspace";
    const [newCompany] = await db
      .insert(company)
      .values({
        name: tenantName,
        contactEmail: userRecord?.email,
      })
      .returning();
    companyId = newCompany.id;
    await db.update(user).set({ companyId }).where(eq(user.id, userId));
  }

  // 先尝试使用 preferredTenantId
  if (preferredTenantId) {
    const conditions = [eq(tenant.id, preferredTenantId)] as any[];
    if (!options?.allowCrossCompany && companyId) {
      conditions.push(eq(tenant.companyId, companyId));
    }
    const [preferred] = await db
      .select({ id: tenant.id })
      .from(tenant)
      .where(conditions.length > 1 ? and(...(conditions as any)) : conditions[0])
      .limit(1);
    if (preferred) {
      await ensureMembership(userId, preferred.id);
      return { tenantId: preferred.id, role: "admin" };
    }
  }

  // 查找用户已有的 membership，限制在本公司
  const [existingMembership] = await db
    .select({
      tenantId: tenantMembership.tenantId,
      role: tenantMembership.role,
    })
    .from(tenantMembership)
    .leftJoin(tenant, eq(tenantMembership.tenantId, tenant.id))
    .where(and(eq(tenantMembership.userId, userId), eq(tenant.companyId, companyId)))
    .limit(1);
  if (existingMembership) {
    return existingMembership as TenantContext;
  }

  // 查找本公司已有站点，若存在则绑定第一个
  const [existingTenant] = await db
    .select({ id: tenant.id })
    .from(tenant)
    .where(eq(tenant.companyId, companyId))
    .limit(1);
  if (existingTenant) {
    await ensureMembership(userId, existingTenant.id);
    return { tenantId: existingTenant.id, role: "admin" };
  }

  // 创建一个新站点并绑定
  const tenantId = randomUUID();
  const tenantName = userRecord?.name || userRecord?.email || "My Workspace";
  await db.insert(tenant).values({
    id: tenantId,
    name: tenantName,
    companyId,
  });
  await ensureMembership(userId, tenantId);
  return { tenantId, role: "admin" };
}

async function ensureMembership(userId: string, tenantId: string) {
  const existing = await db
    .select({ id: tenantMembership.id })
    .from(tenantMembership)
    .where(and(eq(tenantMembership.userId, userId), eq(tenantMembership.tenantId, tenantId)))
    .limit(1);
  if (existing[0]) return;
  await db.insert(tenantMembership).values({
    id: randomUUID(),
    tenantId,
    userId,
    role: "admin",
  });
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
  const [userRecord] = await db
    .select({ companyId: user.companyId })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!userRecord?.companyId) return [];

  const tenants = await db
    .select({
      id: tenantMembership.tenantId,
      name: tenant.name,
      siteUrl: tenant.siteUrl,
      role: tenantMembership.role,
    })
    .from(tenantMembership)
    .leftJoin(tenant, eq(tenantMembership.tenantId, tenant.id))
    .where(and(eq(tenantMembership.userId, userId), eq(tenant.companyId, userRecord.companyId)));

  return tenants;
}
