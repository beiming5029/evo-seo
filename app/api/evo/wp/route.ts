import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wpIntegration } from "@/lib/db/schema";
import { ensureTenantForUser } from "@/lib/db/tenant";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const tenantIdParam = url.searchParams.get("tenantId") || undefined;
    const { tenantId } = await ensureTenantForUser(session.session.userId, tenantIdParam);

    const [integration] = await db
      .select()
      .from(wpIntegration)
      .where(eq(wpIntegration.tenantId, tenantId))
      .limit(1);

    return NextResponse.json({ integration: integration || null });
  } catch (error) {
    console.error("[evo/wp] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const tenantIdParam = url.searchParams.get("tenantId") || undefined;
    const { tenantId, role } = await ensureTenantForUser(session.session.userId, tenantIdParam);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      siteUrl,
      wpUsername,
      wpAppPassword,
      timezone = "Asia/Shanghai",
      publishTimeLocal = "12:00",
      // autoPublish 强制写 true，不再信任入参
      status = "connected",
    } = body;

    if (!siteUrl || !wpUsername || !wpAppPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(wpIntegration)
      .where(eq(wpIntegration.tenantId, tenantId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(wpIntegration)
        .set({
          siteUrl,
          wpUsername,
          wpAppPassword,
          timezone,
          publishTimeLocal,
          autoPublish: true,
          status,
          updatedAt: new Date(),
        })
        .where(eq(wpIntegration.id, existing.id))
        .returning();
      return NextResponse.json({ integration: updated });
    }

    const [inserted] = await db
      .insert(wpIntegration)
        .values({
          tenantId,
          siteUrl,
          wpUsername,
          wpAppPassword,
          timezone,
          publishTimeLocal,
          autoPublish: true,
          status,
        })
      .returning();

    return NextResponse.json({ integration: inserted });
  } catch (error) {
    console.error("[evo/wp] POST error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
