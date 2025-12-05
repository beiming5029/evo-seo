import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listTenantsForUser } from "@/lib/db/tenant";
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

  return (
    <AnalyticsContent
      tenants={tenants}
      selectedTenantId={selectedTenantId}
    />
  );
}

function AnalyticsContent({
  tenants,
  selectedTenantId,
}: {
  tenants: Awaited<ReturnType<typeof listTenantsForUser>>;
  selectedTenantId?: string;
}) {
  return (
    <AnalyticsClient
      tenants={tenants}
      selectedTenantId={selectedTenantId}
    />
  );
}

