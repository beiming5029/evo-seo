import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { listTenantsForUser } from "@/lib/db/tenant";
import { getDashboardOverview } from "@/lib/services/dashboard";
import AnalyticsClient from "./client";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: { tenantId?: string };
}) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.session?.userId) {
    redirect("/login");
  }

  const tenants = await listTenantsForUser(session.session.userId);
  const selectedTenantId = searchParams?.tenantId || tenants[0]?.id;
  const overviewPromise = getDashboardOverview({ userId: session.session.userId, tenantId: selectedTenantId });

  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent
        overviewPromise={overviewPromise}
        tenants={tenants}
        selectedTenantId={selectedTenantId}
      />
    </Suspense>
  );
}

async function AnalyticsContent({
  overviewPromise,
  tenants,
  selectedTenantId,
}: {
  overviewPromise: ReturnType<typeof getDashboardOverview>;
  tenants: Awaited<ReturnType<typeof listTenantsForUser>>;
  selectedTenantId?: string;
}) {
  const overview = await overviewPromise;
  return (
    <AnalyticsClient
      inquiries={overview.inquiries}
      traffic={overview.traffic}
      keywords={overview.keywords}
      tenants={tenants}
      selectedTenantId={selectedTenantId}
    />
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-72 rounded-xl border border-border bg-muted/40" />
        ))}
      </div>
      <div className="h-80 rounded-xl border border-border bg-muted/40" />
    </div>
  );
}

