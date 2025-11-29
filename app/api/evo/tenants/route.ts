import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureTenantForUser, listTenantsForUser } from "@/lib/db/tenant";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTenantForUser(session.session.userId);
    const tenants = await listTenantsForUser(session.session.userId);
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error("[evo/tenants] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
