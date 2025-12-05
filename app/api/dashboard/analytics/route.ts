import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listTenantsForUser } from "@/lib/db/tenant";
import { getDashboardOverview } from "@/lib/services/dashboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenants = await listTenantsForUser(session.session.userId);
    const tenantId = req.nextUrl.searchParams.get("tenantId") || tenants[0]?.id;
    if (!tenantId) {
      return NextResponse.json({ inquiries: [], traffic: [], keywords: [] });
    }

    const overview = await getDashboardOverview({
      userId: session.session.userId,
      tenantId,
      options: {
        lookbackMonths: 3,
        keywordLimit: 15,
        includePosts: false,
        includeLatestReport: false,
      },
    });

    return NextResponse.json({
      tenantId: overview.tenantId,
      inquiries: overview.inquiries,
      traffic: overview.traffic,
      keywords: overview.keywords,
    });
  } catch (error) {
    console.error("[api/dashboard/analytics] GET error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
