import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { tenant, tenantMembership, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type TenantContext = {
  tenantId: string;
  role: "admin" | "member";
};

/**
 * Ensure the current user has a tenant/membership.
 * If none exists (fresh user), create a personal tenant and set them as admin.
 */
export async function ensureTenantForUser(userId: string): Promise<TenantContext> {
  const existing = await db
    .select({
      tenantId: tenantMembership.tenantId,
      role: tenantMembership.role,
    })
    .from(tenantMembership)
    .where(eq(tenantMembership.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0] as TenantContext;
  }

  const userRecord = await db
    .select({
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const tenantId = randomUUID();
  const membershipId = randomUUID();
  const tenantName = userRecord[0]?.name || userRecord[0]?.email || "My Workspace";

  await db.insert(tenant).values({
    id: tenantId,
    name: tenantName,
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
